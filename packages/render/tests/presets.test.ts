import { describe, it, expect } from 'vitest';
import { STYLES } from '../src/styles';
import { STYLE_PRESETS, STYLE_PRESETS_BY_ID, getPreset } from '../src/presets';

describe('STYLE_PRESETS', () => {
  it('包含 12 个 preset,id 与 STYLES 一一对应', () => {
    expect(STYLE_PRESETS).toHaveLength(12);
    const ids = STYLE_PRESETS.map(p => p.id).sort();
    const styles = [...STYLES].sort();
    expect(ids).toEqual(styles);
  });

  it('无重复 id', () => {
    const set = new Set(STYLE_PRESETS.map(p => p.id));
    expect(set.size).toBe(STYLE_PRESETS.length);
  });

  it('每个 preset 都有 4 轨且不为空', () => {
    for (const p of STYLE_PRESETS) {
      expect(p.melody.layers.length).toBeGreaterThan(0);
      expect(p.harmony.layers.length).toBeGreaterThan(0);
      expect(p.bass.layers.length).toBeGreaterThan(0);
      expect(p.drums.layers.length).toBeGreaterThan(0);
    }
  });

  it('GM program 都在 0-127 范围内', () => {
    for (const p of STYLE_PRESETS) {
      for (const layer of [...p.melody.layers, ...p.harmony.layers, ...p.bass.layers, ...p.drums.layers]) {
        expect(layer.program).toBeGreaterThanOrEqual(0);
        expect(layer.program).toBeLessThanOrEqual(127);
      }
    }
  });

  it('bpmRange 是 [min, max] 且 min < max', () => {
    for (const p of STYLE_PRESETS) {
      expect(p.melody.bpmRange).toHaveLength(2);
      const [lo, hi] = p.melody.bpmRange;
      expect(lo).toBeLessThan(hi);
      expect(lo).toBeGreaterThanOrEqual(40);
      expect(hi).toBeLessThanOrEqual(200);
    }
  });

  it('fx 字段完整且数值在合理范围', () => {
    for (const p of STYLE_PRESETS) {
      const fx = p.fx;
      expect(fx.reverbSendDb).toBeGreaterThanOrEqual(-60);
      expect(fx.reverbSendDb).toBeLessThanOrEqual(0);
      expect(fx.lowpassCutoffHz).toBeGreaterThanOrEqual(200);
      expect(fx.lowpassCutoffHz).toBeLessThanOrEqual(20000);
      expect(fx.swingPercent).toBeGreaterThanOrEqual(0);
      expect(fx.swingPercent).toBeLessThanOrEqual(100);
    }
  });
});

describe('STYLE_PRESETS_BY_ID / getPreset', () => {
  it('字典含 12 项', () => {
    expect(Object.keys(STYLE_PRESETS_BY_ID)).toHaveLength(12);
  });

  it('getPreset(pop) 返回 pop preset', () => {
    const p = getPreset('pop');
    expect(p.id).toBe('pop');
    expect(p.name).toBeTruthy();
    expect(p.nameZh).toBeTruthy();
  });

  it('getPreset 与 STYLE_PRESETS_BY_ID[id] 同引用', () => {
    expect(getPreset('jazz')).toBe(STYLE_PRESETS_BY_ID.jazz);
  });
});
