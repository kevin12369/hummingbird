import React from 'react';
import { STYLES, STYLE_META, type StyleId } from '@hummingbird/render';

interface Props {
  selected: StyleId;
  colorHue: number;
}

/**
 * 16:9 mock app screenshot for the carousel's right column.
 * Shows the selected style highlighted among all 12 chips, plus a pulsing
 * central "ready" button. Stylistically mirrors HeroScreenshot so the two
 * mock screens feel like the same product at different stages.
 */
export function StyleMockScreenshot({ selected, colorHue }: Props) {
  return (
    <div
      className="relative aspect-video w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      role="img"
      aria-label={`App preview in ${selected} style`}
    >
      {/* Top mock toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <div className="ml-3 text-xs text-zinc-400 truncate">ready</div>
      </div>

      {/* Middle mock state: pulsing record + waveform */}
      <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="rounded-full text-white px-5 py-2.5 font-medium text-sm animate-pulse"
          style={{ background: `hsl(${colorHue}, 75%, 55%)` }}
        >
          {STYLE_META[selected].emoji} {STYLE_META[selected].nameZh}
        </button>
        <div className="text-[10px] text-zinc-500">stage: ready</div>
        <div className="mt-1 w-full max-w-xs h-10 flex items-end justify-center gap-[3px]">
          {Array.from({ length: 32 }).map((_, i) => {
            const h = 25 + Math.abs(Math.sin(i * 0.6 + colorHue * 0.02)) * 55;
            return (
              <span
                key={i}
                className="w-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: `hsla(${colorHue}, 80%, 60%, 0.7)`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom style chip row */}
      <div className="absolute inset-x-0 bottom-0 px-3 py-2 border-t border-zinc-800 bg-zinc-900/80">
        <div className="flex flex-wrap gap-1 justify-center">
          {STYLES.map((id) => {
            const meta = STYLE_META[id];
            const isSelected = id === selected;
            return (
              <span
                key={id}
                className={`px-1.5 py-0.5 rounded text-[10px] border ${
                  isSelected
                    ? 'border-zinc-300 text-zinc-50'
                    : 'border-zinc-700 text-zinc-400'
                }`}
                style={
                  isSelected
                    ? { background: `hsla(${colorHue}, 80%, 55%, 0.25)` }
                    : { background: 'rgb(39 39 42 / 0.6)' }
                }
              >
                {meta.emoji} {meta.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}