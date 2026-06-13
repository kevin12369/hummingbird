import { describe, it, expect } from 'vitest';
import { reducer, initialState, type State } from '../lib/state-machine';

describe('state-machine 不变量', () => {
  it('idle → queued', () => {
    const next = reducer(initialState, { type: 'RENDER_QUEUED' });
    expect(next.render).toBe('queued');
  });

  it('queued 防重入(再次 RENDER_QUEUED 被忽略)', () => {
    const queued = reducer(initialState, { type: 'RENDER_QUEUED' });
    const again = reducer(queued, { type: 'RENDER_QUEUED' });
    expect(again.render).toBe('queued');
    expect(again).toBe(queued);
  });

  it('queued → rendering → rendered 顺序不可逆', () => {
    let s = reducer(initialState, { type: 'RENDER_QUEUED' });
    s = reducer(s, { type: 'RENDER_STARTED' });
    expect(s.render).toBe('rendering');
    s = reducer(s, { type: 'RENDER_DONE', bytes: new Uint8Array([1, 2, 3]), format: 'mp3' });
    expect(s.render).toBe('rendered');
    // rendered → idle 必须显式 RESET,不能 RENDER_DONE 回到 rendered
    const back = reducer(s, { type: 'RENDER_DONE', bytes: new Uint8Array(), format: 'mp3' });
    expect(back.render).toBe('rendered');
  });

  it('rendering → idle 只能通过 CANCEL', () => {
    let s = reducer(initialState, { type: 'RENDER_QUEUED' });
    s = reducer(s, { type: 'RENDER_STARTED' });
    s = reducer(s, { type: 'CANCEL' });
    expect(s.render).toBe('idle');
  });

  it('RENDER_ERROR 回到 error 态', () => {
    let s = reducer(initialState, { type: 'RENDER_QUEUED' });
    s = reducer(s, { type: 'RENDER_STARTED' });
    s = reducer(s, { type: 'RENDER_ERROR', error: { code: 'OOM', message: 'x', recoverable: true, fallbackChain: ['wav'] } });
    expect(s.render).toBe('error');
  });

  it('STEMS_READY 与 RENDER 互不阻塞', () => {
    let s: State = { ...initialState, main: { stage: 'ready', input: { kind: 'recording', audioBlob: new Blob(), notes: [], key: { key: 'C', mode: 'major', confidence: 0.8 } }, style: 'pop', tracks: { melody: {} as any, chords: {} as any, bass: {} as any, drums: {} as any } } };
    s = reducer(s, { type: 'STEMS_READY' });
    expect(s.stems).toBe('ready');
    s = reducer(s, { type: 'RENDER_QUEUED' });
    expect(s.stems).toBe('ready');  // 仍可下载 stems
    expect(s.render).toBe('queued');
  });
});