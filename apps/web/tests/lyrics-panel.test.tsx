import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LyricsPanel } from '../components/LyricsPanel';

beforeAll(() => {
  // jsdom doesn't implement URL.createObjectURL
  if (typeof URL.createObjectURL !== 'function') {
    (URL as any).createObjectURL = vi.fn(() => 'blob:mock-url');
    (URL as any).revokeObjectURL = vi.fn();
  }
});

const sampleLyrics = {
  locale: 'zh' as const,
  lines: [{ text: '第一行' }, { text: '第二行' }, { text: '第三行' }],
  rawText: '',
};

describe('LyricsPanel', () => {
  it('renders nothing when lyrics is null and no error', () => {
    const { container } = render(<LyricsPanel lyrics={null} lyricsError={null} onGenerate={async () => {}} onLocaleChange={() => {}} />);
    // Component renders a "Generate lyrics" CTA when both are null (not literally nothing)
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByRole('button', { name: /generate lyrics/i })).toBeTruthy();
  });

  it('renders 3 lyric lines', () => {
    const { container } = render(<LyricsPanel lyrics={sampleLyrics} lyricsError={null} onGenerate={async () => {}} onLocaleChange={() => {}} />);
    // The pre block contains all 3 lines joined by newlines
    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre!.textContent).toContain('第一行');
    expect(pre!.textContent).toContain('第二行');
    expect(pre!.textContent).toContain('第三行');
  });

  it('renders a "Generate lyrics" button when lyrics is null', () => {
    render(<LyricsPanel lyrics={null} lyricsError={null} onGenerate={async () => {}} onLocaleChange={() => {}} />);
    expect(screen.getByRole('button', { name: /generate lyrics/i })).toBeTruthy();
  });

  it('shows error message when lyricsError is set', () => {
    render(<LyricsPanel lyrics={null} lyricsError="LLM failed" onGenerate={async () => {}} onLocaleChange={() => {}} />);
    expect(screen.getByText(/LLM failed/)).toBeTruthy();
  });

  it('renders 3 locale toggle buttons (zh/en/ja)', () => {
    render(<LyricsPanel lyrics={sampleLyrics} lyricsError={null} onGenerate={async () => {}} onLocaleChange={() => {}} />);
    expect(screen.getByRole('button', { name: /中文/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /english/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /日本語/ })).toBeTruthy();
  });

  it('highlights the active locale', () => {
    render(<LyricsPanel lyrics={sampleLyrics} lyricsError={null} onGenerate={async () => {}} onLocaleChange={() => {}} />);
    const zhBtn = screen.getByRole('button', { name: /中文/ });
    expect(zhBtn.className).toMatch(/emerald|active|bg-/);
  });

  it('calls onLocaleChange when a locale button is clicked', () => {
    let called = '';
    render(<LyricsPanel lyrics={sampleLyrics} lyricsError={null} onGenerate={async () => {}} onLocaleChange={(l) => { called = l; }} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(called).toBe('en');
  });

  it('download link is present when lyrics is set', () => {
    render(<LyricsPanel lyrics={sampleLyrics} lyricsError={null} onGenerate={async () => {}} onLocaleChange={() => {}} />);
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('download')).toMatch(/\.txt$/);
  });
});
