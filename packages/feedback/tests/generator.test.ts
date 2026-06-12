import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateFeedback } from '../src/generator';

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

describe('generateFeedback', () => {
  it('POSTs to {baseUrl}/api/generate for Ollama', async () => {
    mockFetch({ response: '{"items":[{"category":"praise","severity":"info","text":"good"}]}' });
    const r = await generateFeedback(validInput);
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.objectContaining({ method: 'POST' }));
  });

  it('returns parsed items on valid JSON', async () => {
    mockFetch({ response: '{"items":[{"category":"praise","severity":"info","text":"节奏稳定"}]}' });
    const r = await generateFeedback(validInput);
    expect(r.ok).toBe(true);
    if (r.ok && r.feedback) {
      expect(r.feedback.items).toHaveLength(1);
      expect(r.feedback.items[0]!.text).toBe('节奏稳定');
    }
  });

  it('extracts JSON from markdown fences', async () => {
    mockFetch({ response: '```json\n{"items":[{"category":"pitch","severity":"warning","text":"hi"}]}\n```' });
    const r = await generateFeedback(validInput);
    expect(r.ok).toBe(true);
  });

  it('returns ok:false on Zod validation failure', async () => {
    mockFetch({ response: '{"items":[]}' });
    const r = await generateFeedback(validInput);
    expect(r.ok).toBe(false);
  });

  it('returns ok:false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as any;
    const r = await generateFeedback(validInput);
    expect(r.ok).toBe(false);
  });

  it('uses OAI-compatible endpoint for openai-compatible model', async () => {
    mockFetch({ choices: [{ message: { content: '{"items":[{"category":"praise","severity":"info","text":"hi"}]}' } }] });
    const r = await generateFeedback({ ...validInput, model: 'openai-compatible', localBaseUrl: 'http://localhost:1234/v1', localModel: 'qwen2.5-coder-7b' });
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', expect.anything());
  });
});
