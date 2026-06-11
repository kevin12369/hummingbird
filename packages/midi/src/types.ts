export interface NoteEvent {
  pitch: number;
  onset: number;
  duration: number;
  velocity: number;
}

export interface Arrangement {
  chordProgression: string[];     // Roman numerals (4 chords)
  bassLine: string[];             // 8 notes, "C2" format
  drumPattern: number[];           // 16 steps (0 = rest, 1 = kick, 2 = snare, 3 = hat)
  bpm: number;
}
