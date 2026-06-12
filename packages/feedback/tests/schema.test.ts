import { describe, it, expect } from 'vitest';
import { validateFeedback } from '../src/schema';

describe('validateFeedback', () => {
  it('accepts valid feedback JSON', () => {
    const ok = validateFeedback({
      items: [
        { category: 'pitch', severity: 'warning', text: '第 3 个音偏高半音' },
        { category: 'praise', severity: 'praise', text: '节奏稳定' },
      ],
    });
    expect(ok.items).toHaveLength(2);
  });

  it('throws on missing items', () => {
    expect(() => validateFeedback({})).toThrow();
  });

  it('throws on empty items array', () => {
    expect(() => validateFeedback({ items: [] })).toThrow();
  });

  it('throws on more than 8 items (LLM should stop at 5)', () => {
    const items = Array.from({ length: 9 }, () => ({ category: 'praise', severity: 'info', text: 'x' }));
    expect(() => validateFeedback({ items })).toThrow();
  });

  it('throws on invalid category', () => {
    expect(() => validateFeedback({ items: [{ category: 'invalid', severity: 'info', text: 'x' }] })).toThrow();
  });
});
