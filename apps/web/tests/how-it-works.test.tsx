import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from '../components/HowItWorks';

describe('HowItWorks', () => {
  it('renders 5 steps', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/Record/)).toBeTruthy();
    expect(screen.getByText(/Analyze/)).toBeTruthy();
    expect(screen.getByText(/Arrange/)).toBeTruthy();
    expect(screen.getByText(/Render/)).toBeTruthy();
    expect(screen.getByText(/Download/)).toBeTruthy();
  });

  it('renders exactly 5 step containers with sequential indices', () => {
    render(<HowItWorks />);
    const steps = screen.getAllByTestId('how-it-works-step');
    expect(steps.length).toBe(5);
    const indices = steps.map((s) => s.getAttribute('data-step-index'));
    expect(indices).toEqual(['1', '2', '3', '4', '5']);
  });

  it('shows 27 seconds total', () => {
    render(<HowItWorks />);
    const total = screen.getByTestId('how-it-works-total');
    expect(total.textContent).toBe('27');
    // The total summary line mentions the formula "5 + 5 + 5 + 10 + 2 ="
    expect(screen.getByText(/5 \+ 5 \+ 5 \+ 10 \+ 2 =/)).toBeTruthy();
  });

  it('renders 2 CTAs with correct href targets', () => {
    render(<HowItWorks />);
    const tryLink = screen.getByTestId('how-it-works-cta-try');
    const ghLink = screen.getByTestId('how-it-works-cta-gh');
    expect(tryLink.getAttribute('href')).toBe('#demo');
    expect(ghLink.getAttribute('href')).toContain('github.com');
  });

  it('Try online and Run locally labels are present', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/Try online/)).toBeTruthy();
    expect(screen.getByText(/Run locally/)).toBeTruthy();
  });

  it('shows comparison hint with GarageBand / Suno', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/GarageBand/)).toBeTruthy();
    expect(screen.getByText(/Suno/)).toBeTruthy();
  });

  it('renders at least 5 SVG icons', () => {
    render(<HowItWorks />);
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(5);
  });

  it('renders 4 connectors between the 5 steps', () => {
    render(<HowItWorks />);
    const connectors = screen.getAllByTestId('how-it-works-connector');
    expect(connectors.length).toBe(4);
  });

  it('each step has a duration chip', () => {
    render(<HowItWorks />);
    // 5 + 5 + 5 + 10 + 2 seconds -> chips: ~5s, ~5s, ~5s, ~10s, ~2s
    expect(screen.getAllByText('~5s').length).toBe(3);
    expect(screen.getByText('~10s')).toBeTruthy();
    expect(screen.getByText('~2s')).toBeTruthy();
  });
});