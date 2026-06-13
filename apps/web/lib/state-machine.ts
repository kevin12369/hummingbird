import type { Midi } from '@tonejs/midi';
import type { StyleId, RenderError } from '@hummingbird/render';

export type Input = RecordingInput | TrySampleInput;

export interface RecordingInput {
  kind: 'recording';
  audioBlob: Blob;
  notes: import('@hummingbird/audio').NoteEvent[];
  key: import('@hummingbird/audio').KeyDetection;
}

export interface TrySampleInput {
  kind: 'sample';
  audioBlob: Blob;
  // Try-sample 无 notes,fallback-arrange 用预设
  notes: import('@hummingbird/audio').NoteEvent[];
  key: import('@hummingbird/audio').KeyDetection;
}

export type MainState =
  | { stage: 'idle' }
  | { stage: 'arranging'; input: Input; style: StyleId }
  | { stage: 'ready'; input: Input; style: StyleId; tracks: { melody: Midi; chords: Midi; bass: Midi; drums: Midi } }
  | { stage: 'error'; error: RenderError };

export type StemsStatus = 'idle' | 'ready' | 'error';

export type RenderStatus =
  | 'idle'
  | 'queued'
  | 'rendering'
  | 'rendered'
  | 'error';

export type Progress = number;  // 0-1

export interface State {
  main: MainState;
  stems: StemsStatus;
  render: RenderStatus;
  progress: Progress;
  format?: 'mp3' | 'wav';
  bytes?: Uint8Array;
}

export const initialState: State = {
  main: { stage: 'idle' },
  stems: 'idle',
  render: 'idle',
  progress: 0,
};

export type Event =
  | { type: 'START_ARRANGING'; input: Input; style: StyleId }
  | { type: 'ARRANGEMENT_READY'; tracks: { melody: Midi; chords: Midi; bass: Midi; drums: Midi }; stems: StemsStatus }
  | { type: 'STEMS_READY' }
  | { type: 'STEMS_ERROR'; error: RenderError }
  | { type: 'RENDER_QUEUED' }
  | { type: 'RENDER_STARTED' }
  | { type: 'RENDER_PROGRESS'; progress: Progress }
  | { type: 'RENDER_DONE'; bytes: Uint8Array; format: 'mp3' | 'wav' }
  | { type: 'RENDER_ERROR'; error: RenderError }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

export function reducer(state: State, event: Event): State {
  switch (event.type) {
    case 'START_ARRANGING':
      return {
        main: { stage: 'arranging', input: event.input, style: event.style },
        stems: 'idle',
        render: 'idle',
        progress: 0,
      };
    case 'ARRANGEMENT_READY':
      if (state.main.stage !== 'arranging') return state;
      return {
        ...state,
        main: { stage: 'ready', input: state.main.input, style: state.main.style, tracks: event.tracks },
        stems: event.stems,
      };
    case 'STEMS_READY':
      return { ...state, stems: 'ready' };
    case 'STEMS_ERROR':
      return { ...state, stems: 'error' };
    case 'RENDER_QUEUED':
      // 防重入:只有 idle 才接受 queued
      if (state.render !== 'idle') return state;
      return { ...state, render: 'queued', progress: 0, bytes: undefined, format: undefined };
    case 'RENDER_STARTED':
      if (state.render !== 'queued') return state;
      return { ...state, render: 'rendering' };
    case 'RENDER_PROGRESS':
      return { ...state, progress: event.progress };
    case 'RENDER_DONE':
      if (state.render !== 'rendering') return state;
      return { ...state, render: 'rendered', bytes: event.bytes, format: event.format, progress: 1 };
    case 'RENDER_ERROR':
      return { ...state, render: 'error' };
    case 'CANCEL':
      return { ...state, render: 'idle', progress: 0 };
    case 'RESET':
      return initialState;
  }
}