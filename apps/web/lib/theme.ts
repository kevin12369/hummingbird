import { useState, useEffect, useCallback } from 'react';

export interface Theme {
  primary: string;
  secondary: string;
}

export const defaultTheme: Theme = {
  primary: '#3aa6ff',
  secondary: '#ffffff',
};

const STORAGE_KEY = 'hummingbird:theme:v1';

function loadFromStorage(): Theme {
  if (typeof localStorage === 'undefined') return defaultTheme;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTheme;
    return { ...defaultTheme, ...JSON.parse(raw) };
  } catch {
    return defaultTheme;
  }
}

function saveToStorage(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  useEffect(() => { setThemeState(loadFromStorage()); }, []);
  const setTheme = useCallback((patch: Partial<Theme>) => {
    setThemeState((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);
  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);
    saveToStorage(defaultTheme);
  }, []);
  return { theme, setTheme, resetTheme };
}
