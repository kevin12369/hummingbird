import { describe, it, expect } from 'vitest';
import { STYLES, STYLE_META, STYLE_BY_CATEGORY, isStyleId } from '../src/styles';

describe('STYLES', () => {
  it('包含 12 个风格', () => {
    expect(STYLES).toHaveLength(12);
  });

  it('无重复 id', () => {
    const set = new Set(STYLES);
    expect(set.size).toBe(STYLES.length);
  });
});

describe('STYLE_META', () => {
  it('每个 id 都有 meta', () => {
    for (const id of STYLES) {
      expect(STYLE_META[id]).toBeDefined();
      expect(STYLE_META[id].name).toBeTruthy();
      expect(STYLE_META[id].nameZh).toBeTruthy();
    }
  });

  it('emoji 字段在 4 字节内(浏览器渲染安全)', () => {
    for (const id of STYLES) {
      const emoji = STYLE_META[id].emoji;
      expect(emoji.length).toBeLessThanOrEqual(4);
    }
  });
});

describe('STYLE_BY_CATEGORY', () => {
  it('三类共 12 个风格,无重复', () => {
    const all = [
      ...STYLE_BY_CATEGORY.beat,
      ...STYLE_BY_CATEGORY.mood,
      ...STYLE_BY_CATEGORY.genre,
    ];
    expect(all).toHaveLength(12);
    expect(new Set(all).size).toBe(12);
  });

  it('每个风格都属于某一类', () => {
    for (const id of STYLES) {
      const inSome = Object.values(STYLE_BY_CATEGORY).some(c => c.includes(id));
      expect(inSome).toBe(true);
    }
  });
});

describe('isStyleId', () => {
  it('合法 id 返回 true', () => {
    expect(isStyleId('pop')).toBe(true);
    expect(isStyleId('lofi')).toBe(true);
    expect(isStyleId('kpop')).toBe(true);
  });

  it('非法 id 返回 false', () => {
    expect(isStyleId('rock')).toBe(false);
    expect(isStyleId('')).toBe(false);
    expect(isStyleId('POP')).toBe(false);
  });
});