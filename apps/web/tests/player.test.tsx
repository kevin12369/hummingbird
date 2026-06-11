import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Player } from '../components/Player';

describe('Player', () => {
  it('renders Play and Stop buttons when midi is provided', () => {
    render(<Player midi={new Uint8Array([1, 2, 3])} bpm={120} />);
    expect(screen.getByRole('button', { name: /play/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /stop/i })).toBeTruthy();
  });

  it('renders nothing when midi is null', () => {
    const { container } = render(<Player midi={null} bpm={120} />);
    expect(container.firstChild).toBeNull();
  });
});
