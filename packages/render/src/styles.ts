import type { StyleId } from './types';

// 12 风格枚举元数据(单一来源,UI/state/LLM 共享)
export const STYLES: readonly StyleId[] = [
  'pop', 'lofi', 'indie-pop', 'trap', 'drill', 'kpop',
  'city-pop', 'house', 'future-bass', 'ambient', 'rnb', 'jazz',
] as const;

export interface StyleMeta {
  id: StyleId;
  name: string;
  nameZh: string;
  category: 'beat' | 'mood' | 'genre';
  emoji: string;
}

export const STYLE_META: Record<StyleId, StyleMeta> = {
  'pop':         { id: 'pop',         name: 'Pop',         nameZh: '流行',     category: 'beat',  emoji: '🎤' },
  'lofi':        { id: 'lofi',        name: 'Lo-Fi',       nameZh: '低保真',   category: 'mood',  emoji: '☕' },
  'indie-pop':   { id: 'indie-pop',   name: 'Indie Pop',   nameZh: '独立流行', category: 'beat',  emoji: '🎸' },
  'trap':        { id: 'trap',        name: 'Trap',        nameZh: '陷阱说唱', category: 'beat',  emoji: '🔥' },
  'drill':       { id: 'drill',       name: 'Drill',       nameZh: '钻说唱',   category: 'beat',  emoji: '⚡' },
  'kpop':        { id: 'kpop',        name: 'K-Pop',       nameZh: '韩流',     category: 'genre', emoji: '💃' },
  'city-pop':    { id: 'city-pop',    name: 'City Pop',    nameZh: '都市流行', category: 'genre', emoji: '🌃' },
  'house':       { id: 'house',       name: 'House',       nameZh: '浩室',     category: 'genre', emoji: '🏠' },
  'future-bass': { id: 'future-bass', name: 'Future Bass', nameZh: '未来低音', category: 'genre', emoji: '🚀' },
  'ambient':     { id: 'ambient',     name: 'Ambient',     nameZh: '氛围',     category: 'mood',  emoji: '🌌' },
  'rnb':         { id: 'rnb',         name: 'R&B',         nameZh: '节奏布鲁斯', category: 'mood',  emoji: '🎷' },
  'jazz':        { id: 'jazz',        name: 'Jazz',        nameZh: '爵士',     category: 'genre', emoji: '🎹' },
};

export const STYLE_BY_CATEGORY: Record<StyleMeta['category'], StyleId[]> = {
  beat:  ['pop', 'indie-pop', 'trap', 'drill'],
  mood:  ['lofi', 'ambient', 'rnb'],
  genre: ['kpop', 'city-pop', 'house', 'future-bass', 'jazz'],
};

export function isStyleId(value: string): value is StyleId {
  return (STYLES as readonly string[]).includes(value);
}