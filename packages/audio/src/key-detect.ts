import type { NoteEvent, Key, Mode, KeyDetection } from './types';

// Krumhansl-Schmuckler key profiles
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const NOTE_NAMES: Key[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  if (n === 0) return 0;
  const aMean = a.reduce((s, v) => s + v, 0) / n;
  const bMean = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i]! - aMean;
    const db = b[i]! - bMean;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

function buildPitchClassHistogram(notes: NoteEvent[]): number[] {
  const counts = new Array(12).fill(0);
  for (const n of notes) {
    // Weight by duration (sustained notes matter more)
    const pc = n.pitch % 12;
    counts[pc] += n.duration;
  }
  return counts;
}

function rotate(arr: number[], n: number): number[] {
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

export function detectKey(notes: NoteEvent[]): KeyDetection {
  if (notes.length === 0) {
    return { key: 'C', mode: 'major', confidence: 0 };
  }
  const histogram = buildPitchClassHistogram(notes);

  let best: { key: Key; mode: Mode; corr: number } = { key: 'C', mode: 'major', corr: -1 };
  for (let i = 0; i < 12; i++) {
    const rotated = rotate(histogram, i);
    const majorCorr = pearsonCorrelation(rotated, MAJOR_PROFILE);
    if (majorCorr > best.corr) best = { key: NOTE_NAMES[i]!, mode: 'major', corr: majorCorr };
    const minorCorr = pearsonCorrelation(rotated, MINOR_PROFILE);
    if (minorCorr > best.corr) best = { key: NOTE_NAMES[i]!, mode: 'minor', corr: minorCorr };
  }
  // Map correlation (-1..1) to confidence (0..1)
  let confidence = Math.max(0, (best.corr + 1) / 2);
  // Penalize sparse histograms: a single pitch class can spuriously match
  // any tonic. Count distinct non-zero pitch classes and scale down.
  const distinctClasses = histogram.filter((c) => c > 0).length;
  if (distinctClasses <= 2) {
    confidence = confidence * (distinctClasses / 3);
  } else if (distinctClasses <= 4) {
    confidence = confidence * 0.8;
  }
  return { key: best.key, mode: best.mode, confidence };
}
