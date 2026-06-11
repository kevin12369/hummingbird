import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyDisplay } from '../components/KeyDisplay';

describe('KeyDisplay', () => {
  it('renders nothing when no key', () => {
    const { container } = render(<KeyDisplay keyName={null} mode={null} bpm={null} confidence={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders key, mode, bpm when all set', () => {
    render(<KeyDisplay keyName="C" mode="major" bpm={120} confidence={0.8} />);
    expect(screen.getByText(/C major/i)).toBeTruthy();
    expect(screen.getByText(/120/)).toBeTruthy();
  });

  it('shows low-confidence warning when confidence < 0.5', () => {
    render(<KeyDisplay keyName="C" mode="major" bpm={120} confidence={0.3} />);
    expect(screen.getByText(/uncertain|low confidence/i)).toBeTruthy();
  });
});
