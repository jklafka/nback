import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { generateTrials, computeMatches, calculateResults, useGame } from './useGame';
import type { GameState, Trial } from './types';

const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

describe('generateTrials', () => {
  it('returns the correct number of trials', () => {
    const trials = generateTrials({ nLevel: 2, trialCount: 20, intervalMs: 3000 });
    expect(trials).toHaveLength(20);
  });

  it('each trial has valid position (0-8) and letter from LETTERS set', () => {
    const trials = generateTrials({ nLevel: 2, trialCount: 50, intervalMs: 3000 });
    for (const trial of trials) {
      expect(trial.position).toBeGreaterThanOrEqual(0);
      expect(trial.position).toBeLessThanOrEqual(8);
      expect(Number.isInteger(trial.position)).toBe(true);
      expect(LETTERS).toContain(trial.letter);
    }
  });

  it('injects matches for trials >= nLevel with seeded randomness', () => {
    // Seed Math.random to always return < 0.25 so matches are forced
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const trials = generateTrials({ nLevel: 2, trialCount: 6, intervalMs: 3000 });

    // With random always < 0.25, trials[i] should match trials[i-2] for i >= 2
    for (let i = 2; i < trials.length; i++) {
      expect(trials[i]!.position).toBe(trials[i - 2]!.position);
      expect(trials[i]!.letter).toBe(trials[i - 2]!.letter);
    }

    mockRandom.mockRestore();
  });

  it('handles nLevel equal to trialCount (no matchable trials)', () => {
    const trials = generateTrials({ nLevel: 5, trialCount: 5, intervalMs: 3000 });
    expect(trials).toHaveLength(5);
    for (const trial of trials) {
      expect(trial.position).toBeGreaterThanOrEqual(0);
      expect(trial.position).toBeLessThanOrEqual(8);
      expect(LETTERS).toContain(trial.letter);
    }
  });

  it('handles nLevel = 1', () => {
    const trials = generateTrials({ nLevel: 1, trialCount: 10, intervalMs: 3000 });
    expect(trials).toHaveLength(10);
    for (const trial of trials) {
      expect(trial.position).toBeGreaterThanOrEqual(0);
      expect(trial.position).toBeLessThanOrEqual(8);
      expect(LETTERS).toContain(trial.letter);
    }
  });
});

describe('computeMatches', () => {
  it('first nLevel trials are always false for both dimensions', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 0, letter: 'C' },
      { position: 0, letter: 'C' },
      { position: 0, letter: 'C' },
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    expect(positionMatches[0]).toBe(false);
    expect(positionMatches[1]).toBe(false);
    expect(audioMatches[0]).toBe(false);
    expect(audioMatches[1]).toBe(false);
  });

  it('correctly detects position matches', () => {
    const trials: Trial[] = [
      { position: 3, letter: 'C' },
      { position: 5, letter: 'H' },
      { position: 3, letter: 'K' }, // position match with trial 0
      { position: 1, letter: 'L' }, // no position match with trial 1
    ];
    const { positionMatches } = computeMatches(trials, 2);

    expect(positionMatches[2]).toBe(true);
    expect(positionMatches[3]).toBe(false);
  });

  it('correctly detects audio/letter matches', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 2, letter: 'C' }, // audio match with trial 0
      { position: 3, letter: 'K' }, // no audio match with trial 1
    ];
    const { audioMatches } = computeMatches(trials, 2);

    expect(audioMatches[2]).toBe(true);
    expect(audioMatches[3]).toBe(false);
  });

  it('detects simultaneous position + audio matches', () => {
    const trials: Trial[] = [
      { position: 4, letter: 'R' },
      { position: 7, letter: 'S' },
      { position: 4, letter: 'R' }, // both match
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    expect(positionMatches[2]).toBe(true);
    expect(audioMatches[2]).toBe(true);
  });

  it('no false matches when all trials are unique', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 2, letter: 'K' },
      { position: 3, letter: 'L' },
      { position: 4, letter: 'Q' },
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    for (let i = 2; i < trials.length; i++) {
      expect(positionMatches[i]).toBe(false);
      expect(audioMatches[i]).toBe(false);
    }
  });

  it('all trials identical means all matches after nLevel', () => {
    const trials: Trial[] = Array.from({ length: 5 }, () => ({
      position: 4,
      letter: 'R',
    }));
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    expect(positionMatches[0]).toBe(false);
    expect(positionMatches[1]).toBe(false);
    for (let i = 2; i < 5; i++) {
      expect(positionMatches[i]).toBe(true);
      expect(audioMatches[i]).toBe(true);
    }
  });
});

