import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Results } from './Results';
import type { GameResults } from '../types';

describe('Results component', () => {
  const defaultResults: GameResults = {
    positionHits: 5,
    positionMisses: 2,
    positionFalseAlarms: 1,
    audioHits: 4,
    audioMisses: 3,
    audioFalseAlarms: 0,
    positionAccuracy: 71,
    audioAccuracy: 57,
  };

  const defaultProps = {
    results: defaultResults,
    nLevel: 2,
    onRestart: vi.fn(),
    onStartWithLevel: vi.fn(),
  };

  it('displays all result values', () => {
    render(<Results {...defaultProps} />);

    expect(screen.getByText('2-Back Complete')).toBeInTheDocument();

    // Position stats
    expect(screen.getByText('5')).toBeInTheDocument(); // positionHits
    // Audio stats
    expect(screen.getByText('4')).toBeInTheDocument(); // audioHits
  });

  it('shows recommendation text', () => {
    render(<Results {...defaultProps} />);
    // With 71% position, < 75 threshold → decrease at nLevel=2
    expect(screen.getByText(/1-Back/)).toBeInTheDocument();
  });

  it('recommendation is clickable and calls onStartWithLevel', async () => {
    const onStartWithLevel = vi.fn();
    const user = userEvent.setup();

    render(
      <Results {...defaultProps} onStartWithLevel={onStartWithLevel} />
    );

    const recommendation = screen.getByRole('button', { name: /1-Back/ });
    await user.click(recommendation);
    expect(onStartWithLevel).toHaveBeenCalledWith(1); // nLevel 2 decrease → 1
  });

  it('shows increase recommendation when both accuracies >= 90%', () => {
    const highResults: GameResults = {
      ...defaultResults,
      positionAccuracy: 95,
      audioAccuracy: 92,
    };

    render(<Results {...defaultProps} results={highResults} />);
    expect(screen.getByText(/3-Back/)).toBeInTheDocument();
  });

  it('Play Again button calls onRestart', async () => {
    const onRestart = vi.fn();
    const user = userEvent.setup();

    render(<Results {...defaultProps} onRestart={onRestart} />);

    await user.click(screen.getByText('Play Again'));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
