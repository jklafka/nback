import type { Trial } from '../types';

interface GridProps {
  currentTrial: Trial | null;
}

export function Grid({ currentTrial }: GridProps) {
  return (
    <div className="grid">
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className={`grid-cell ${currentTrial?.position === i ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
