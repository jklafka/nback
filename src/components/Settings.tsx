import type { GameSettings } from '../types';

interface SettingsProps {
  settings: GameSettings;
  onUpdate: (settings: Partial<GameSettings>) => void;
  onStart: () => void;
}

export function Settings({ settings, onUpdate, onStart }: SettingsProps) {
  return (
    <div className="settings">
      <h1>Dual N-Back</h1>
      <p className="description">
        Match the current position and letter with the one from <strong>N steps back</strong>.
        Press <kbd>F</kbd> for position match, <kbd>J</kbd> for audio match.
      </p>

      <div className="setting-group">
        <label htmlFor="nLevel">N-Level</label>
        <div className="setting-control">
          <button
            onClick={() => { const n = Math.max(1, settings.nLevel - 1); onUpdate({ nLevel: n, trialCount: n * 10 }); }}
            disabled={settings.nLevel <= 1}
          >
            -
          </button>
          <span id="nLevel" className="setting-value">{settings.nLevel}</span>
          <button
            onClick={() => { const n = Math.min(9, settings.nLevel + 1); onUpdate({ nLevel: n, trialCount: n * 10 }); }}
            disabled={settings.nLevel >= 9}
          >
            +
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label htmlFor="trialCount">Trials</label>
        <div className="setting-control">
          <button
            onClick={() => onUpdate({ trialCount: Math.max(10, settings.trialCount - 5) })}
            disabled={settings.trialCount <= 10}
          >
            -
          </button>
          <span id="trialCount" className="setting-value">{settings.trialCount}</span>
          <button
            onClick={() => onUpdate({ trialCount: Math.min(100, settings.trialCount + 5) })}
            disabled={settings.trialCount >= 100}
          >
            +
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label htmlFor="interval">Interval</label>
        <div className="setting-control">
          <button
            onClick={() => onUpdate({ intervalMs: Math.max(1500, settings.intervalMs - 500) })}
            disabled={settings.intervalMs <= 1500}
          >
            -
          </button>
          <span id="interval" className="setting-value">{settings.intervalMs / 1000}s</span>
          <button
            onClick={() => onUpdate({ intervalMs: Math.min(5000, settings.intervalMs + 500) })}
            disabled={settings.intervalMs >= 5000}
          >
            +
          </button>
        </div>
      </div>

      <button className="start-btn" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
