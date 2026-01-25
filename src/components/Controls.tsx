interface ControlsProps {
  onPositionMatch: () => void;
  onAudioMatch: () => void;
  positionPressed: boolean;
  audioPressed: boolean;
  disabled: boolean;
}

export function Controls({
  onPositionMatch,
  onAudioMatch,
  positionPressed,
  audioPressed,
  disabled,
}: ControlsProps) {
  return (
    <div className="controls">
      <button
        className={`control-btn position-btn ${positionPressed ? 'pressed' : ''}`}
        onClick={onPositionMatch}
        disabled={disabled || positionPressed}
      >
        <span className="key-hint">F</span>
        Position Match
      </button>
      <button
        className={`control-btn audio-btn ${audioPressed ? 'pressed' : ''}`}
        onClick={onAudioMatch}
        disabled={disabled || audioPressed}
      >
        <span className="key-hint">J</span>
        Audio Match
      </button>
    </div>
  );
}
