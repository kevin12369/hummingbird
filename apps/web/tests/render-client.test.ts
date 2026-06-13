import { describe, it, expect, vi } from 'vitest';
import { detectCapabilities, downloadBytes } from '../lib/render-client';

describe('detectCapabilities', () => {
  it('返回合法 capabilities 对象', async () => {
    const caps = await detectCapabilities();
    expect(caps).toHaveProperty('offlineAudioContext');
    expect(caps).toHaveProperty('audioWorklet');
    expect(caps).toHaveProperty('indexedDb');
  });
});

describe('downloadBytes', () => {
  it('创建 Blob URL + 触发 a.click', () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    (globalThis as any).URL.createObjectURL = createObjectURL;
    (globalThis as any).URL.revokeObjectURL = revokeObjectURL;

    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreate(tag);
      if (tag === 'a') el.click = click;
      return el;
    });

    downloadBytes(new Uint8Array([1, 2, 3]), 'test.mp3', 'audio/mpeg');
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});