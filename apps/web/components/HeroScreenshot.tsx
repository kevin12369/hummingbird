import React from 'react';

/**
 * Mock screenshot placeholder for the Hero section.
 * Uses divs + Tailwind to simulate a "ready" state of the app
 * (top toolbar, central record controls, bottom download + style chips).
 */
export function HeroScreenshot() {
  return (
    <div
      className="relative aspect-video w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      role="img"
      aria-label="Hummingbird app preview"
    >
      {/* Top mock toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <div className="ml-3 text-xs text-zinc-400 truncate">
          Hummingbird (哼哼编曲)
        </div>
      </div>

      {/* Middle mock state: record button + try sample */}
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="rounded-full bg-red-600 text-white px-6 py-3 font-medium text-sm"
        >
          Start recording
        </button>
        <div className="text-xs text-zinc-500 underline">Try sample</div>

        {/* Mock waveform */}
        <div className="mt-3 w-full max-w-xs h-10 flex items-end justify-center gap-[3px]">
          {Array.from({ length: 32 }).map((_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 0.6)) * 60;
            return (
              <span
                key={i}
                className="w-1 bg-red-500/60 rounded-sm"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom mock output row */}
      <div className="absolute inset-x-0 bottom-0 px-4 py-3 border-t border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            <span className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
              MIDI
            </span>
            <span className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
              MP3
            </span>
            <span className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
              ZIP
            </span>
          </div>
          <div className="flex gap-1">
            {[
              'bg-red-500',
              'bg-orange-500',
              'bg-yellow-500',
              'bg-green-500',
              'bg-teal-500',
              'bg-blue-500',
            ].map((c, i) => (
              <span key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}