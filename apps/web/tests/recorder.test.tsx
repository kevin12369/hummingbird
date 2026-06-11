import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders a "Start recording" button when idle', () => {
    render(<Recorder onComplete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeTruthy();
  });

  it('starts recording on click, button text becomes "Stop recording"', async () => {
    render(<Recorder onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /stop recording/i })).toBeTruthy());
  });

  it('shows error message if startRecording throws', async () => {
    (globalThis as any).navigator = { mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error('mic denied')) } };
    render(<Recorder onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => expect(screen.getByText(/mic denied/i)).toBeTruthy());
  });
});
