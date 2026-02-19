import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders 9 grid cells', () => {
    const { container } = render(<Grid currentTrial={null} />);
    const cells = container.querySelectorAll('.grid-cell');
    expect(cells).toHaveLength(9);
  });

  it('highlights correct cell when currentTrial provided', () => {
    const { container } = render(
      <Grid currentTrial={{ position: 4, letter: 'C' }} />
    );
    const cells = container.querySelectorAll('.grid-cell');
    expect(cells[4]).toHaveClass('active');
    // Other cells should not be active
    for (let i = 0; i < 9; i++) {
      if (i !== 4) {
        expect(cells[i]).not.toHaveClass('active');
      }
    }
  });

  it('no cell highlighted when currentTrial is null', () => {
    const { container } = render(<Grid currentTrial={null} />);
    const cells = container.querySelectorAll('.grid-cell');
    for (const cell of cells) {
      expect(cell).not.toHaveClass('active');
    }
  });
});
