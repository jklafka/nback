import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from './Settings';
import type { GameSettings } from '../types';

describe('Settings', () => {
  const defaultSettings: GameSettings = {
    nLevel: 2,
    trialCount: 20,
    intervalMs: 3000,
  };

  const defaultProps = {
    settings: defaultSettings,
    onUpdate: vi.fn(),
    onStart: vi.fn(),
    theme: 'cyberpunk' as const,
    onThemeChange: vi.fn(),
  };

  it('renders all setting controls with values', () => {
    render(<Settings {...defaultProps} />);
    expect(screen.getByText('2')).toBeInTheDocument(); // nLevel
    expect(screen.getByText('20')).toBeInTheDocument(); // trialCount
    expect(screen.getByText('3s')).toBeInTheDocument(); // interval
  });

  it('increment/decrement buttons call onUpdate', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();

    render(<Settings {...defaultProps} onUpdate={onUpdate} />);

    // All the + and - buttons
    const buttons = screen.getAllByRole('button');
    // Buttons: -, +, -, +, -, +, 4 theme swatches, Start Game = 11
    // Click nLevel +
    const incrementButtons = buttons.filter((b) => b.textContent === '+');
    const decrementButtons = buttons.filter((b) => b.textContent === '-');

    await user.click(incrementButtons[0]!); // nLevel +
    expect(onUpdate).toHaveBeenCalledWith({ nLevel: 3, trialCount: 30 });

    await user.click(decrementButtons[0]!); // nLevel -
    expect(onUpdate).toHaveBeenCalledWith({ nLevel: 1, trialCount: 10 });
  });

  it('start button calls onStart', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();

    render(<Settings {...defaultProps} onStart={onStart} />);

    await user.click(screen.getByText('Start Game'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('min boundary buttons are disabled', () => {
    render(
      <Settings
        {...defaultProps}
        settings={{ nLevel: 1, trialCount: 10, intervalMs: 1500 }}
      />
    );

    const decrementButtons = screen.getAllByRole('button').filter((b) => b.textContent === '-');
    for (const btn of decrementButtons) {
      expect(btn).toBeDisabled();
    }
  });

  it('max boundary buttons are disabled', () => {
    render(
      <Settings
        {...defaultProps}
        settings={{ nLevel: 9, trialCount: 100, intervalMs: 5000 }}
      />
    );

    const incrementButtons = screen.getAllByRole('button').filter((b) => b.textContent === '+');
    for (const btn of incrementButtons) {
      expect(btn).toBeDisabled();
    }
  });
});
