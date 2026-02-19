import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameSettings, Trial, GameState, GameResults, GamePhase } from './types';

const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
const GRID_SIZE = 9;

export function generateTrials(settings: GameSettings): Trial[] {
  const { nLevel, trialCount } = settings;
  const trials: Trial[] = [];

  for (let i = 0; i < trialCount; i++) {
    let position = Math.floor(Math.random() * GRID_SIZE);
    let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]!;

    // Ensure some matches occur (roughly 25% chance for each type when possible)
    if (i >= nLevel) {
      const nBackTrial = trials[i - nLevel]!;
      if (Math.random() < 0.25) {
        position = nBackTrial.position;
      }
      if (Math.random() < 0.25) {
        letter = nBackTrial.letter;
      }
    }

    trials.push({ position, letter });
  }

  return trials;
}

export function computeMatches(trials: Trial[], nLevel: number): { positionMatches: boolean[]; audioMatches: boolean[] } {
  const positionMatches: boolean[] = [];
  const audioMatches: boolean[] = [];

  for (let i = 0; i < trials.length; i++) {
    if (i < nLevel) {
      positionMatches.push(false);
      audioMatches.push(false);
    } else {
      const current = trials[i]!;
      const nBack = trials[i - nLevel]!;
      positionMatches.push(current.position === nBack.position);
      audioMatches.push(current.letter === nBack.letter);
    }
  }

  return { positionMatches, audioMatches };
}

export function calculateResults(state: GameState, nLevel: number): GameResults {
  console.log('calculateResults called');
  console.log('positionMatches:', state.positionMatches);
  console.log('audioMatches:', state.audioMatches);
  console.log('userPositionResponses:', state.userPositionResponses);
  console.log('userAudioResponses:', state.userAudioResponses);

  let positionHits = 0;
  let positionMisses = 0;
  let positionFalseAlarms = 0;
  let audioHits = 0;
  let audioMisses = 0;
  let audioFalseAlarms = 0;

  for (let i = nLevel; i < state.trials.length; i++) {
    const posMatch = state.positionMatches[i] === true;
    const audMatch = state.audioMatches[i] === true;
    const userPos = state.userPositionResponses[i] === true;
    const userAud = state.userAudioResponses[i] === true;

    if (posMatch && userPos) positionHits++;
    else if (posMatch && !userPos) positionMisses++;
    else if (!posMatch && userPos) positionFalseAlarms++;

    if (audMatch && userAud) audioHits++;
    else if (audMatch && !userAud) audioMisses++;
    else if (!audMatch && userAud) audioFalseAlarms++;
  }

  const totalPositionTargets = positionHits + positionMisses;
  const totalAudioTargets = audioHits + audioMisses;

  // If no targets existed, accuracy depends on whether user had false alarms
  // (100% if no false alarms, 0% if any false alarms)
  // Each false alarm subtracts 5 points from the final score, clamped at 0.
  const positionBaseAccuracy = totalPositionTargets > 0
    ? (positionHits / totalPositionTargets) * 100
    : (positionFalseAlarms === 0 ? 100 : 0);
  const positionAccuracy = Math.max(0, positionBaseAccuracy - positionFalseAlarms * 5);

  const audioBaseAccuracy = totalAudioTargets > 0
    ? (audioHits / totalAudioTargets) * 100
    : (audioFalseAlarms === 0 ? 100 : 0);
  const audioAccuracy = Math.max(0, audioBaseAccuracy - audioFalseAlarms * 5);

  return {
    positionHits,
    positionMisses,
    positionFalseAlarms,
    audioHits,
    audioMisses,
    audioFalseAlarms,
    positionAccuracy,
    audioAccuracy,
  };
}

const DEFAULT_SETTINGS: GameSettings = {
  nLevel: 2,
  trialCount: 20,
  intervalMs: 3000,
};

