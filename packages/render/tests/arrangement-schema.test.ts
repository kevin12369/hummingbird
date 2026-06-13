import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { ArrangementSchema, parseArrangement, type Arrangement } from '../src/arrangement-schema';

describe('ArrangementSchema', () => {
  it('合法 arrangement 通过 parse', () => {
    const result = v.parse(ArrangementSchema, {
      chordProgression: ['I', 'IV', 'V', 'I'],
      bassLine: ['C2', 'F2', 'G2', 'C2'],
      drumPattern: 'standard',
      bpm: 120,
      key: 'C',
      mode: 'major',
    });
    expect(result.bpm).toBe(120);
  });

  it('chordProgression 长度不在 1-8 失败', () => {
    expect(() => v.parse(ArrangementSchema, {
      chordProgression: [],
      bassLine: ['C2'],
      drumPattern: 'standard',
      bpm: 120,
      key: 'C',
      mode: 'major',
    })).toThrow();
  });

  it('bpm 超出 40-200 失败', () => {
    expect(() => v.parse(ArrangementSchema, {
      chordProgression: ['I', 'IV', 'V', 'I'],
      bassLine: ['C2', 'F2', 'G2', 'C2'],
      drumPattern: 'standard',
      bpm: 300,
      key: 'C',
      mode: 'major',
    })).toThrow();
  });

  it('drumPattern 非法枚举失败', () => {
    expect(() => v.parse(ArrangementSchema, {
      chordProgression: ['I', 'IV', 'V', 'I'],
      bassLine: ['C2', 'F2', 'G2', 'C2'],
      drumPattern: 'weird-drum',
      bpm: 120,
      key: 'C',
      mode: 'major',
    })).toThrow();
  });
});

describe('parseArrangement', () => {
  it('合法输入返回 Arrangement', () => {
    const a: Arrangement = parseArrangement({
      chordProgression: ['I', 'IV', 'V', 'I'],
      bassLine: ['C2', 'F2', 'G2', 'C2'],
      drumPattern: 'standard',
      bpm: 120,
      key: 'C',
      mode: 'major',
    });
    expect(a.drumPattern).toBe('standard');
  });

  it('非法输入抛错', () => {
    expect(() => parseArrangement({ chordProgression: [] })).toThrow();
  });
});