import { buildPrompt, type Style, type PromptOutput } from '@hummingbird/prompt';
import type { NoteEvent, Key, Mode } from '@hummingbird/audio';

export interface ArrangeInput {
  prompt: { system: string; user: string };
  model: 'ollama' | 'openai-compatible';
  localBaseUrl: string;
  localModel: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

export interface Arrangement {
  chordProgression: string[];
  bassLine: string[];
  drumPattern: number[];
  bpm: number;
}

export interface ArrangeResult {
  ok: boolean;
  arrangement?: Arrangement;
  error?: string;
}

const POP_FALLBACK: Arrangement = {
  chordProgression: ['I', 'V', 'vi', 'IV'],
  bassLine: ['C2', 'G2', 'A2', 'F2', 'C2', 'G2', 'A2', 'F2'],
  drumPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  bpm: 120,
};

function extractJson(text: string): any | null {
  // Try 1: plain JSON
  try { return JSON.parse(text); } catch {}
  // Try 2: extract from markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1]!); } catch {}
  }
  // Try 3: find the first { ... } block
  const blockMatch = text.match(/\{[\s\S]+\}/);
  if (blockMatch) {
    try { return JSON.parse(blockMatch[0]); } catch {}
  }
  return null;
}

function validateArrangement(obj: any): obj is Arrangement {
  return obj
    && Array.isArray(obj.chordProgression) && obj.chordProgression.length >= 1
    && Array.isArray(obj.bassLine) && obj.bassLine.length >= 1
    && Array.isArray(obj.drumPattern);
}

async function callOllama(input: ArrangeInput): Promise<string> {
  const url = `${input.localBaseUrl.replace(/\/$/, '')}/api/generate`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.localTimeoutMs ?? 30000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: input.localModel,
        prompt: `${input.prompt.system}\n\n${input.prompt.user}`,
        stream: false,
        options: { temperature: 0.4, num_predict: 500 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { response?: string };
    return json.response ?? '';
  } finally { clearTimeout(timer); }
}

async function callOpenAiCompatible(input: ArrangeInput): Promise<string> {
  const url = `${input.localBaseUrl.replace(/\/$/, '')}/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.localTimeoutMs ?? 30000);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (input.localApiKey) headers['Authorization'] = `Bearer ${input.localApiKey}`;
    const res = await fetch(url, {
      method: 'POST', headers,
      body: JSON.stringify({
        model: input.localModel,
        messages: [
          { role: 'system', content: input.prompt.system },
          { role: 'user', content: input.prompt.user },
        ],
        max_tokens: 500,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`OAI ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? '';
  } finally { clearTimeout(timer); }
}

export async function arrangeMusic(input: ArrangeInput): Promise<ArrangeResult> {
  try {
    const text = input.model === 'ollama' ? await callOllama(input) : await callOpenAiCompatible(input);
    const json = extractJson(text);
    if (json && validateArrangement(json)) {
      return { ok: true, arrangement: { ...POP_FALLBACK, ...json, bpm: json.bpm ?? 120 } };
    }
    return { ok: true, arrangement: POP_FALLBACK }; // fallback on bad JSON
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function buildArrangePrompt(input: { notes: NoteEvent[]; key: Key; mode: Mode; bpm: number; style: Style }): PromptOutput {
  return buildPrompt(input);
}
