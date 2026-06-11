import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, defaultTheme, type Theme } from '../lib/theme';

describe('useTheme', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaultTheme when localStorage empty', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toEqual(defaultTheme);
  });

  it('loads from localStorage on mount', () => {
    const stored: Theme = { primary: '#ff00ff', secondary: '#00ff00' };
    localStorage.setItem('hummingbird:theme:v1', JSON.stringify(stored));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toEqual({ ...defaultTheme, ...stored });
  });

  it('setTheme merges + persists', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme({ primary: '#abc123' }));
    expect(result.current.theme.primary).toBe('#abc123');
    expect(JSON.parse(localStorage.getItem('hummingbird:theme:v1')!).primary).toBe('#abc123');
  });

  it('resetTheme restores defaults', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme({ primary: '#000' }));
    act(() => result.current.resetTheme());
    expect(result.current.theme).toEqual(defaultTheme);
  });
});
