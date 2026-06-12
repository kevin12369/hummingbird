import { describe, it, expect } from 'vitest';
import { assembleMidi } from '../src/assembler';
import type { NoteEvent, Arrangement } from '../src/types';

const sampleNotes: NoteEvent[] = [
  { pitch: 60, onset: 0, duration: 0.5, velocity: 0.7 },
  { pitch: 62, onset: 0.5, duration: 0.5, velocity: 0.7 },
  { pitch: 64, onset: 1, duration: 0.5, velocity: 0.7 },
];

const sampleArrangement: Arrangement = {
  chordProgression: ['I', 'V', 'vi', 'IV'],
  bassLine: ['C2', 'G2', 'A2', 'F2', 'C2', 'G2', 'A2', 'F2'],
  drumPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  bpm: 120,
};

describe('assembleMidi', () => {
  it('returns a Uint8Array', async () => {
    const midi = await assembleMidi({ notes: sampleNotes, arrangement: sampleArrangement });
    expect(midi).toBeInstanceOf(Uint8Array);
    expect(midi.length).toBeGreaterThan(0);
  });

  it('starts with MIDI header MThd', async () => {
    const midi = await assembleMidi({ notes: sampleNotes, arrangement: sampleArrangement });
    // MThd = 0x4D 0x54 0x68 0x64
    expect(midi[0]).toBe(0x4D);
    expect(midi[1]).toBe(0x54);
    expect(midi[2]).toBe(0x68);
    expect(midi[3]).toBe(0x64);
  });

  it('contains 4 user tracks (melody, chords, bass, drums) plus 1 conductor (tempo/time-sig meta)', async () => {
    const midi = await assembleMidi({ notes: sampleNotes, arrangement: sampleArrangement });
    // Count MTrk headers. @tonejs/midi@2 emits a conductor track (track 0) for
    // tempo + time-signature meta events, so 4 user tracks produce 5 MTrk blocks.
    const text = new TextDecoder().decode(midi);
    const matches = text.match(/MTrk/g);
    expect(matches?.length).toBe(5);
  });

  it('handles empty notes gracefully (melody track still has notes from other sources)', async () => {
    const midi = await assembleMidi({ notes: [], arrangement: sampleArrangement });
    expect(midi.length).toBeGreaterThan(0);
  });

  it('respects custom bpm', async () => {
    const fast = await assembleMidi({ notes: sampleNotes, arrangement: { ...sampleArrangement, bpm: 200 } });
    const slow = await assembleMidi({ notes: sampleNotes, arrangement: { ...sampleArrangement, bpm: 60 } });
    // Different bpm = different bytes (tempo meta event)
    expect(Array.from(fast)).not.toEqual(Array.from(slow));
  });

  it('adds a 5th lyrics track when lyrics are provided', async () => {
    const lyrics = [
      { text: 'Line 1' }, { text: 'Line 2' }, { text: 'Line 3' }, { text: 'Line 4' },
      { text: 'Line 5' }, { text: 'Line 6' }, { text: 'Line 7' }, { text: 'Line 8' },
    ];
    const midi = await assembleMidi({ notes: sampleNotes, arrangement: sampleArrangement, lyrics });
    // 5 user tracks + 1 conductor track = 6 MTrk blocks
    const text = new TextDecoder().decode(midi);
    const matches = text.match(/MTrk/g);
    expect(matches?.length).toBe(6);
  });

  it('omits lyrics track when no lyrics', async () => {
    const midi = await assembleMidi({ notes: sampleNotes, arrangement: sampleArrangement });
    // 4 user tracks + 1 conductor = 5 MTrk blocks (existing behavior)
    const text = new TextDecoder().decode(midi);
    const matches = text.match(/MTrk/g);
    expect(matches?.length).toBe(5);
  });

  it('lyrics track is parseable via Midi() re-load', async () => {
    const lyrics = Array.from({ length: 8 }, (_, i) => ({ text: `Line ${i + 1}` }));
    const midi = await assembleMidi({ notes: sampleNotes, arrangement: sampleArrangement, lyrics });
    const { Midi: MidiClass } = await import('@tonejs/midi');
    const parsed = new MidiClass(midi);
    // 5 user tracks (melody, chords, bass, drums, lyrics)
    const lyricsTrack = parsed.tracks.find((t) => t.name === 'lyrics');
    expect(lyricsTrack).toBeDefined();
  });
});
