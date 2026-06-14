import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhoIsItFor } from '../components/WhoIsItFor';

describe('WhoIsItFor', () => {
  it('renders the section title', () => {
    render(<WhoIsItFor />);
    const title = screen.getByTestId('who-is-it-for-title');
    expect(title.textContent).toMatch(/给谁用/);
  });

  it('renders exactly 3 audience cards', () => {
    render(<WhoIsItFor />);
    expect(screen.getByTestId('who-card-beginner')).toBeTruthy();
    expect(screen.getByTestId('who-card-hobbyist')).toBeTruthy();
    expect(screen.getByTestId('who-card-creator')).toBeTruthy();
  });

  it('renders the 3 expected card titles', () => {
    render(<WhoIsItFor />);
    expect(screen.getByText(/Beginner 不会乐器/)).toBeTruthy();
    expect(screen.getByText(/Hobbyist 想做 BGM/)).toBeTruthy();
    expect(screen.getByText(/Creator 想要 Demo 起点/)).toBeTruthy();
  });

  it('shows persona emojis (Beginner / Hobbyist / Creator)', () => {
    const { container } = render(<WhoIsItFor />);
    const emojis = container.querySelectorAll('[data-testid="who-card-emoji"]');
    expect(emojis.length).toBe(3);
    const labels = Array.from(emojis).map((e) => e.textContent ?? '');
    expect(labels).toEqual(['🌱', '🎨', '🎹']);
  });

  it('shows each card\'s quote, scenarios, and value', () => {
    render(<WhoIsItFor />);
    // Quotes contain the persona's core frustration
    expect(screen.getByText(/学钢琴要 3 年/)).toBeTruthy();
    expect(screen.getByText(/不想用版权音乐/)).toBeTruthy();
    expect(screen.getByText(/拖进 Logic \/ Ableton/)).toBeTruthy();
    // Scenarios / value labels
    expect(screen.getAllByText(/场景:/).length).toBe(3);
    expect(screen.getAllByText(/价值:/).length).toBe(3);
  });

  it('uses a 3-column responsive grid', () => {
    render(<WhoIsItFor />);
    const grid = screen.getByTestId('who-is-it-for-grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('md:grid-cols-3');
  });

  it('keeps the dark theme background and border', () => {
    const { container } = render(<WhoIsItFor />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-[#0a0a0f]');
    expect(section?.className).toContain('border-zinc-800');
  });
});
