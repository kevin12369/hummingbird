import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Recorder } from '../components/Recorder';

describe('Recorder', () => {
  beforeEach(() => {
    (globalThis as any).MediaRecorder = class {
      start = vi.fn();
      stop = vi.fn();
      state = 'inactive';
    };
    (globalThis as any).navigator = { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({}) } };
  });

  it('renders a "Start recording" button when mounted and supported', async () => {
    render(<Recorder onComplete={vi.fn()} />);
    // useEffect sets mounted=true synchronously in happy-dom; flush microtasks.
    await waitFor(() => expect(screen.getByRole('button', { name: /start recording/i })).toBeTruthy());
  });

  it('starts recording on click, button text becomes "Stop recording"', async () => {
    render(<Recorder onComplete={vi.fn()} />);
    const startBtn = await waitFor(() => screen.getByRole('button', { name: /start recording/i }));
    fireEvent.click(startBtn);
    await waitFor(() => expect(screen.getByRole('button', { name: /stop recording/i })).toBeTruthy());
  });

  it('shows error message if startRecording throws', async () => {
    (globalThis as any).navigator = { mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error('mic denied')) } };
    render(<Recorder onComplete={vi.fn()} />);
    const startBtn = await waitFor(() => screen.getByRole('button', { name: /start recording/i }));
    fireEvent.click(startBtn);
    await waitFor(() => expect(screen.getByText(/mic denied/i)).toBeTruthy());
  });
});
