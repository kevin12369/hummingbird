export interface NoteEvent {
  pitch: number;     // MIDI note number 0-127
  onset: number;     // seconds
  duration: number;  // seconds
  velocity: number;  // 0-127
}

export type Key = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type Mode = 'major' | 'minor';

export interface KeyDetection {
  key: Key;
  mode: Mode;
  confidence: number; // 0-1
}
