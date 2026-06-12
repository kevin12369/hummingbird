import { describe, it, expect } from 'vitest';
import { getLyricsPrompt, SUPPORTED_LOCALES, type Locale } from '../src/i18n';

describe('i18n lyrics prompts', () => {
  it('SUPPORTED_LOCALES contains zh, en, ja', () => {
    expect(SUPPORTED_LOCALES).toEqual(['zh', 'en', 'ja']);
  });

  it('getLyricsPrompt returns a non-empty string for each locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const p = getLyricsPrompt(locale, { melodySummary: 'C major, 120 BPM, 8 notes', bpm: 120, style: 'pop' });
      expect(p.system).toBeTruthy();
      expect(p.system.length).toBeGreaterThan(50);
      expect(p.user).toContain('C major');
      expect(p.user).toContain('120');
    }
  });

  it('Chinese prompt mentions 歌词', () => {
    const p = getLyricsPrompt('zh', { melodySummary: 'C major', bpm: 120, style: 'pop' });
    expect(p.system).toMatch(/歌词|verse|chorus/i);
  });

  it('English prompt mentions lyrics', () => {
    const p = getLyricsPrompt('en', { melodySummary: 'C major', bpm: 120, style: 'pop' });
    expect(p.system).toMatch(/lyrics|verse|chorus/i);
  });

  it('Japanese prompt mentions 歌詞', () => {
    const p = getLyricsPrompt('ja', { melodySummary: 'C major', bpm: 120, style: 'pop' });
    expect(p.system).toMatch(/歌詞|verse|chorus/i);
  });
});
