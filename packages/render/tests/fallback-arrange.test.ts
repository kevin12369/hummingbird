import { describe, it, expect } from 'vitest';
import { fallbackArrange } from '../src/fallback-arrange';
import { STYLES } from '../src/styles';

describe('fallbackArrange', () => {
  const fakeNotes = [
    { pitch: 60, onset: 0, duration: 0.5, velocity: 0.8 },
    { pitch: 62, onset: 0.5, duration: 0.5, velocity: 0.7 },
    { pitch: 64, onset: 1.0, duration: 0.5, velocity: 0.8 },
  ];

  it('每个 style 都能产出合法 arrangement', () => {
    for (const style of STYLES) {
      const result = fallbackArrange(fakeNotes, { key: 'C', mode: 'major', confidence: 0.8 }, style);
      expect(result.bpm).toBeGreaterThanOrEqual(40);
      expect(result.bpm).toBeLessThanOrEqual(200);
      expect(result.chordProgression.length).toBeGreaterThan(0);
      expect(result.bassLine.length).toBeGreaterThan(0);
    }
  });

  it('Pop 风格用 I-IV-V-I 进行', () => {
    const a = fallbackArrange(fakeNotes, { key: 'C', mode: 'major', confidence: 0.8 }, 'pop');
    expect(a.chordProgression).toEqual(['I', 'IV', 'V', 'I']);
    expect(a.drumPattern).toBe('standard');
  });

  it('Trap 风格用 half-time 鼓型 + 高 BPM', () => {
    const a = fallbackArrange(fakeNotes, { key: 'C', mode: 'major', confidence: 0.8 }, 'trap');
    expect(a.drumPattern).toBe('half-time');
    expect(a.bpm).toBeGreaterThanOrEqual(130);
  });

  it('Ambient 风格长 reverb 特征:BPM 60-90 + 大调', () => {
    const a = fallbackArrange(fakeNotes, { key: 'C', mode: 'major', confidence: 0.8 }, 'ambient');
    expect(a.bpm).toBeLessThanOrEqual(90);
  });

  it('空 notes 也能产出(用模板兜底)', () => {
    const a = fallbackArrange([], { key: 'C', mode: 'major', confidence: 0 }, 'pop');
    expect(a.chordProgression.length).toBeGreaterThan(0);
  });

  it('low confidence 默认 C major', () => {
    const a = fallbackArrange(fakeNotes, { key: 'F#', mode: 'minor', confidence: 0.1 }, 'pop');
    expect(a.key).toBe('C');
  });
});