import type { Key, Mode, NoteEvent } from '@hummingbird/audio';
import type { LyricsOutput } from '@hummingbird/lyrics';

export type Style = 'pop' | 'lo-fi' | 'jazz' | 'rock' | 'classical';

interface BaseState {
  notes?: NoteEvent[];
  blob?: Blob;
  targetStyle?: Style;
  lyrics?: LyricsOutput;
  lyricsError?: string;
}

export type State =
  | ({ status: 'idle' } & BaseState)
  | ({ status: 'recording'; startedAt?: number } & BaseState)
  | ({ status: 'processing'; blob: Blob; key: Key; mode: Mode; bpm: number } & BaseState)
  | ({ status: 'ready'; midi: Uint8Array; key: Key; mode: Mode; bpm: number; style?: Style } & BaseState)
  | ({ status: 'playing'; midi: Uint8Array; key: Key; mode: Mode; bpm: number; style?: Style } & BaseState)
  | ({ status: 'lyrics-generating'; midi: Uint8Array; key: Key; mode: Mode; bpm: number; style?: Style } & BaseState)
  | ({ status: 'error'; message: string } & BaseState);

export type Event =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; blob: Blob; notes: NoteEvent[]; key: Key; mode: Mode; bpm: number; style: Style }
  | { type: 'PROCESS_COMPLETE'; midi: Uint8Array }
  | { type: 'PROCESS_ERROR'; message: string }
  | { type: 'PLAY' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'GENERATE_LYRICS' }
  | { type: 'LYRICS_COMPLETE'; lyrics: LyricsOutput }
  | { type: 'LYRICS_ERROR'; message: string }
  | { type: 'TRY_OTHER_STYLE'; style: Style };

export function initialState(): State {
  return { status: 'idle' };
}

export function createMachine(state: State) {
  return {
    state,
    transition(event: Event): State {
      switch (event.type) {
        case 'START_RECORDING':
          if (state.status === 'idle' || state.status === 'error') {
            return { status: 'recording', startedAt: Date.now() };
          }
          return state;
        case 'STOP_RECORDING':
          if (state.status === 'recording') {
            return {
              status: 'processing',
              blob: event.blob,
              notes: event.notes,
              key: event.key,
              mode: event.mode,
              bpm: event.bpm,
              targetStyle: event.style,
            };
          }
          return state;
        case 'PROCESS_COMPLETE':
          if (state.status === 'processing') {
            return {
              status: 'ready',
              midi: event.midi,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              style: state.targetStyle,
              notes: state.notes,
              blob: state.blob,
            };
          }
          return state;
        case 'PROCESS_ERROR':
          if (state.status === 'processing') {
            return { status: 'error', message: event.message };
          }
          return state;
        case 'PLAY':
          if (state.status === 'ready') {
            return {
              status: 'playing',
              midi: state.midi,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              style: state.style,
              notes: state.notes,
              blob: state.blob,
            };
          }
          return state;
        case 'STOP':
          if (state.status === 'playing') {
            return {
              status: 'ready',
              midi: state.midi,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              style: state.style,
              notes: state.notes,
              blob: state.blob,
            };
          }
          return state;
        case 'RESET':
          return { status: 'idle' };
        case 'GENERATE_LYRICS':
          if (state.status === 'ready') {
            return {
              status: 'lyrics-generating',
              midi: state.midi,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              style: state.style,
              notes: state.notes,
              blob: state.blob,
            };
          }
          return state;
        case 'LYRICS_COMPLETE':
          if (state.status === 'lyrics-generating') {
            return {
              status: 'ready',
              midi: state.midi,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              style: state.style,
              notes: state.notes,
              blob: state.blob,
              lyrics: event.lyrics,
            };
          }
          return state;
        case 'LYRICS_ERROR':
          if (state.status === 'lyrics-generating') {
            return {
              status: 'ready',
              midi: state.midi,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              style: state.style,
              notes: state.notes,
              blob: state.blob,
              lyricsError: event.message,
            };
          }
          return state;
        case 'TRY_OTHER_STYLE':
          if (state.status === 'ready') {
            return {
              status: 'processing',
              blob: state.blob!,
              notes: state.notes!,
              key: state.key,
              mode: state.mode,
              bpm: state.bpm,
              targetStyle: event.style,
            };
          }
          return state;
      }
    },
  };
}
