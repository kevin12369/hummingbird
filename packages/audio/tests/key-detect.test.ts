import { describe, it, expect } from 'vitest';
import { detectKey } from '../src/key-detect';
import type { NoteEvent } from '../src/types';

describe('detectKey', () => {
  it('returns C major for a C major scale', () => {
    // C major: C D E F G A B (MIDI 60 62 64 65 67 69 71)
    const notes: NoteEvent[] = [60, 62, 64, 65, 67, 69, 71, 60, 64, 67].map((p) => ({
      pitch: p, onset: 0, duration: 0.5, velocity: 0.7,
    }));
    const r = detectKey(notes);
    expect(r.key).toBe('C');
    expect(r.mode).toBe('major');
    expect(r.confidence).toBeGreaterThan(0.6);
  });

  it('returns A minor for an A minor scale', () => {
    // A minor: A B C D E F G (MIDI 69 71 72 74 76 77 79)
    const notes: NoteEvent[] = [69, 71, 72, 74, 76, 77, 79, 74, 72, 69].map((p) => ({
      pitch: p, onset: 0, duration: 0.5, velocity: 0.7,
    }));
    const r = detectKey(notes);
    expect(r.key).toBe('A');
    expect(r.mode).toBe('minor');
  });

  it('returns C major for a single sustained C note (low confidence but valid key)', () => {
    const notes: NoteEvent[] = [
      { pitch: 60, onset: 0, duration: 5, velocity: 0.7 },
    ];
    const r = detectKey(notes);
    expect(r.key).toBe('C');
    expect(['major', 'minor']).toContain(r.mode);
    expect(r.confidence).toBeLessThan(0.5); // low confidence
  });

  it('returns confidence 0 for empty input', () => {
    const r = detectKey([]);
    expect(r.confidence).toBe(0);
  });

  it('handles sharps (F# major)', () => {
    // F# major: F# G# A# B C# D# E# F# (MIDI 66 68 70 71 73 75 78)
    const notes: NoteEvent[] = [66, 68, 70, 71, 73, 75, 78, 66].map((p) => ({
      pitch: p, onset: 0, duration: 0.5, velocity: 0.7,
    }));
    const r = detectKey(notes);
    expect(r.key).toBe('F#');
    expect(r.mode).toBe('major');
  });
});
