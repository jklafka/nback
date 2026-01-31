import { useEffect } from 'react';
import { useGame } from './useGame';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { Settings } from './components/Settings';
import { Results } from './components/Results';
import './App.css';

export function App() {
  const {
    settings,
    updateSettings,
    phase,
    gameState,
    results,
    currentPositionResponse,
    currentAudioResponse,
    showPosition,
    startGame,
    respondPosition,
    respondAudio,
    resetGame,
  } = useGame();

  const currentTrial = gameState?.trials[gameState.currentTrialIndex] ?? null;
  const canRespond = gameState?.isRunning && gameState.currentTrialIndex >= settings.nLevel;

  useEffect(() => {
    if (phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canRespond) return;
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        respondPosition();
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        respondAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, respondPosition, respondAudio, canRespond]);

  return (
    <div className="app">
      {phase === 'settings' && (
        <Settings
          settings={settings}
          onUpdate={updateSettings}
          onStart={startGame}
        />
      )}

      {phase === 'playing' && gameState && (
        <div className="game">
          <div className="game-header">
            <span className="level-badge">{settings.nLevel}-Back</span>
          </div>

          <Grid currentTrial={showPosition ? currentTrial : null} />

          <Controls
            onPositionMatch={respondPosition}
            onAudioMatch={respondAudio}
            positionPressed={currentPositionResponse}
            audioPressed={currentAudioResponse}
            disabled={!canRespond}
          />

          <button className="quit-btn" onClick={resetGame}>
            Quit
          </button>
        </div>
      )}

      {phase === 'results' && results && (
        <Results
          results={results}
          nLevel={settings.nLevel}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
