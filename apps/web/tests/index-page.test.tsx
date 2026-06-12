import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Home from '../pages/index';

// Mock generateLyrics so we don't hit the network
vi.mock('@hummingbird/lyrics', async () => {
  const actual = await vi.importActual<typeof import('@hummingbird/lyrics')>('@hummingbird/lyrics');
  return { ...actual, generateLyrics: vi.fn() };
});

describe('Home page', () => {
  beforeEach(() => {
    localStorage.clear();
    (globalThis as any).MediaRecorder = class {
      start = vi.fn();
      stop = vi.fn();
      state = 'inactive';
    };
    (globalThis as any).navigator = { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({}) } };
  });

  it('renders header with title + settings button', () => {
    render(<Home />);
    expect(screen.getByText(/Hummingbird/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /⚙/ })).toBeTruthy();
  });

  it('renders the Recorder in idle state', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeTruthy();
  });

  it('opens settings modal when ⚙ is clicked', () => {
    render(<Home />);
    act(() => {
      screen.getByRole('button', { name: /⚙/ }).click();
    });
    expect(screen.getByText(/theme/i)).toBeTruthy();
  });

  it('smoke: Home renders without errors when StyleSelector + LyricsPanel are integrated', () => {
    // The Home page should mount cleanly. The style selector + lyrics panel
    // only render in 'ready' state, but we verify the component tree imports
    // and instantiates without throwing.
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
    // In idle state, neither component renders, so we just verify the page works.
  });

  it('smoke: Home page imports do not throw on initial render', () => {
    // Validates that the import of StyleSelector / LyricsPanel from the page
    // module is wired up (catches circular imports, missing exports).
    expect(() => render(<Home />)).not.toThrow();
  });

  it('shows Try sample button when in idle state', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /try sample/i })).toBeTruthy();
  });

  it('smoke: FeedbackPanel integration does not throw in idle state', () => {
    // FeedbackPanel is only rendered in 'ready' state, but the page should
    // mount cleanly with the new useToast + autoFeedback wiring.
    expect(() => render(<Home />)).not.toThrow();
  });
});
