import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from './Controls';

describe('Controls', () => {
  const defaultProps = {
    onPositionMatch: vi.fn(),
    onAudioMatch: vi.fn(),
    positionPressed: false,
    audioPressed: false,
    disabled: false,
  };

  it('renders both buttons with correct labels', () => {
    render(<Controls {...defaultProps} />);
    expect(screen.getByText('Position Match')).toBeInTheDocument();
    expect(screen.getByText('Audio Match')).toBeInTheDocument();
  });

  it('calls handlers when clicked', async () => {
    const onPositionMatch = vi.fn();
    const onAudioMatch = vi.fn();
    const user = userEvent.setup();

    render(
      <Controls
        {...defaultProps}
        onPositionMatch={onPositionMatch}
        onAudioMatch={onAudioMatch}
      />
    );

    await user.click(screen.getByText('Position Match'));
    expect(onPositionMatch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText('Audio Match'));
    expect(onAudioMatch).toHaveBeenCalledTimes(1);
  });

  it('buttons disabled when disabled=true', () => {
    render(<Controls {...defaultProps} disabled={true} />);

    const posButton = screen.getByText('Position Match').closest('button')!;
    const audButton = screen.getByText('Audio Match').closest('button')!;
    expect(posButton).toBeDisabled();
    expect(audButton).toBeDisabled();
  });

  it('shows pressed state', () => {
    const { container } = render(
      <Controls {...defaultProps} positionPressed={true} audioPressed={true} />
    );

    expect(container.querySelector('.position-btn')).toHaveClass('pressed');
    expect(container.querySelector('.audio-btn')).toHaveClass('pressed');
  });
});
