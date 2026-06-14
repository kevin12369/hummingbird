import React from 'react';

export type WaveformMode = 'simple' | 'stacked';

export interface WaveformMockProps {
  /** 'simple' = single-row 32-bar mock (Before). 'stacked' = 4 colored rows (After). */
  mode: WaveformMode;
  /** Number of bars per row in simple mode, or per stem in stacked mode. */
  bars?: number;
  /** Optional deterministic seed offset for visual variety. */
  seed?: number;
  /** Aria-label override. */
  ariaLabel?: string;
  /** Optional test id prefix. */
  testId?: string;
}

interface StemDef {
  key: 'melody' | 'chords' | 'bass' | 'drums';
  label: string;
  color: string; // tailwind bg-* class
  offset: number; // sin phase offset
  amplitude: number; // multiplier
}

const STEMS: StemDef[] = [
  { key: 'melody', label: 'melody', color: 'bg-red-500', offset: 0.0, amplitude: 0.95 },
  { key: 'chords', label: 'chords', color: 'bg-blue-500', offset: 0.7, amplitude: 0.7 },
  { key: 'bass',   label: 'bass',   color: 'bg-emerald-500', offset: 1.4, amplitude: 0.85 },
  { key: 'drums',  label: 'drums',  color: 'bg-amber-400', offset: 2.1, amplitude: 0.6 },
];

/**
 * Mock waveform used by the Before/After comparison.
 *
 * - mode="simple"  → 32 zinc-700 bars (Before: a 30s hum, no structure).
 * - mode="stacked" → 4 rows, each a 32-bar mock in a different color
 *                    (After: melody / chords / bass / drums).
 *
 * Heights are derived from a deterministic |sin(i * 0.6 + offset)| curve
 * so the visual is stable across renders (no hydration mismatch).
 */
export function WaveformMock({
  mode,
  bars = 32,
  seed = 0,
  ariaLabel,
  testId,
}: WaveformMockProps) {
  if (mode === 'simple') {
    const heights: number[] = [];
    for (let i = 0; i < bars; i++) {
      const v = Math.abs(Math.sin(i * 0.6 + seed)) * 100;
      heights.push(Math.max(8, Math.round(v)));
    }
    return (
      <div
        className="flex items-end gap-[2px] h-16 w-full"
        aria-label={ariaLabel ?? 'Mock waveform: a 30s hum'}
        data-testid={testId ?? 'waveform-simple'}
      >
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-zinc-700 rounded-sm"
            style={{ height: `${h}%` }}
            data-testid="waveform-bar"
          />
        ))}
      </div>
    );
  }

  // stacked
  return (
    <div
      className="flex flex-col gap-1 w-full"
      aria-label={ariaLabel ?? 'Mock waveform: 4 stems of the arranged piece'}
      data-testid={testId ?? 'waveform-stacked'}
    >
      {STEMS.map((stem) => {
        const heights: number[] = [];
        for (let i = 0; i < bars; i++) {
          const v = Math.abs(Math.sin(i * 0.6 + stem.offset + seed)) * 100 * stem.amplitude;
          heights.push(Math.max(8, Math.round(v)));
        }
        return (
          <div
            key={stem.key}
            className="flex items-end gap-[2px] h-5 w-full"
            data-testid={`waveform-stem-${stem.key}`}
            aria-label={`${stem.label} stem`}
          >
            {heights.map((h, i) => (
              <div
                key={i}
                className={`flex-1 ${stem.color} rounded-sm opacity-80`}
                style={{ height: `${h}%` }}
                data-testid="waveform-bar"
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default WaveformMock;
