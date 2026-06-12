import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { arrangeMusic, trySampleArrangeMusic, shouldSkipLlmForTrySample } from '../lib/llm-direct';

const originalFetch = globalThis.fetch;
const originalLocation = window.location;
const originalEnv = process.env.NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM;

function setHostname(value: string) {
  // jsdom defines `hostname` on the Location prototype as a non-configurable
  // getter, so we can't redefine it. Replace the whole `window.location`
  // with a plain object that exposes the same shape used by llm-direct.ts.
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { hostname: value },
  });
}

beforeEach(() => {
  setHostname('localhost');
  delete process.env.NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  Object.defineProperty(window, 'location', { configurable: true, writable: true, value: originalLocation });
  if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM;
  else process.env.NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM = originalEnv;
});

function mockFetch(body: any, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as any);
}

const validInput = {
  prompt: { system: 's', user: 'u' },
  model: 'ollama' as const,
  localBaseUrl: 'http://localhost:11434',
  localModel: 'llama3.1:8b',
};

describe('arrangeMusic', () => {
  it('POSTs to {baseUrl}/api/generate for Ollama', async () => {
    mockFetch({ response: '{"chordProgression":["I","V","vi","IV"],"bassLine":["C2","G2","A2","F2","C2","G2","A2","F2"],"drumPattern":[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0]}' });
    const r = await arrangeMusic(validInput);
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.objectContaining({ method: 'POST' }));
  });

  it('POSTs to {baseUrl}/chat/completions for OpenAI-compatible', async () => {
    mockFetch({ choices: [{ message: { content: '{"chordProgression":["I","V","vi","IV"],"bassLine":["C2","G2","A2","F2","C2","G2","A2","F2"],"drumPattern":[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0]}' } }] });
    const r = await arrangeMusic({ ...validInput, model: 'openai-compatible', localBaseUrl: 'http://localhost:1234/v1', localModel: 'qwen2.5-coder-7b' });
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', expect.objectContaining({ method: 'POST' }));
  });

  it('extracts JSON from markdown fences in LLM response', async () => {
    mockFetch({ response: '```json\n{"chordProgression":["I"],"bassLine":["C2"],"drumPattern":[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}\n```' });
    const r = await arrangeMusic(validInput);
    expect(r.ok).toBe(true);
    if (r.ok && r.arrangement) expect(r.arrangement.chordProgression).toEqual(['I']);
  });

  it('returns fallback arrangement on bad JSON', async () => {
    mockFetch({ response: 'not valid json at all' });
    const r = await arrangeMusic(validInput);
    expect(r.ok).toBe(true);
    if (r.ok && r.arrangement) {
      expect(r.arrangement.chordProgression).toEqual(['I', 'V', 'vi', 'IV']); // pop fallback
    }
  });

  it('returns ok:false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as any;
    const r = await arrangeMusic(validInput);
    expect(r.ok).toBe(false);
  });
});

describe('trySampleArrangeMusic', () => {
  it('skips LLM and returns pop fallback when on github.io', async () => {
    setHostname('kevin12369.github.io');
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as any;
    const r = await trySampleArrangeMusic(validInput);
    expect(r.ok).toBe(true);
    expect(r.arrangement?.chordProgression).toEqual(['I', 'V', 'vi', 'IV']);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips LLM when NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM=true', async () => {
    process.env.NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM = 'true';
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as any;
    const r = await trySampleArrangeMusic(validInput);
    expect(r.ok).toBe(true);
    expect(r.arrangement?.bpm).toBe(120);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('delegates to real arrangeMusic on localhost (LLM path still available)', async () => {
    mockFetch({ response: '{"chordProgression":["ii","V","I","vi"],"bassLine":["D2","G2","C2","A2"],"drumPattern":[1,0,0,0]}' });
    const r = await trySampleArrangeMusic(validInput);
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.objectContaining({ method: 'POST' }));
    expect(r.arrangement?.chordProgression).toEqual(['ii', 'V', 'I', 'vi']);
  });
});

describe('shouldSkipLlmForTrySample', () => {
  it('returns false on localhost with no env var', () => {
    expect(shouldSkipLlmForTrySample()).toBe(false);
  });
  it('returns true when env var is set', () => {
    process.env.NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM = 'true';
    expect(shouldSkipLlmForTrySample()).toBe(true);
  });
});
