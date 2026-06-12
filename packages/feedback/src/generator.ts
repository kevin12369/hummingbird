import { validateFeedback } from './schema';
import type { FeedbackOutput } from './types';

export interface GenerateFeedbackInput {
  prompt: { system: string; user: string };
  model: 'ollama' | 'openai-compatible';
  localBaseUrl: string;
  localModel: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

export interface GenerateFeedbackResult {
  ok: boolean;
  feedback?: FeedbackOutput;
  error?: string;
}

function extractJson(text: string): any | null {
  try { return JSON.parse(text); } catch {}
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1]!); } catch {}
  }
  const blockMatch = text.match(/\{[\s\S]+\}/);
  if (blockMatch) {
    try { return JSON.parse(blockMatch[0]); } catch {}
  }
  return null;
}

async function callOllama(input: GenerateFeedbackInput): Promise<string> {
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
        options: { temperature: 0.5, num_predict: 600 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { response?: string };
    return json.response ?? '';
  } finally { clearTimeout(timer); }
}

async function callOpenAiCompatible(input: GenerateFeedbackInput): Promise<string> {
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
        max_tokens: 600,
        temperature: 0.5,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`OAI ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? '';
  } finally { clearTimeout(timer); }
}

export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackResult> {
  try {
    const text = input.model === 'ollama' ? await callOllama(input) : await callOpenAiCompatible(input);
    const json = extractJson(text);
    if (!json) {
      return { ok: false, error: 'Failed to extract JSON from LLM response' };
    }
    const validated = validateFeedback(json);
    return { ok: true, feedback: { items: validated.items as any, rawText: text } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
