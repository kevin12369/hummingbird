import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '../components/Hero';
import { StatusBadges } from '../components/StatusBadges';

describe('Hero', () => {
  it('renders h1 with both brand names', () => {
    render(<Hero />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    const heroH1 = h1s.find((el) => el.textContent && /哼哼编曲/.test(el.textContent));
    expect(heroH1).toBeTruthy();
    expect(heroH1?.textContent).toMatch(/Hummingbird/);
  });

  it('renders sub-headline and value props', () => {
    render(<Hero />);
    expect(screen.getByText(/你哼 30 秒/)).toBeTruthy();
    expect(screen.getByText(/不会乐器/)).toBeTruthy();
    expect(screen.getByText(/一键导出/)).toBeTruthy();
  });

  it('renders two CTAs', () => {
    render(<Hero />);
    expect(screen.getByText(/Try live demo/)).toBeTruthy();
    expect(screen.getByText(/View on GitHub/)).toBeTruthy();
  });

  it('CTA links to demo anchor and GitHub', () => {
    render(<Hero />);
    const demoLink = screen.getByText(/Try live demo/).closest('a');
    const ghLink = screen.getByText(/View on GitHub/).closest('a');
    expect(demoLink?.getAttribute('href')).toBe('#demo');
    expect(ghLink?.getAttribute('href')).toContain('github.com');
  });

  it('renders the screenshot placeholder', () => {
    const { container } = render(<Hero />);
    const preview = container.querySelector('[aria-label="Hummingbird app preview"]');
    expect(preview).toBeTruthy();
  });
});

describe('StatusBadges', () => {
  it('renders 8 badges', () => {
    const { container } = render(<StatusBadges />);
    const badges = container.querySelectorAll('img[src*="shields.io"]');
    expect(badges.length).toBe(8);
  });

  it('renders at least 6 alt texts describing status', () => {
    const { container } = render(<StatusBadges />);
    const badges = Array.from(container.querySelectorAll('img[src*="shields.io"]')) as HTMLImageElement[];
    const withAlt = badges.filter((b) => b.alt && b.alt.length > 0);
    expect(withAlt.length).toBeGreaterThanOrEqual(6);
  });

  it('CI and Pages badges are clickable', () => {
    const { container } = render(<StatusBadges />);
    const ciLink = container.querySelector('a[href*="/actions"]');
    const pagesLink = container.querySelector('a[href*="kevin12369.github.io"]');
    expect(ciLink).toBeTruthy();
    expect(pagesLink).toBeTruthy();
  });
});