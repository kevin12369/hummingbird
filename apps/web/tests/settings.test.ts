import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, type AppSettings } from '../lib/settings';

describe('app settings', () => {
  beforeEach(() => localStorage.clear());

  it('loadSettings returns defaults when localStorage empty', () => {
    const s = loadSettings();
    expect(s.autoFeedback).toBe(false);
  });

  it('saveSettings + loadSettings roundtrip', () => {
    saveSettings({ autoFeedback: true });
    expect(loadSettings().autoFeedback).toBe(true);
  });

  it('loadSettings ignores malformed JSON', () => {
    localStorage.setItem('hummingbird:settings:v1', '{not json');
    const s = loadSettings();
    expect(s.autoFeedback).toBe(false);
  });
});
