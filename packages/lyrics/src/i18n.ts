import type { Locale, LyricsInput } from './types';

export const SUPPORTED_LOCALES: Locale[] = ['zh', 'en', 'ja'];
export type { Locale, LyricsInput };

const ZH_SYSTEM = `你是一位中文歌词作者，擅长为旋律编写押韵的中文歌词。
给定旋律的特征（调式、BPM、风格、已识别音符），写出 8-16 行中文歌词，结构为主歌-副歌-主歌（三段）或 主歌-副歌（两段）。

输出 STRICT JSON，不要任何其他文字、解释或 markdown 围栏:
{
  "lines": [
    { "text": "第一行歌词" },
    { "text": "第二行歌词" },
    ...
  ]
}

要求:
- 每行长度接近旋律的节奏型（3-7 个字/词）
- 押韵：相邻两行末尾字同韵母
- 风格与提供的风格一致
- 避免重复
- 严禁输出任何 JSON 之外的文字`;

const EN_SYSTEM = `You are a lyricist writing English song lyrics.
Given the melody's characteristics (key, BPM, style, extracted notes), write 8-16 lines of English lyrics in a verse-chorus-verse or verse-chorus structure.

Output STRICT JSON only, no prose, no markdown fences:
{
  "lines": [
    { "text": "First line of lyrics" },
    { "text": "Second line of lyrics" },
    ...
  ]
}

Requirements:
- Each line length approximates the melody's rhythmic pattern (3-7 words per line)
- Rhyme scheme: end-rhymes between adjacent lines
- Style consistent with provided style
- Avoid repetition
- Do not output anything outside the JSON`;

const JA_SYSTEM = `あなたは日本語の作詞家です。与えられたメロディの特徴（キー、BPM、スタイル、抽出された音符）に基づき、8〜16行の日本語歌詞を作詞してください。Aメロ-サビ-AメロまたはAメロ-サビの構成で。

STRICT JSON のみ出力してください。説明やマークダウンフェンスは不要:
{
  "lines": [
    { "text": "一行目の歌詞" },
    { "text": "二行目の歌詞" },
    ...
  ]
}

要件:
- 各行の長さはメロディのリズムパターンに近いこと（3〜7語/音節）
- 韻：隣接する行の末尾が韻を踏む
- 提供されたスタイルと一致
- 繰り返しを避ける
- JSON以外の出力は禁止`;

const PROMPTS: Record<Locale, string> = {
  zh: ZH_SYSTEM,
  en: EN_SYSTEM,
  ja: JA_SYSTEM,
};

export function getLyricsPrompt(locale: Locale, input: LyricsInput): { system: string; user: string } {
  const system = PROMPTS[locale];
  const user = `Melody summary:
- Key/BPM/style: ${input.melodySummary}
- BPM: ${input.bpm}
- Style: ${input.style}

Write the lyrics now. Output STRICT JSON only.`;
  return { system, user };
}
