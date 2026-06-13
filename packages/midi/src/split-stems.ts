import { Midi } from '@tonejs/midi';

const STEM_NAMES = ['melody', 'chords', 'bass', 'drums'] as const;

export function splitStems(input: Midi): Midi[] {
  return STEM_NAMES.map((name, i) => {
    const stem = new Midi();
    stem.name = name;
    if (input.tracks[i]) {
      const sourceTrack = input.tracks[i]!;
      const newTrack = stem.addTrack();
      newTrack.name = name;
      for (const note of sourceTrack.notes) {
        newTrack.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      }
    } else {
      stem.addTrack().name = name;
    }
    return stem;
  });
}