describe('calculateResults', () => {
  function makeState(overrides: Partial<GameState> & { trials: Trial[] }): GameState {
    return {
      currentTrialIndex: overrides.trials.length,
      isRunning: false,
      positionMatches: [],
      audioMatches: [],
      userPositionResponses: [],
      userAudioResponses: [],
      ...overrides,
    };
  }

  it('perfect game: all hits, no misses, no false alarms → 100% accuracy', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 0, letter: 'C' }, // both match
      { position: 1, letter: 'H' }, // both match
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    const state = makeState({
      trials,
      positionMatches,
      audioMatches,
      userPositionResponses: [false, false, true, true],
      userAudioResponses: [false, false, true, true],
    });

    const results = calculateResults(state, 2);
    expect(results.positionAccuracy).toBe(100);
    expect(results.audioAccuracy).toBe(100);
    expect(results.positionHits).toBe(2);
    expect(results.positionMisses).toBe(0);
    expect(results.positionFalseAlarms).toBe(0);
  });

  it('all misses: matches exist but user never responded → 0% accuracy', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 0, letter: 'C' }, // both match
      { position: 1, letter: 'H' }, // both match
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    const state = makeState({
      trials,
      positionMatches,
      audioMatches,
      userPositionResponses: [false, false, false, false],
      userAudioResponses: [false, false, false, false],
    });

    const results = calculateResults(state, 2);
    expect(results.positionAccuracy).toBe(0);
    expect(results.audioAccuracy).toBe(0);
    expect(results.positionMisses).toBe(2);
    expect(results.audioMisses).toBe(2);
  });

  it('all false alarms: no matches but user responded every time → 0% accuracy', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 2, letter: 'K' },
      { position: 3, letter: 'L' },
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    const state = makeState({
      trials,
      positionMatches,
      audioMatches,
      userPositionResponses: [false, false, true, true],
      userAudioResponses: [false, false, true, true],
    });

    const results = calculateResults(state, 2);
    expect(results.positionAccuracy).toBe(0);
    expect(results.audioAccuracy).toBe(0);
    expect(results.positionFalseAlarms).toBe(2);
    expect(results.audioFalseAlarms).toBe(2);
  });

  it('mixed results: verify hit/miss/false alarm counting', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 0, letter: 'C' }, // both match with [0] - user: pos yes, aud no
      { position: 1, letter: 'L' }, // pos match with [1], no aud match - user: pos no, aud yes
      { position: 0, letter: 'C' }, // both match with [2] - user: pos yes, aud yes
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    const state = makeState({
      trials,
      positionMatches,
      audioMatches,
      userPositionResponses: [false, false, true, false, true],
      userAudioResponses: [false, false, false, true, true],
    });

    const results = calculateResults(state, 2);
    expect(results.positionHits).toBe(2);
    expect(results.positionMisses).toBe(1);
    expect(results.positionFalseAlarms).toBe(0);
    expect(results.audioHits).toBe(1);
    expect(results.audioMisses).toBe(1);
    expect(results.audioFalseAlarms).toBe(1);
    expect(results.positionAccuracy).toBeCloseTo(66.67, 0);
    expect(results.audioAccuracy).toBe(45);
  });

  it('no targets exist, no false alarms → 100% accuracy', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 2, letter: 'K' },
      { position: 3, letter: 'L' },
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    const state = makeState({
      trials,
      positionMatches,
      audioMatches,
      userPositionResponses: [false, false, false, false],
      userAudioResponses: [false, false, false, false],
    });

    const results = calculateResults(state, 2);
    expect(results.positionAccuracy).toBe(100);
    expect(results.audioAccuracy).toBe(100);
  });

  it('no targets exist, with false alarms → 0% accuracy', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 1, letter: 'H' },
      { position: 2, letter: 'K' },
      { position: 3, letter: 'L' },
    ];
    const { positionMatches, audioMatches } = computeMatches(trials, 2);

    const state = makeState({
      trials,
      positionMatches,
      audioMatches,
      userPositionResponses: [false, false, true, false],
      userAudioResponses: [false, false, false, true],
    });

    const results = calculateResults(state, 2);
    expect(results.positionAccuracy).toBe(0);
    expect(results.audioAccuracy).toBe(0);
  });

  it('only counts trials from index nLevel onward', () => {
    const trials: Trial[] = [
      { position: 0, letter: 'C' },
      { position: 0, letter: 'C' }, // would be position+audio match with nLevel=1, but nLevel=2 so ignored
      { position: 2, letter: 'K' },
      { position: 3, letter: 'L' },
    ];

    const state = makeState({
      trials,
      positionMatches: [false, false, false, false],
      audioMatches: [false, false, false, false],
      // User responded true at index 0 and 1, but those should be ignored for nLevel=2
      userPositionResponses: [true, true, false, false],
      userAudioResponses: [true, true, false, false],
    });

    const results = calculateResults(state, 2);
    // Only indices 2 and 3 are counted; no matches, no user responses → 100%
    expect(results.positionAccuracy).toBe(100);
    expect(results.audioAccuracy).toBe(100);
    expect(results.positionFalseAlarms).toBe(0);
    expect(results.audioFalseAlarms).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// iOS Safari audio unlock tests
//
// iOS Safari only allows speechSynthesis.speak() when called within a user
// gesture. We unlock it by calling speak(emptyUtterance) synchronously inside
// startGame / startGameWithLevel (both triggered by button clicks). These
// tests verify that unlock behaviour without advancing fake timers so that
// the timer-based speakLetter calls don't interfere.
// ---------------------------------------------------------------------------

describe('useGame iOS Safari audio unlock', () => {
  const mockCancel = vi.fn();
  const mockSpeak = vi.fn();

  // jsdom doesn't ship SpeechSynthesisUtterance; provide a minimal stand-in.
  class MockSpeechSynthesisUtterance {
    text: string;
    rate = 1;
    pitch = 1;
    constructor(text: string) {
      this.text = text;
    }
  }

  beforeEach(() => {
    vi.useFakeTimers();
    mockCancel.mockClear();
    mockSpeak.mockClear();

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      value: { cancel: mockCancel, speak: mockSpeak },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('startGame speaks an empty utterance to unlock iOS Safari speech synthesis', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const unlockArg = mockSpeak.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance;
    expect(unlockArg?.text).toBe('');
    expect(unlockArg?.volume).toBe(0);
    expect(unlockArg?.rate).toBe(16);
  });

  it('startGame calls cancel before the unlock speak', () => {
    const callOrder: string[] = [];
    mockCancel.mockImplementation(() => callOrder.push('cancel'));
    mockSpeak.mockImplementation(() => callOrder.push('speak'));

    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    expect(callOrder[0]).toBe('cancel');
    expect(callOrder[1]).toBe('speak');
  });

  it('startGameWithLevel speaks an empty utterance to unlock iOS Safari speech synthesis', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGameWithLevel(3);
    });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const unlockArg = mockSpeak.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance;
    expect(unlockArg?.text).toBe('');
    expect(unlockArg?.volume).toBe(0);
    expect(unlockArg?.rate).toBe(16);
  });

  it('startGameWithLevel calls cancel before the unlock speak', () => {
    const callOrder: string[] = [];
    mockCancel.mockImplementation(() => callOrder.push('cancel'));
    mockSpeak.mockImplementation(() => callOrder.push('speak'));

    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGameWithLevel(3);
    });

    expect(callOrder[0]).toBe('cancel');
    expect(callOrder[1]).toBe('speak');
  });

  it('startGame does not throw when speechSynthesis is unavailable', () => {
    delete (window as any).speechSynthesis;

    const { result } = renderHook(() => useGame());

    expect(() => {
      act(() => {
        result.current.startGame();
      });
    }).not.toThrow();
  });

  it('startGameWithLevel does not throw when speechSynthesis is unavailable', () => {
    delete (window as any).speechSynthesis;

    const { result } = renderHook(() => useGame());

    expect(() => {
      act(() => {
        result.current.startGameWithLevel(2);
      });
    }).not.toThrow();
  });
});
