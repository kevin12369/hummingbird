import type { FeedbackInput } from './types';

const SYSTEM = `你是一位音乐教师,擅长给出简短、可执行的反馈意见。
给定一段哼唱的特征(音符数、调式、BPM、风格),输出 3-5 条反馈意见,覆盖以下类别:
- pitch:音准问题(音高偏离调式)
- rhythm:节奏问题(节拍不稳、跳拍)
- tempo:速度问题(过快或过慢)
- style:风格匹配问题(风格与音符不匹配)
- praise:正面肯定(1-2 条,鼓励用户)

每条意见:
- 短句 30-60 字
- severity: info(中性) | warning(需要改进) | praise(肯定)
- 简洁、可执行,避免空话

输出 STRICT JSON,不要任何其他文字、解释或 markdown 围栏:
{
  "items": [
    { "category": "pitch", "severity": "warning", "text": "第 3 个音偏高半音,可试试降下来" },
    { "category": "praise", "severity": "praise", "text": "节奏稳定,继续!" }
  ]
}

要求:
- 至少 1 条 praise(用户需要鼓励)
- 至少 1 条具体可改进的 feedback(不要全表扬)
- 严禁输出 JSON 之外的文字`;

export function buildFeedbackPrompt(input: FeedbackInput): { system: string; user: string } {
  const user = `Humming characteristics:
- Notes: ${input.notesSummary}
- Key: ${input.key} ${input.mode}
- BPM: ${input.bpm}
- Style: ${input.style}

Output STRICT JSON now.`;
  return { system: SYSTEM, user };
}
