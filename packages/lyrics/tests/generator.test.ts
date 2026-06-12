import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateLyrics } from '../src/generator';

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
  locale: 'zh' as const,
};

describe('generateLyrics', () => {
  it('POSTs to {baseUrl}/api/generate for Ollama', async () => {
    mockFetch({ response: '{"lines":[{"text":"第一行"},{"text":"第二行"}]}' });
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.objectContaining({ method: 'POST' }));
  });

  it('returns parsed lines on valid JSON', async () => {
    mockFetch({ response: '{"lines":[{"text":"第一行"},{"text":"第二行"}]}' });
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lyrics.locale).toBe('zh');
      expect(r.lyrics.lines).toHaveLength(2);
      expect(r.lyrics.lines[0]!.text).toBe('第一行');
    }
  });

  it('extracts JSON from markdown fences', async () => {
    mockFetch({ response: '```json\n{"lines":[{"text":"hi"}]}\n```' });
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.lyrics.lines[0]!.text).toBe('hi');
  });

  it('truncates to 16 lines if more than 16', async () => {
    const manyLines = Array.from({ length: 20 }, (_, i) => ({ text: `line ${i}` }));
    mockFetch({ response: JSON.stringify({ lines: manyLines }) });
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lyrics.lines).toHaveLength(16);
    }
  });

  it('returns ok:false on Zod validation failure (empty lines)', async () => {
    mockFetch({ response: '{"lines":[]}' });
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/validation|empty/i);
  });

  it('returns ok:false on Zod validation failure (no lines field)', async () => {
    mockFetch({ response: '{"foo":"bar"}' });
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(false);
  });

  it('returns ok:false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as any;
    const r = await generateLyrics(validInput);
    expect(r.ok).toBe(false);
  });

  it('uses OAI-compatible endpoint for openai-compatible model', async () => {
    mockFetch({ choices: [{ message: { content: '{"lines":[{"text":"hi"}]}' } }] });
    const r = await generateLyrics({ ...validInput, model: 'openai-compatible', localBaseUrl: 'http://localhost:1234/v1', localModel: 'qwen2.5-coder-7b' });
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', expect.anything());
  });
});
