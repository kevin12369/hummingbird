import type { StyleId, StylePreset, StyleFxMap } from './types';
import { STYLE_META } from './styles';

// 12 风格 preset(单一来源:UI 显示 + 渲染 worker + state 共享)
// 数据与 fallback-arrange.ts 同步(同名风格 = 同 bpm/drumMap)
//
// Layer 选择原则:每轨给一个最常见的 GM program;复杂 multi-layer (K-Pop 5 轨叠
// 加、Future Bass 双 lead)通过叠加同一轨多 layer 实现。
const MELODY_PROGRAMS: Record<StyleId, number> = {
  'pop':         80,  // Lead 1 (square)
  'lofi':        4,   // Electric Piano 1
  'indie-pop':   24,  // Nylon Guitar
  'trap':        81,  // Lead 2 (sawtooth)
  'drill':       81,
  'kpop':        81,  // supersaw-friendly
  'city-pop':    4,   // Rhodes
  'house':       81,
  'future-bass': 81,
  'ambient':     89,  // Pad 2 (warm)
  'rnb':         4,
  'jazz':        4,   // Electric Piano (or 65 alto sax for true jazz)
};

// harmony 轨(和弦):钢琴/电钢/吉他
const HARMONY_PROGRAMS: Record<StyleId, number> = {
  'pop':         0,   // Acoustic Grand
  'lofi':        4,   // Electric Piano 1
  'indie-pop':   25,  // Steel Guitar
  'trap':        0,
  'drill':       0,
  'kpop':        0,
  'city-pop':    4,
  'house':       0,
  'future-bass': 0,
  'ambient':     88,  // Pad 1 (new age)
  'rnb':         4,
  'jazz':        0,
};

// bass 轨
const BASS_PROGRAMS: Record<StyleId, number> = {
  'pop':         33,  // Electric Bass (finger)
  'lofi':        33,
  'indie-pop':   33,
  'trap':        38,  // Synth Bass 1
  'drill':       38,
  'kpop':        33,
  'city-pop':    33,
  'house':       38,
  'future-bass': 38,
  'ambient':     38,
  'rnb':         33,
  'jazz':        32,  // Acoustic Bass
};

// drumMap(从 fallback-arrange 同步)
const DRUM_MAPS: Record<StyleId, StylePreset['drums']['drumMap']> = {
  'pop':         'standard',
  'lofi':        'brush',
  'indie-pop':   'standard',
  'trap':        'half-time',
  'drill':       'triplet',
  'kpop':        'standard',
  'city-pop':    'funk',
  'house':       '4-on-floor',
  'future-bass': 'half-trap',
  'ambient':     'standard',
  'rnb':         'soft-kit',
  'jazz':        'brush',
};

// FX map:每个风格的特殊效果位
const FX_MAPS: Record<StyleId, StyleFxMap> = {
  'pop':         { reverbSendDb: -20, lowpassCutoffHz: 18000, swingPercent: 0,  sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'lofi':        { reverbSendDb: -25, lowpassCutoffHz:  6500, swingPercent: 55, sidechainDb: null, vinylNoise: true,  halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'indie-pop':   { reverbSendDb: -18, lowpassCutoffHz: 16000, swingPercent: 0,  sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: true,  slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'trap':        { reverbSendDb: -22, lowpassCutoffHz: 14000, swingPercent: 0,  sidechainDb: -8,  vinylNoise: false, halfTimeClosedHat: true,  sliding808: true,  longReverb: true,  slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'drill':       { reverbSendDb: -24, lowpassCutoffHz: 12000, swingPercent: 0,  sidechainDb: -6,  vinylNoise: false, halfTimeClosedHat: false, sliding808: true,  longReverb: false, slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'kpop':        { reverbSendDb: -18, lowpassCutoffHz: 18000, swingPercent: 0,  sidechainDb: -10, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: false, supersawLayer: true,  highFreqShimmer: true,  brightStab: true  },
  'city-pop':    { reverbSendDb: -20, lowpassCutoffHz: 14000, swingPercent: 60, sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: true,  slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'house':       { reverbSendDb: -16, lowpassCutoffHz: 18000, swingPercent: 0,  sidechainDb: -12, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'future-bass': { reverbSendDb: -16, lowpassCutoffHz: 18000, swingPercent: 0,  sidechainDb: -10, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: true,  slapArticulation: false, supersawLayer: true,  highFreqShimmer: true,  brightStab: false },
  'ambient':     { reverbSendDb: -10, lowpassCutoffHz:  8000, swingPercent: 0,  sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: true,  slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'rnb':         { reverbSendDb: -18, lowpassCutoffHz: 16000, swingPercent: 50, sidechainDb: -8,  vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: true,  supersawLayer: false, highFreqShimmer: false, brightStab: false },
  'jazz':        { reverbSendDb: -22, lowpassCutoffHz: 16000, swingPercent: 65, sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
};

// 风格 BPM 范围(与 fallback-arrange bpm 同步)
const BPM_RANGES: Record<StyleId, [number, number]> = {
  'pop':         [95, 128],
  'lofi':        [70, 95],
  'indie-pop':   [100, 125],
  'trap':        [130, 160],
  'drill':       [135, 150],
  'kpop':        [100, 130],
  'city-pop':    [95, 115],
  'house':       [118, 130],
  'future-bass': [140, 160],
  'ambient':     [60, 90],
  'rnb':         [70, 100],
  'jazz':        [100, 140],
};

function presetFor(id: StyleId): StylePreset {
  const meta = STYLE_META[id];
  return {
    id,
    name: meta.name,
    nameZh: meta.nameZh,
    melody:  { layers: [{ program: MELODY_PROGRAMS[id],  octave: 0, pan: 0,     velocity: 0.85 }], bpmRange: BPM_RANGES[id] },
    harmony: { layers: [{ program: HARMONY_PROGRAMS[id], octave: 0, pan: -0.3,  velocity: 0.6  }], bpmRange: BPM_RANGES[id] },
    bass:    { layers: [{ program: BASS_PROGRAMS[id],    octave: 0, pan: 0,     velocity: 0.9  }], bpmRange: BPM_RANGES[id] },
    drums:   { layers: [{ program: 0,                   octave: 0, pan: 0,     velocity: 0.8  }], drumMap: DRUM_MAPS[id], bpmRange: BPM_RANGES[id] },
    fx: FX_MAPS[id],
  };
}

// 12 风格 preset 表(数组 + 字典两种访问)
export const STYLE_PRESETS: readonly StylePreset[] = (
  ['pop', 'lofi', 'indie-pop', 'trap', 'drill', 'kpop',
   'city-pop', 'house', 'future-bass', 'ambient', 'rnb', 'jazz'] as const
).map(presetFor);

export const STYLE_PRESETS_BY_ID: Record<StyleId, StylePreset> = STYLE_PRESETS.reduce(
  (acc, p) => { acc[p.id] = p; return acc; },
  {} as Record<StyleId, StylePreset>,
);

export function getPreset(id: StyleId): StylePreset {
  return STYLE_PRESETS_BY_ID[id];
}
