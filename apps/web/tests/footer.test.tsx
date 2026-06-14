import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../components/Footer';

describe('Footer', () => {
  it('renders 4 columns', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-brand')).toBeTruthy();
    expect(screen.getByTestId('footer-project')).toBeTruthy();
    expect(screen.getByTestId('footer-docs')).toBeTruthy();
    expect(screen.getByTestId('footer-author')).toBeTruthy();
  });

  it('renders the brand column with title + tagline + license', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-brand-title').textContent).toMatch(
      /Hummingbird \/ 哼哼编曲/
    );
    expect(screen.getByText(/AI Music Tool · MIT/)).toBeTruthy();
    expect(screen.getByText(/30 秒从哼唱到一首能发的小样/)).toBeTruthy();
  });

  it('renders Project column with GitHub / Issues / Discussions / Changelog', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-link-repo').getAttribute('href')).toMatch(
      /github\.com/
    );
    expect(
      screen.getByTestId('footer-link-issues').getAttribute('href')
    ).toMatch(/issues/);
    expect(
      screen.getByTestId('footer-link-discussions').getAttribute('href')
    ).toMatch(/discussions/);
    expect(
      screen.getByTestId('footer-link-changelog').getAttribute('href')
    ).toMatch(/releases/);
  });

  it('renders Documentation column with RUN-LOCALLY + SPEC + 路线图 + FAQ anchors', () => {
    render(<Footer />);
    expect(
      screen.getByTestId('footer-link-run-locally').getAttribute('href')
    ).toMatch(/RUN-LOCALLY\.md/);
    expect(
      screen.getByTestId('footer-link-spec').getAttribute('href')
    ).toMatch(/spec/i);
    expect(
      screen.getByTestId('footer-link-roadmap').getAttribute('href')
    ).toBe('#roadmap');
    expect(screen.getByTestId('footer-link-faq').getAttribute('href')).toBe(
      '#faq'
    );
  });

  it('renders Author column with email + portfolio + GitHub + Star button', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-link-email').getAttribute('href')).toBe(
      'mailto:491750329@qq.com'
    );
    expect(
      screen.getByTestId('footer-link-portfolio').getAttribute('href')
    ).toMatch(/portfolio/);
    expect(
      screen.getByTestId('footer-link-author-gh').getAttribute('href')
    ).toMatch(/github\.com\/kevin12369/);
    expect(screen.getByTestId('footer-star-button')).toBeTruthy();
  });

  it('renders bottom copyright + 隐私 + License links', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-bottom').textContent).toMatch(
      /© 2026 Hummingbird · MIT/
    );
    expect(screen.getByTestId('footer-link-privacy').getAttribute('href')).toBe(
      '#'
    );
    expect(
      screen.getByTestId('footer-link-license').getAttribute('href')
    ).toMatch(/LICENSE/);
  });

  it('uses a 4-column responsive grid (1 / 2 / 4 across breakpoints)', () => {
    const { container } = render(<Footer />);
    const grid = screen.getByTestId('footer-grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('sm:grid-cols-2');
    expect(grid.className).toContain('md:grid-cols-4');
  });

  it('uses the darker #14141a footer background to differentiate from sections', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer?.className).toContain('bg-[#14141a]');
  });
});