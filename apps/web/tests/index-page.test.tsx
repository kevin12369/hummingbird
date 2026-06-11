import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Home from '../pages/index';

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
});
