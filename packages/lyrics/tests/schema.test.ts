import { describe, it, expect } from 'vitest';
import { validateLyrics } from '../src/schema';

describe('validateLyrics', () => {
  it('accepts valid lyrics JSON', () => {
    const ok = validateLyrics({ lines: [{ text: 'Hello' }, { text: 'World' }] });
    expect(ok).toEqual({ lines: [{ text: 'Hello' }, { text: 'World' }] });
  });

  it('throws on missing lines', () => {
    expect(() => validateLyrics({})).toThrow();
  });

  it('throws on empty lines array', () => {
    expect(() => validateLyrics({ lines: [] })).toThrow();
  });

  it('throws on lines with missing text', () => {
    expect(() => validateLyrics({ lines: [{ foo: 'bar' }] })).toThrow();
  });

  it('throws on non-string text', () => {
    expect(() => validateLyrics({ lines: [{ text: 123 }] })).toThrow();
  });
});
