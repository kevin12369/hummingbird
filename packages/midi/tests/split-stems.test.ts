import { describe, it, expect } from 'vitest';
import { Midi } from '@tonejs/midi';
import { splitStems } from '../src/split-stems';

describe('splitStems', () => {
  it('1 个多轨 Midi → 4 个单轨 Midi', () => {
    const midi = new Midi();
    midi.addTrack().name = 'melody';
    midi.addTrack().name = 'chords';
    midi.addTrack().name = 'bass';
    midi.addTrack().name = 'drums';
    const stems = splitStems(midi);
    expect(stems).toHaveLength(4);
    expect(stems[0]?.name).toBe('melody');
    expect(stems[3]?.name).toBe('drums');
  });

  it('少于 4 轨时填充空轨', () => {
    const midi = new Midi();
    midi.addTrack().name = 'melody';
    const stems = splitStems(midi);
    expect(stems).toHaveLength(4);
    expect(stems[1]?.tracks).toHaveLength(1);
  });

  it('每个 stem 都能转 Uint8Array', () => {
    const midi = new Midi();
    midi.addTrack().name = 'melody';
    const stems = splitStems(midi);
    const bytes = stems[0]!.toArray();
    expect(bytes.length).toBeGreaterThan(0);
  });
});
