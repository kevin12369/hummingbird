import { validateLyrics } from './schema';
import type { Locale, LyricsOutput } from './types';

export interface GenerateLyricsInput {
  prompt: { system: string; user: string };
  model: 'ollama' | 'openai-compatible';
  localBaseUrl: string;
  localModel: string;
  localApiKey?: string;
  localTimeoutMs?: number;
  locale: Locale;
}

export type GenerateLyricsResult =
  | { ok: true; lyrics: LyricsOutput }
  | { ok: false; error: string };

const MAX_LINES = 16;
const DEFAULT_TIMEOUT_MS = 30000;

function extractJson(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]!);
    } catch {
      // fall through
    }
  }
  const blockMatch = trimmed.match(/\{[\s\S]+?\}/);
  if (blockMatch) {
    try {
      return JSON.parse(blockMatch[0]);
    } catch {
      // fall through
    }
  }
  return null;
}

async function callOllama(input: GenerateLyricsInput): Promise<string> {
  const url = `${input.localBaseUrl.replace(/\/$/, '')}/api/generate`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.localTimeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: input.localModel,
        prompt: `${input.prompt.system}\n\n${input.prompt.user}`,
        stream: false,
        options: { temperature: 0.7, num_predict: 800 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as { response?: string };
    return json.response ?? '';
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAiCompatible(input: GenerateLyricsInput): Promise<string> {
  const url = `${input.localBaseUrl.replace(/\/$/, '')}/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.localTimeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.localApiKey) {
      headers['Authorization'] = `Bearer ${input.localApiKey}`;
    }
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: input.localModel,
        messages: [
          { role: 'system', content: input.prompt.system },
          { role: 'user', content: input.prompt.user },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`OAI ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}

export async function generateLyrics(input: GenerateLyricsInput): Promise<GenerateLyricsResult> {
  try {
    const text = input.model === 'ollama' ? await callOllama(input) : await callOpenAiCompatible(input);
    const json = extractJson(text);
    if (!json) {
      return { ok: false, error: 'Failed to extract JSON from LLM response' };
    }
    const validated = validateLyrics(json);
    const lines = validated.lines.slice(0, MAX_LINES);
    return {
      ok: true,
      lyrics: {
        locale: input.locale,
        lines,
        rawText: text,
      },
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
