import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from '../components/Features';

describe('Features', () => {
  it('renders section title and subtitle', () => {
    render(<Features />);
    const title = screen.getByTestId('features-title');
    expect(title.textContent).toMatch(/4 件事/);
    expect(screen.getByText(/4 轨 MIDI/)).toBeTruthy();
  });

  it('renders exactly 4 feature cards', () => {
    render(<Features />);
    expect(screen.getByTestId('feature-card-stems')).toBeTruthy();
    expect(screen.getByTestId('feature-card-mp3')).toBeTruthy();
    expect(screen.getByTestId('feature-card-lyrics')).toBeTruthy();
    expect(screen.getByTestId('feature-card-feedback')).toBeTruthy();
  });

  it('renders the 4 expected card titles', () => {
    render(<Features />);
    expect(screen.getByText('4 轨分离')).toBeTruthy();
    expect(screen.getByText('MP3 一键导出')).toBeTruthy();
    expect(screen.getByText('3 语言歌词')).toBeTruthy();
    expect(screen.getByText('AI 教学反馈')).toBeTruthy();
  });

  it('renders tag chips (at least 12 tags total across 4 cards)', () => {
    const { container } = render(<Features />);
    const chips = container.querySelectorAll('[data-testid="feature-card-tags"] > span');
    expect(chips.length).toBeGreaterThanOrEqual(12);
  });

  it('renders at least 4 inline SVG icons (one per card)', () => {
    const { container } = render(<Features />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(4);
  });

  it('renders a responsive grid (md:grid-cols-2)', () => {
    const { container } = render(<Features />);
    const grid = screen.getByTestId('features-grid');
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).toContain('grid-cols-1');
  });

  it('keeps the dark theme background and border', () => {
    const { container } = render(<Features />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-[#0a0a0f]');
    expect(section?.className).toContain('border-zinc-800');
  });
});
