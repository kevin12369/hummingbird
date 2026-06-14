import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeforeAfter } from '../components/BeforeAfter';

describe('BeforeAfter', () => {
  it('renders section title and arrow subtitle', () => {
    render(<BeforeAfter />);
    const title = screen.getByTestId('before-after-title');
    expect(title.textContent).toMatch(/30 秒/);
    expect(screen.getByText(/你的哼唱/)).toBeTruthy();
  });

  it('renders both Before and After columns', () => {
    render(<BeforeAfter />);
    expect(screen.getByTestId('before-after-before')).toBeTruthy();
    expect(screen.getByTestId('before-after-after')).toBeTruthy();
  });

  it('shows the Before and After labels', () => {
    render(<BeforeAfter />);
    expect(screen.getByText('Before')).toBeTruthy();
    expect(screen.getByText('After')).toBeTruthy();
  });

  it('renders the Before mock waveform as a single row of 32 bars', () => {
    const { container } = render(<BeforeAfter />);
    const before = screen.getByTestId('before-after-before');
    const waveform = before.querySelector('[data-testid="waveform-simple"]');
    expect(waveform).toBeTruthy();
    const bars = waveform?.querySelectorAll('[data-testid="waveform-bar"]');
    expect(bars?.length).toBe(32);
  });

  it('renders the After mock waveform as 4 stems x 32 bars = 128 bars', () => {
    const { container } = render(<BeforeAfter />);
    const after = screen.getByTestId('before-after-after');
    const stacked = after.querySelector('[data-testid="waveform-stacked"]');
    expect(stacked).toBeTruthy();
    const melody = stacked?.querySelector('[data-testid="waveform-stem-melody"]');
    const chords = stacked?.querySelector('[data-testid="waveform-stem-chords"]');
    const bass = stacked?.querySelector('[data-testid="waveform-stem-bass"]');
    const drums = stacked?.querySelector('[data-testid="waveform-stem-drums"]');
    expect(melody).toBeTruthy();
    expect(chords).toBeTruthy();
    expect(bass).toBeTruthy();
    expect(drums).toBeTruthy();
    const bars = stacked?.querySelectorAll('[data-testid="waveform-bar"]');
    expect(bars?.length).toBe(128);
  });

  it('shows the arrow between the two columns', () => {
    render(<BeforeAfter />);
    expect(screen.getByTestId('before-after-arrow')).toBeTruthy();
  });

  it('shows file size hints on each side', () => {
    render(<BeforeAfter />);
    expect(screen.getByText(/100 KB webm/)).toBeTruthy();
    expect(screen.getByText(/800 KB .mp3/)).toBeTruthy();
  });

  it('keeps the dark theme background and border', () => {
    const { container } = render(<BeforeAfter />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-[#0a0a0f]');
    expect(section?.className).toContain('border-zinc-800');
  });
});
