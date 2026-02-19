import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { GameResults } from '../types';

export type Recommendation = 'increase' | 'decrease' | 'stay';

export function getRecommendation(
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

export function getRecommendationText(recommendation: Recommendation, nLevel: number): string {
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

export function getRecommendedLevel(recommendation: Recommendation, nLevel: number): number {
  switch (recommendation) {
    case 'increase':
      return nLevel + 1;
    case 'decrease':
      return nLevel - 1;
    case 'stay':
      return nLevel;
  }
}

export function Results({ results, nLevel, onRestart, onStartWithLevel }: ResultsProps) {
  const isPerfect = results.positionAccuracy === 100 && results.audioAccuracy === 100;

  useEffect(() => {
    if (!isPerfect) return;
    const end = Date.now() + 3000;
    let rafId: number;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) rafId = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(rafId);
  }, [isPerfect]);

  const recommendation = getRecommendation(results.positionAccuracy, results.audioAccuracy, nLevel);
  const recommendedLevel = getRecommendedLevel(recommendation, nLevel);

  const handleRecommendationClick = () => {
    onStartWithLevel(recommendedLevel);
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
        className={`recommendation ${recommendation} clickable`}
        onClick={handleRecommendationClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRecommendationClick(); }}
      >
        {getRecommendationText(recommendation, nLevel)}
      </div>

      <button className="start-btn" onClick={onRestart}>
        Play Again
      </button>
    </div>
  );
}
