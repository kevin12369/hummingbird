import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Roadmap } from '../components/Roadmap';

describe('Roadmap', () => {
  it('renders section title and subtitle', () => {
    render(<Roadmap />);
    const title = screen.getByTestId('roadmap-title');
    expect(title.textContent).toMatch(/路线图/);
    expect(screen.getByText(/v1 已部署/)).toBeTruthy();
  });

  it('renders all 3 phases', () => {
    render(<Roadmap />);
    expect(screen.getByTestId('roadmap-phase-v1')).toBeTruthy();
    expect(screen.getByTestId('roadmap-phase-v2')).toBeTruthy();
    expect(screen.getByTestId('roadmap-phase-v3')).toBeTruthy();
  });

  it('renders v1 / v2 / v3 phase titles', () => {
    render(<Roadmap />);
    expect(screen.getByTestId('roadmap-title-v1').textContent).toMatch(
      /30 秒从哼唱到小样/
    );
    expect(screen.getByTestId('roadmap-title-v2').textContent).toMatch(
      /多语言歌词/
    );
    expect(screen.getByTestId('roadmap-title-v3').textContent).toMatch(
      /风格上传/
    );
  });

  it('renders the three status badges (done / in-progress / planned)', () => {
    const { container } = render(<Roadmap />);
    expect(
      container.querySelectorAll('[data-testid="roadmap-status-done"]').length
    ).toBe(1);
    expect(
      container.querySelectorAll(
        '[data-testid="roadmap-status-in-progress"]'
      ).length
    ).toBe(1);
    expect(
      container.querySelectorAll('[data-testid="roadmap-status-planned"]').length
    ).toBe(1);
  });

  it('renders an <ol> ordered list for the timeline', () => {
    const { container } = render(<Roadmap />);
    const ol = container.querySelector('ol[data-testid="roadmap-list"]');
    expect(ol).toBeTruthy();
    expect(ol?.querySelectorAll('li').length).toBe(3);
  });

  it('draws a vertical timeline rail via absolute span', () => {
    const { container } = render(<Roadmap />);
    const rail = container.querySelector(
      'ol > span[aria-hidden].absolute'
    );
    expect(rail).toBeTruthy();
  });

  it('keeps dark theme background and border-b', () => {
    const { container } = render(<Roadmap />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-[#0a0a0f]');
    expect(section?.className).toContain('border-zinc-800');
  });

  it('renders with id="roadmap" for in-page anchors', () => {
    const { container } = render(<Roadmap />);
    const section = container.querySelector('section#roadmap');
    expect(section).toBeTruthy();
  });
});