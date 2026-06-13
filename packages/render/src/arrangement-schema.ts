import * as v from 'valibot';

// 单个 chord 标记(罗马数字 + 7th/9th 等延伸)
const ChordSymbol = v.string();

// 鼓型(8 种对应 12 风格)
const DrumPattern = v.picklist([
  'standard', 'brush', 'half-time', 'triplet',
  '4-on-floor', 'half-trap', 'funk', 'soft-kit',
] as const);

// Key 枚举(12 大调 + 12 小调)
const Key = v.picklist([
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const);

const Mode = v.picklist(['major', 'minor'] as const);

export const ArrangementSchema = v.object({
  chordProgression: v.pipe(v.array(ChordSymbol), v.minLength(1), v.maxLength(8)),
  bassLine: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(16)),
  drumPattern: DrumPattern,
  bpm: v.pipe(v.number(), v.minValue(40), v.maxValue(200)),
  key: Key,
  mode: Mode,
});

export type Arrangement = v.InferOutput<typeof ArrangementSchema>;

export function parseArrangement(input: unknown): Arrangement {
  return v.parse(ArrangementSchema, input);
}

export function safeParseArrangement(
  input: unknown,
): { ok: true; data: Arrangement } | { ok: false; error: v.ValiError<typeof ArrangementSchema> } {
  const result = v.safeParse(ArrangementSchema, input);
  if (result.success) {
    return { ok: true, data: result.output };
  }
  return { ok: false, error: new v.ValiError(result.issues) };
}