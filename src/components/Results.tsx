import type { GameResults } from '../types';

type Recommendation = 'increase' | 'decrease' | 'stay';

function getRecommendation(
  positionAccuracy: number,
  audioAccuracy: number,
  nLevel: number
): Recommendation {
  // If either score < 75%, recommend decreasing (unless at n=1)
  if (positionAccuracy < 75 || audioAccuracy < 75) {
    return nLevel === 1 ? 'stay' : 'decrease';
  }
  // If both scores >= 90%, recommend increasing
  if (positionAccuracy >= 90 && audioAccuracy >= 90) {
    return 'increase';
  }
  // Otherwise, stay at the same level
  return 'stay';
}

function getRecommendationText(recommendation: Recommendation, nLevel: number): string {
  switch (recommendation) {
    case 'increase':
      return `Great work! Try ${nLevel + 1}-Back next.`;
    case 'decrease':
      return `Consider trying ${nLevel - 1}-Back to build consistency.`;
    case 'stay':
      return `Keep practicing at ${nLevel}-Back.`;
  }
}

interface ResultsProps {
  results: GameResults;
  nLevel: number;
  onRestart: () => void;
  onStartWithLevel: (nLevel: number) => void;
}

function getRecommendedLevel(recommendation: Recommendation, nLevel: number): number | null {
  switch (recommendation) {
    case 'increase':
      return nLevel + 1;
    case 'decrease':
      return nLevel - 1;
    case 'stay':
      return null;
  }
}

export function Results({ results, nLevel, onRestart, onStartWithLevel }: ResultsProps) {
  const recommendation = getRecommendation(results.positionAccuracy, results.audioAccuracy, nLevel);
  const recommendedLevel = getRecommendedLevel(recommendation, nLevel);
  const isClickable = recommendedLevel !== null;

  const handleRecommendationClick = () => {
    if (recommendedLevel !== null) {
      onStartWithLevel(recommendedLevel);
    }
  };

  return (
    <div className="results">
      <h2>Results</h2>
      <p className="level-info">{nLevel}-Back Complete</p>

      <div className="results-grid">
        <div className="result-section">
          <h3>Position</h3>
          <div className="result-stat">
            <span className="stat-label">Hits</span>
            <span className="stat-value success">{results.positionHits}</span>
          </div>
          <div className="result-stat">
            <span className="stat-label">Misses</span>
            <span className="stat-value error">{results.positionMisses}</span>
          </div>
          <div className="result-stat">
            <span className="stat-label">False Alarms</span>
            <span className="stat-value warning">{results.positionFalseAlarms}</span>
          </div>
          <div className="result-stat accuracy">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{results.positionAccuracy.toFixed(0)}%</span>
          </div>
        </div>

        <div className="result-section">
          <h3>Audio</h3>
          <div className="result-stat">
            <span className="stat-label">Hits</span>
            <span className="stat-value success">{results.audioHits}</span>
          </div>
          <div className="result-stat">
            <span className="stat-label">Misses</span>
            <span className="stat-value error">{results.audioMisses}</span>
          </div>
          <div className="result-stat">
            <span className="stat-label">False Alarms</span>
            <span className="stat-value warning">{results.audioFalseAlarms}</span>
          </div>
          <div className="result-stat accuracy">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{results.audioAccuracy.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div
        className={`recommendation ${recommendation}${isClickable ? ' clickable' : ''}`}
        onClick={isClickable ? handleRecommendationClick : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleRecommendationClick(); } : undefined}
      >
        {getRecommendationText(recommendation, nLevel)}
      </div>

      <button className="start-btn" onClick={onRestart}>
        Play Again
      </button>
    </div>
  );
}