export function useGame() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<GamePhase>('settings');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [results, setResults] = useState<GameResults | null>(null);
  const [currentPositionResponse, setCurrentPositionResponse] = useState(false);
  const [currentAudioResponse, setCurrentAudioResponse] = useState(false);
  const [showPosition, setShowPosition] = useState(false);

  const timerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenTrialRef = useRef<number>(-1);
  const positionResponseRef = useRef(false);
  const audioResponseRef = useRef(false);
  const settingsRef = useRef(settings);

  // Keep settings ref in sync
  settingsRef.current = settings;

  // iOS Safari only allows speechSynthesis.speak() from within a user gesture.
  // Calling this function synchronously inside a button-click handler "unlocks"
  // the API so subsequent programmatic calls (e.g. from setTimeout) also work.
  const unlockSpeechSynthesis = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      unlock.rate = 16; // finish as fast as possible
      window.speechSynthesis.speak(unlock);
    }
  }, []);

  const speakLetter = useCallback((letter: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const advanceTrial = useCallback(() => {
    const posResponse = positionResponseRef.current;
    const audResponse = audioResponseRef.current;

    // Reset refs immediately before any async operations
    positionResponseRef.current = false;
    audioResponseRef.current = false;

    console.log('advanceTrial called, responses:', posResponse, audResponse);

    setGameState((prev) => {
      if (!prev || !prev.isRunning) return prev;

      console.log('Inside setGameState, trial:', prev.currentTrialIndex, 'responses:', posResponse, audResponse);

      const newUserPositionResponses = [...prev.userPositionResponses];
      const newUserAudioResponses = [...prev.userAudioResponses];
      newUserPositionResponses[prev.currentTrialIndex] = posResponse;
      newUserAudioResponses[prev.currentTrialIndex] = audResponse;

      const nextIndex = prev.currentTrialIndex + 1;

      if (nextIndex >= prev.trials.length) {
        const finalState: GameState = {
          ...prev,
          currentTrialIndex: nextIndex,
          isRunning: false,
          userPositionResponses: newUserPositionResponses,
          userAudioResponses: newUserAudioResponses,
        };
        const gameResults = calculateResults(finalState, settingsRef.current.nLevel);
        setResults(gameResults);
        setPhase('results');
        return finalState;
      }

      return {
        ...prev,
        currentTrialIndex: nextIndex,
        userPositionResponses: newUserPositionResponses,
        userAudioResponses: newUserAudioResponses,
      };
    });

    setCurrentPositionResponse(false);
    setCurrentAudioResponse(false);
  }, []);

  useEffect(() => {
    if (gameState?.isRunning && gameState.currentTrialIndex < gameState.trials.length) {
      // Handle initial delay before first trial (currentTrialIndex === -1)
      if (gameState.currentTrialIndex === -1) {
        timerRef.current = window.setTimeout(() => {
          setGameState((prev) => {
            if (!prev || !prev.isRunning) return prev;
            return { ...prev, currentTrialIndex: 0 };
          });
        }, settings.intervalMs);

        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
        };
      }

      const currentTrial = gameState.trials[gameState.currentTrialIndex];
      if (currentTrial && lastSpokenTrialRef.current !== gameState.currentTrialIndex) {
        lastSpokenTrialRef.current = gameState.currentTrialIndex;
        speakLetter(currentTrial.letter);

        setShowPosition(true);
        flashTimerRef.current = window.setTimeout(() => {
          setShowPosition(false);
        }, 500);
      }

      timerRef.current = window.setTimeout(() => {
        advanceTrial();
      }, settings.intervalMs);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (flashTimerRef.current) {
          clearTimeout(flashTimerRef.current);
        }
      };
    }
  }, [gameState?.isRunning, gameState?.currentTrialIndex, settings.intervalMs, speakLetter, advanceTrial, gameState?.trials]);

  const startGame = useCallback(() => {
    unlockSpeechSynthesis();

    const trials = generateTrials(settings);
    const { positionMatches, audioMatches } = computeMatches(trials, settings.nLevel);

    lastSpokenTrialRef.current = -1;
    positionResponseRef.current = false;
    audioResponseRef.current = false;

    setGameState({
      trials,
      currentTrialIndex: -1, // Start at -1 for initial delay before first trial
      isRunning: true,
      positionMatches,
      audioMatches,
      userPositionResponses: new Array(trials.length).fill(false),
      userAudioResponses: new Array(trials.length).fill(false),
    });

    setCurrentPositionResponse(false);
    setCurrentAudioResponse(false);
    setPhase('playing');
  }, [settings, unlockSpeechSynthesis]);

  const startGameWithLevel = useCallback((nLevel: number) => {
    unlockSpeechSynthesis();

    const newSettings = { ...settings, nLevel };
    setSettings(newSettings);

    const trials = generateTrials(newSettings);
    const { positionMatches, audioMatches } = computeMatches(trials, nLevel);

    lastSpokenTrialRef.current = -1;
    positionResponseRef.current = false;
    audioResponseRef.current = false;

    setGameState({
      trials,
      currentTrialIndex: -1,
      isRunning: true,
      positionMatches,
      audioMatches,
      userPositionResponses: new Array(trials.length).fill(false),
      userAudioResponses: new Array(trials.length).fill(false),
    });

    setCurrentPositionResponse(false);
    setCurrentAudioResponse(false);
    setPhase('playing');
  }, [settings, unlockSpeechSynthesis]);

  const respondPosition = useCallback(() => {
    console.log('respondPosition called');
    positionResponseRef.current = true;
    setCurrentPositionResponse(true);
  }, []);

  const respondAudio = useCallback(() => {
    console.log('respondAudio called');
    audioResponseRef.current = true;
    setCurrentAudioResponse(true);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setGameState(null);
    setResults(null);
    setPhase('settings');
    positionResponseRef.current = false;
    audioResponseRef.current = false;
    setCurrentPositionResponse(false);
    setCurrentAudioResponse(false);
    setShowPosition(false);
    lastSpokenTrialRef.current = -1;
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    settings,
    updateSettings,
    phase,
    gameState,
    results,
    currentPositionResponse,
    currentAudioResponse,
    showPosition,
    startGame,
    startGameWithLevel,
    respondPosition,
    respondAudio,
    resetGame,
  };
}
