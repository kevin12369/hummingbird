import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StyleCarousel } from '../components/StyleCarousel';
import { STYLE_META } from '@hummingbird/render';

function getThumb(name: string): HTMLButtonElement {
  // Each thumbnail button has data-testid="style-thumb" + aria-label "{emoji}{name}"
  const matches = screen.getAllByTestId('style-thumb');
  const match = matches.find((el) => {
    const aria = el.getAttribute('aria-label') ?? '';
    // Strip emoji and surrounding whitespace, then test inclusive match.
    return aria.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim() === name;
  });
  if (!match) throw new Error(`No thumb matching ${name}`);
  return match as HTMLButtonElement;
}

describe('StyleCarousel', () => {
  it('renders 12 style thumbnails', () => {
    render(<StyleCarousel />);
    const thumbs = screen.getAllByTestId('style-thumb');
    expect(thumbs.length).toBe(12);
  });

  it('default selected is pop', () => {
    render(<StyleCarousel />);
    const popBtn = getThumb(STYLE_META['pop'].name);
    expect(popBtn.getAttribute('aria-pressed')).toBe('true');
    // Pop 中文名出现在详情头
    expect(screen.getByText(STYLE_META['pop'].nameZh)).toBeTruthy();
  });

  it('clicking a thumbnail switches selected', () => {
    render(<StyleCarousel />);
    const trapBtn = getThumb(STYLE_META['trap'].name);
    fireEvent.click(trapBtn);
    expect(trapBtn.getAttribute('aria-pressed')).toBe('true');
    // 详情头应更新为 trap 的中文名
    expect(screen.getByText(STYLE_META['trap'].nameZh)).toBeTruthy();
  });

  it('only one thumbnail has aria-pressed=true at a time', () => {
    render(<StyleCarousel />);
    const thumbs = screen.getAllByTestId('style-thumb');
    const pressed = thumbs.filter((t) => t.getAttribute('aria-pressed') === 'true');
    expect(pressed.length).toBe(1);
  });

  it('keyboard arrow right navigates to next style', () => {
    render(<StyleCarousel />);
    // pop -> lofi (next in STYLES)
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    const lofiBtn = getThumb(STYLE_META['lofi'].name);
    expect(lofiBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('keyboard arrow left navigates to previous style (with wrap)', () => {
    render(<StyleCarousel />);
    // pop is first in STYLES; ArrowLeft should wrap to jazz
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    const jazzBtn = getThumb(STYLE_META['jazz'].name);
    expect(jazzBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('renders 3 group labels', () => {
    render(<StyleCarousel />);
    const labels = screen.getAllByTestId('group-label');
    expect(within(labels[0]!).getByText(/Beat 节奏型/)).toBeTruthy();
    expect(within(labels[1]!).getByText(/Mood 情绪/)).toBeTruthy();
    expect(within(labels[2]!).getByText(/Genre 流派/)).toBeTruthy();
  });

  it('group labels have data-category attribute', () => {
    render(<StyleCarousel />);
    const labels = screen.getAllByTestId('group-label');
    const cats = labels.map((l) => l.getAttribute('data-category')).sort();
    expect(cats).toEqual(['beat', 'genre', 'mood']);
  });

  it('renders BPM and drum chip for selected style', () => {
    render(<StyleCarousel />);
    // pop: BPM 95-128, Standard
    expect(screen.getByText(/BPM 95/)).toBeTruthy();
    expect(screen.getByText(/Standard/)).toBeTruthy();
  });

  it('renders bottom CTAs', () => {
    render(<StyleCarousel />);
    expect(screen.getByText(/Try sample/)).toBeTruthy();
    expect(screen.getByText(/Read spec/)).toBeTruthy();
  });

  it('renders 5 demo waveform rows', () => {
    const { container } = render(<StyleCarousel />);
    const waveforms = container.querySelectorAll('[aria-label$="waveform preview"]');
    expect(waveforms.length).toBe(5);
  });

  it('mock screenshot highlights the selected style', () => {
    render(<StyleCarousel />);
    fireEvent.click(getThumb(STYLE_META['kpop'].name));
    const screenshot = screen.getByRole('img', { name: /App preview in kpop style/ });
    expect(screenshot).toBeTruthy();
  });

  it('does not register key handler while typing in input (does not hijack typing)', () => {
    render(
      <div>
        <input data-testid="probe-input" />
        <StyleCarousel />
      </div>,
    );
    const input = screen.getByTestId('probe-input');
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    // pop should still be selected (keydown on INPUT should be ignored)
    const popBtn = getThumb(STYLE_META['pop'].name);
    expect(popBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('markup contains a 12-chip row in mock screenshot', () => {
    const { container } = render(<StyleCarousel />);
    const screenshot = container.querySelector('[aria-label^="App preview in"]') as HTMLElement | null;
    expect(screenshot).toBeTruthy();
    // The 12 chips inside the mock screenshot. Some names may also appear in the
    // details panel (selected style), so use the screenshot's aria-label-prefixed scope
    // and count the chip rows (each is a <span> containing emoji + name).
    const chips = screenshot!.querySelectorAll('span.px-1\\.5');
    expect(chips.length).toBe(12);
    // Selected style chip should have the highlight class (border-zinc-300)
    const selectedChips = screenshot!.querySelectorAll('span.border-zinc-300');
    expect(selectedChips.length).toBe(1);
  });
});