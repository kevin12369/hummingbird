import type { StyleId } from './types';
import type { Arrangement } from './arrangement-schema';

// 本地 NoteEvent 描述(@tonejs/midi 没有导出 NoteEvent 类型,
// 此处采用上游 note 抽取阶段统一使用的扁平结构)
export interface NoteEvent {
  pitch: number;
  onset: number;
  duration: number;
  velocity: number;
}

// 12 风格对应的模板(基于 presets.ts 同步)
const STYLE_TEMPLATES: Record<StyleId, {
  progression: string[];
  bassRoot: string[];
  drumPattern: 'standard' | 'brush' | 'half-time' | 'triplet' | '4-on-floor' | 'half-trap' | 'funk' | 'soft-kit';
  bpm: number;
}> = {
  'pop':         { progression: ['I', 'IV', 'V', 'I'],           bassRoot: ['C2', 'F2', 'G2', 'C2'], drumPattern: 'standard',  bpm: 120 },
  'lofi':        { progression: ['ii', 'V', 'I', 'vi'],          bassRoot: ['D2', 'G2', 'C2', 'A2'], drumPattern: 'brush',     bpm: 85 },
  'indie-pop':   { progression: ['I', 'V', 'vi', 'IV'],          bassRoot: ['C2', 'G2', 'A2', 'F2'], drumPattern: 'standard',  bpm: 115 },
  'trap':        { progression: ['i', 'VI', 'III', 'VII'],       bassRoot: ['C2', 'Ab2', 'Eb2', 'Bb2'], drumPattern: 'half-time', bpm: 140 },
  'drill':       { progression: ['i', 'iv', 'VI', 'III'],        bassRoot: ['C2', 'F2', 'Ab2', 'Eb2'], drumPattern: 'triplet',   bpm: 142 },
  'kpop':        { progression: ['I', 'V', 'vi', 'IV'],          bassRoot: ['C2', 'G2', 'A2', 'F2'], drumPattern: 'standard',  bpm: 115 },
  'city-pop':    { progression: ['Imaj7', 'VImaj7', 'ii7', 'V7'], bassRoot: ['C2', 'A2', 'D2', 'G2'], drumPattern: 'funk',      bpm: 105 },
  'house':       { progression: ['i', 'v', 'iv', 'v'],           bassRoot: ['C2', 'F2', 'G2', 'F2'], drumPattern: '4-on-floor', bpm: 124 },
  'future-bass': { progression: ['I', 'V', 'vi', 'IV'],          bassRoot: ['C2', 'G2', 'A2', 'F2'], drumPattern: 'half-trap', bpm: 150 },
  'ambient':     { progression: ['I'],                          bassRoot: ['C2'],                    drumPattern: 'standard',  bpm: 75 },
  'rnb':         { progression: ['ii7', 'V7', 'Imaj7', 'vi7'],  bassRoot: ['D2', 'G2', 'C2', 'A2'], drumPattern: 'soft-kit',  bpm: 85 },
  'jazz':        { progression: ['ii7', 'V7', 'Imaj7'],          bassRoot: ['D2', 'G2', 'C2'],        drumPattern: 'brush',     bpm: 120 },
};

interface KeyDetection {
  key: string;
  mode: 'major' | 'minor';
  confidence: number;
}

export function fallbackArrange(
  notes: NoteEvent[],
  keyDetection: KeyDetection,
  style: StyleId,
): Arrangement {
  const tpl = STYLE_TEMPLATES[style];
  const effectiveKey = keyDetection.confidence >= 0.3 ? keyDetection.key : 'C';
  const effectiveMode: 'major' | 'minor' = keyDetection.confidence >= 0.3 ? keyDetection.mode : 'major';
  return {
    chordProgression: tpl.progression,
    bassLine: tpl.bassRoot,
    drumPattern: tpl.drumPattern,
    bpm: tpl.bpm,
    key: effectiveKey as Arrangement['key'],
    mode: effectiveMode,
  };
}