import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Portfolio from '../pages/portfolio';

describe('Portfolio page', () => {
  it('renders the project name and tagline', () => {
    render(<Portfolio />);
    // The name appears in the <h1> heading
    expect(screen.getByRole('heading', { level: 1, name: /Hummingbird/i })).toBeTruthy();
    // The tagline appears below the heading (and may also appear in description)
    expect(screen.getAllByText(/MIDI\s*编曲|哼唱/i).length).toBeGreaterThan(0);
  });

  it('renders the screenshot image', () => {
    render(<Portfolio />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('main.png');
  });

  it('has a link to RUN-LOCALLY.md', () => {
    render(<Portfolio />);
    const link = screen.getByRole('link', { name: /run locally/i });
    expect(link.getAttribute('href')).toContain('RUN-LOCALLY');
  });
});
