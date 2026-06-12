import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleSelector, STYLES, type Style } from '../components/StyleSelector';

describe('StyleSelector', () => {
  it('STYLES contains 5 styles', () => {
    expect(STYLES).toHaveLength(5);
    expect(STYLES.map(s => s.id)).toEqual(['pop', 'lo-fi', 'jazz', 'rock', 'classical']);
  });

  it('renders 5 chip buttons', () => {
    render(<StyleSelector current="pop" onSelect={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: /pop/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /lo-fi/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /jazz/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /rock/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /classical/i })).toBeTruthy();
  });

  it('highlights the current style', () => {
    render(<StyleSelector current="jazz" onSelect={vi.fn()} disabled={false} />);
    const jazzBtn = screen.getByRole('button', { name: /jazz/i });
    expect(jazzBtn.className).toMatch(/emerald|active|bg-/);
  });

  it('calls onSelect with the chosen style', () => {
    const onSelect = vi.fn();
    render(<StyleSelector current="pop" onSelect={onSelect} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: /rock/i }));
    expect(onSelect).toHaveBeenCalledWith('rock');
  });

  it('disables all buttons when disabled=true', () => {
    render(<StyleSelector current="pop" onSelect={vi.fn()} disabled={true} />);
    const popBtn = screen.getByRole('button', { name: /pop/i }) as HTMLButtonElement;
    const jazzBtn = screen.getByRole('button', { name: /jazz/i }) as HTMLButtonElement;
    expect(popBtn.disabled).toBe(true);
    expect(jazzBtn.disabled).toBe(true);
  });
});
