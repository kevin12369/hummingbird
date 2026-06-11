export type Style = 'pop' | 'lo-fi' | 'jazz' | 'rock' | 'classical';

export interface NoteEvent {
  pitch: number;
  onset: number;
  duration: number;
  velocity: number;
}

export type Key = string; // 'C' | 'C#' | etc.
export type Mode = 'major' | 'minor';

export interface PromptInput {
  notes: NoteEvent[];
  key: Key;
  mode: Mode;
  bpm: number;
  style: Style;
}

export interface PromptOutput {
  system: string;
  user: string;
}
