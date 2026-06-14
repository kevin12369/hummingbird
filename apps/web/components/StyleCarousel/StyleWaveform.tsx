import React from 'react';
import type { StyleId } from '@hummingbird/render';

interface Props {
  styleId: StyleId;
  bars?: number;
  colorHue: number;
}

// Pure-CSS mock waveform for a single style demo.
// Each style has a deterministic phase + frequency offset so the shape is
// recognizable per style (e.g. trap = sparser spikes, ambient = smoother).
export function StyleWaveform({ styleId, bars = 32, colorHue }: Props) {
  // Per-style waveform shaping
  const PROFILES: Record<StyleId, { freq: number; phase: number; jitter: number }> = {
    'pop':         { freq: 0.55, phase: 0.0, jitter: 0.05 },
    'lofi':        { freq: 0.30, phase: 0.4, jitter: 0.18 },
    'indie-pop':   { freq: 0.50, phase: 0.2, jitter: 0.08 },
    'trap':        { freq: 0.20, phase: 1.2, jitter: 0.30 },
    'drill':       { freq: 0.25, phase: 1.8, jitter: 0.28 },
    'kpop':        { freq: 0.65, phase: 0.6, jitter: 0.06 },
    'city-pop':    { freq: 0.45, phase: 0.9, jitter: 0.10 },
    'house':       { freq: 1.10, phase: 0.0, jitter: 0.02 },
    'future-bass': { freq: 0.85, phase: 0.5, jitter: 0.12 },
    'ambient':     { freq: 0.20, phase: 2.1, jitter: 0.04 },
    'rnb':         { freq: 0.40, phase: 1.4, jitter: 0.10 },
    'jazz':        { freq: 0.35, phase: 1.7, jitter: 0.20 },
  };
  const profile = PROFILES[styleId];

  // Deterministic pseudo-random based on (i, styleId)
  function detRand(i: number): number {
    const x = Math.sin(i * 9301 + styleId.charCodeAt(0) * 49297) * 233280;
    return x - Math.floor(x);
  }

  return (
    <div
      className="flex items-end gap-[3px] h-12 w-full"
      role="img"
      aria-label={`${styleId} waveform preview`}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const base = Math.abs(Math.sin(i * profile.freq + profile.phase)) * 90 + 10;
        const jitter = (detRand(i) - 0.5) * profile.jitter * 100;
        const h = Math.max(8, Math.min(100, base + jitter));
        return (
          <span
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: `hsla(${colorHue}, 80%, 60%, 0.75)`,
            }}
          />
        );
      })}
    </div>
  );
}