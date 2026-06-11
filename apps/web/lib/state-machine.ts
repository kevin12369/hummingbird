import type { Key, Mode } from '@hummingbird/audio';

export type State =
  | { status: 'idle' }
  | { status: 'recording'; blob?: Blob; startedAt?: number }
  | { status: 'processing'; blob: Blob }
  | { status: 'ready'; midi: Uint8Array; key: Key; mode: Mode; bpm: number }
  | { status: 'playing'; midi: Uint8Array; key: Key; mode: Mode; bpm: number }
  | { status: 'error'; message: string };

export type Event =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; blob: Blob }
  | { type: 'PROCESS_COMPLETE'; midi: Uint8Array; key: Key; mode: Mode; bpm: number }
  | { type: 'PROCESS_ERROR'; message: string }
  | { type: 'PLAY' }
  | { type: 'STOP' }
  | { type: 'RESET' };

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
            return { status: 'processing', blob: event.blob };
          }
          return state;
        case 'PROCESS_COMPLETE':
          if (state.status === 'processing') {
            return { status: 'ready', midi: event.midi, key: event.key, mode: event.mode, bpm: event.bpm };
          }
          return state;
        case 'PROCESS_ERROR':
          if (state.status === 'processing') {
            return { status: 'error', message: event.message };
          }
          return state;
        case 'PLAY':
          if (state.status === 'ready') {
            return { status: 'playing', midi: state.midi, key: state.key, mode: state.mode, bpm: state.bpm };
          }
          return state;
        case 'STOP':
          if (state.status === 'playing') {
            return { status: 'ready', midi: state.midi, key: state.key, mode: state.mode, bpm: state.bpm };
          }
          return state;
        case 'RESET':
          return { status: 'idle' };
      }
    },
  };
}
