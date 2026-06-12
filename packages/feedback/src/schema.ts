import { z } from 'zod';
import { FeedbackError } from './types';

const MAX_ITEMS = 8;
const MIN_ITEMS = 1;

const ItemSchema = z.object({
  category: z.enum(['pitch', 'rhythm', 'tempo', 'style', 'praise']),
  severity: z.enum(['info', 'warning', 'praise']),
  text: z.string().min(1),
  context: z.object({ measure: z.number().optional(), noteIndex: z.number().optional() }).optional(),
});

const Schema = z.object({
  items: z.array(ItemSchema).min(MIN_ITEMS).max(MAX_ITEMS),
});

export function validateFeedback(json: unknown): { items: Array<z.infer<typeof ItemSchema>> } {
  const result = Schema.safeParse(json);
  if (!result.success) {
    throw new FeedbackError(`Feedback JSON validation failed: ${result.error.issues.map((i) => i.message).join(', ')}`);
  }
  return result.data;
}
