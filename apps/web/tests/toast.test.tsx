import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, render } from '@testing-library/react';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

describe('useToast + Toast', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty toast list', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('showToast adds a toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast({ severity: 'info', message: 'hello' }));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]!.message).toBe('hello');
  });

  it('Toast renders a message', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast({ severity: 'success', message: 'saved' }));
    render(<Toast toasts={result.current.toasts} onDismiss={result.current.dismiss} />);
    expect(document.body.textContent).toContain('saved');
  });

  it('auto-dismisses info toasts after 4s', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast({ severity: 'info', message: 'auto' }));
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(4001);
    });
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('error toasts do not auto-dismiss', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => result.current.showToast({ severity: 'error', message: 'fatal' }));
    vi.advanceTimersByTime(10000);
    expect(result.current.toasts).toHaveLength(1);
    vi.useRealTimers();
  });
});
