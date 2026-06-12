import { z } from 'zod';
import { LyricsError } from './types';

const LyricsSchema = z.object({
  lines: z.array(z.object({ text: z.string() })).min(1),
});

export function validateLyrics(json: unknown): { lines: Array<{ text: string }> } {
  const result = LyricsSchema.safeParse(json);
  if (!result.success) {
    throw new LyricsError(`Lyrics JSON validation failed: ${result.error.issues.map((i) => i.message).join(', ')}`);
  }
  return result.data;
}
