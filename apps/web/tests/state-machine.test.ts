import { describe, it, expect } from 'vitest';
import { createMachine, initialState, type State, type Event } from '../lib/state-machine';
import type { FeedbackOutput } from '@hummingbird/feedback';

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
    const next = m.transition({ type: 'STOP_RECORDING', blob: new Blob(['y']), notes: [], key: 'C', mode: 'major', bpm: 120, style: 'pop' });
    expect(next.status).toBe('processing');
  });

  it('transitions processing -> ready on PROCESS_COMPLETE', () => {
    const m = createMachine({ status: 'processing', blob: new Blob(['x']), notes: [], key: 'C', mode: 'major', bpm: 120, targetStyle: 'pop' });
    const next = m.transition({ type: 'PROCESS_COMPLETE', midi: new Uint8Array([1, 2, 3]) });
    expect(next.status).toBe('ready');
    if (next.status === 'ready') {
      expect(next.midi).toEqual(new Uint8Array([1, 2, 3]));
      expect(next.key).toBe('C');
    }
  });

  it('transitions processing -> error on PROCESS_ERROR', () => {
    const m = createMachine({ status: 'processing', blob: new Blob(['x']), key: 'C', mode: 'major', bpm: 120 });
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

  it('transitions ready -> lyrics-generating on GENERATE_LYRICS', () => {
    const m = createMachine({ status: 'ready', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'GENERATE_LYRICS' });
    expect(next.status).toBe('lyrics-generating');
    if (next.status === 'lyrics-generating') {
      expect(next.midi).toEqual(new Uint8Array());
      expect(next.key).toBe('C');
    }
  });

  it('transitions lyrics-generating -> ready on LYRICS_COMPLETE', () => {
    const m = createMachine({ status: 'lyrics-generating', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const lyrics = { locale: 'zh' as const, lines: [{ text: '你好' }], rawText: '...' };
    const next = m.transition({ type: 'LYRICS_COMPLETE', lyrics });
    expect(next.status).toBe('ready');
    if (next.status === 'ready') {
      expect(next.lyrics).toEqual(lyrics);
      expect(next.lyricsError).toBeUndefined();
    }
  });

  it('transitions lyrics-generating -> ready on LYRICS_ERROR (sets lyricsError, preserves state)', () => {
    const m = createMachine({ status: 'lyrics-generating', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'LYRICS_ERROR', message: 'LLM failed' });
    expect(next.status).toBe('ready');
    if (next.status === 'ready') {
      expect(next.lyrics).toBeUndefined();
      expect(next.lyricsError).toBe('LLM failed');
      expect(next.midi).toEqual(new Uint8Array());
      expect(next.key).toBe('C');
    }
  });

  it('transitions ready -> processing on TRY_OTHER_STYLE (with targetStyle + blob)', () => {
    const m = createMachine({ status: 'ready', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120, blob: new Blob(['x']) });
    const next = m.transition({ type: 'TRY_OTHER_STYLE', style: 'jazz' });
    expect(next.status).toBe('processing');
    if (next.status === 'processing') {
      expect(next.blob).toBeInstanceOf(Blob);
      expect(next.targetStyle).toBe('jazz');
    }
  });

  it('preserves notes and key when re-running pipeline (TRY_OTHER_STYLE)', () => {
    const notes = [{ pitch: 60, onset: 0, duration: 0.5, velocity: 0.7 }];
    const m = createMachine({ status: 'ready', midi: new Uint8Array(), key: 'A', mode: 'minor', bpm: 100, blob: new Blob(['x']), notes });
    const next = m.transition({ type: 'TRY_OTHER_STYLE', style: 'rock' });
    if (next.status === 'processing') {
      expect(next.notes).toEqual(notes);
      expect(next.key).toBe('A');
      expect(next.mode).toBe('minor');
      expect(next.bpm).toBe(100);
    }
  });

  it('transitions ready -> feedback-generating on GENERATE_FEEDBACK', () => {
    const m = createMachine({ status: 'ready', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'GENERATE_FEEDBACK' });
    expect(next.status).toBe('feedback-generating');
  });

  it('transitions feedback-generating -> ready on FEEDBACK_COMPLETE (adds feedback field)', () => {
    const m = createMachine({ status: 'feedback-generating', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const feedback: FeedbackOutput = {
      items: [{ category: 'praise', severity: 'praise', text: 'good' }],
      rawText: '',
    };
    const next = m.transition({ type: 'FEEDBACK_COMPLETE', feedback });
    expect(next.status).toBe('ready');
    if (next.status === 'ready') expect(next.feedback).toEqual(feedback);
  });

  it('transitions feedback-generating -> ready on FEEDBACK_ERROR (adds feedbackError field)', () => {
    const m = createMachine({ status: 'feedback-generating', midi: new Uint8Array(), key: 'C', mode: 'major', bpm: 120 });
    const next = m.transition({ type: 'FEEDBACK_ERROR', message: 'LLM failed' });
    expect(next.status).toBe('ready');
    if (next.status === 'ready') expect(next.feedbackError).toBe('LLM failed');
  });

  it('GENERATE_FEEDBACK is no-op from non-ready state', () => {
    const m = createMachine({ status: 'idle' });
    const next = m.transition({ type: 'GENERATE_FEEDBACK' });
    expect(next.status).toBe('idle');
  });
});
