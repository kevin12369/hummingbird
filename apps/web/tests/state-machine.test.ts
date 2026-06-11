import { describe, it, expect } from 'vitest';
import { createMachine, initialState, type State, type Event } from '../lib/state-machine';

describe('state machine', () => {
  it('initialState is idle', () => {
    expect(initialState().status).toBe('idle');
  });

  it('transitions idle -> recording on START_RECORDING', () => {
    const m = createMachine(initialState());
    const next = m.transition({ type: 'START_RECORDING' });
    expect(next.status).toBe('recording');
  });

  it('transitions recording -> processing on STOP_RECORDING', () => {
    const m = createMachine({ status: 'recording', blob: new Blob(['x']) });
    const next = m.transition({ type: 'STOP_RECORDING', blob: new Blob(['y']) });
    expect(next.status).toBe('processing');
  });

  it('transitions processing -> ready on PROCESS_COMPLETE', () => {
    const m = createMachine({ status: 'processing', blob: new Blob(['x']) });
    const next = m.transition({ type: 'PROCESS_COMPLETE', midi: new Uint8Array([1, 2, 3]), key: 'C', mode: 'major', bpm: 120 });
    expect(next.status).toBe('ready');
    if (next.status === 'ready') {
      expect(next.midi).toEqual(new Uint8Array([1, 2, 3]));
      expect(next.key).toBe('C');
    }
  });

  it('transitions processing -> error on PROCESS_ERROR', () => {
    const m = createMachine({ status: 'processing', blob: new Blob(['x']) });
    const next = m.transition({ type: 'PROCESS_ERROR', message: 'LLM failed' });
    expect(next.status).toBe('error');
    if (next.status === 'error') expect(next.message).toBe('LLM failed');
  });

  it('transitions ready -> playing on PLAY', () => {
    const m = createMachine({ status: 'ready', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'PLAY' });
    expect(next.status).toBe('playing');
  });

  it('transitions playing -> ready on STOP', () => {
    const m = createMachine({ status: 'playing', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'STOP' });
    expect(next.status).toBe('ready');
  });

  it('transitions any -> idle on RESET', () => {
    const m = createMachine({ status: 'playing', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'RESET' });
    expect(next.status).toBe('idle');
  });
});
