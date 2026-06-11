import { describe, it, expect, vi, afterEach } from 'vitest';
import { arrangeMusic } from '../lib/llm-direct';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

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
