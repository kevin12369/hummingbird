import React from 'react';
import { WaveformMock } from './BeforeAfter/WaveformMock';

/**
 * Arrow icon used to indicate the input → output transformation.
 */
function ArrowRightIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

interface ColumnConfig {
  label: string;
  /** Sub-label, e.g. "你的输入" / "你的小样" */
  caption: string;
  body: React.ReactNode;
  meta: string;
  mock: React.ReactNode;
  testId: string;
}

const BEFORE: ColumnConfig = {
  label: 'Before',
  caption: '你的输入',
  body: '一段 30 秒的哼唱,没有音高没有调式,不能发也不能分享',
  meta: '约 100 KB webm',
  mock: <WaveformMock mode="simple" />,
  testId: 'before-after-before',
};

const AFTER: ColumnConfig = {
  label: 'After',
  caption: '你的小样',
  body: '4 轨 MIDI + 1 个 MP3 完整混音 + 可选歌词',
  meta: '约 30 KB .mid × 4 + 800 KB .mp3',
  mock: <WaveformMock mode="stacked" />,
  testId: 'before-after-after',
};

/**
 * "30 秒前 vs 30 秒后" before/after comparison.
 *
 * Two-column layout on md+: a Before column (raw 30s hum, single-row
 * mock waveform) and an After column (4 stacked colored stems, MP3 +
 * MIDI artifacts). A large arrow sits between them on md+ and stacks
 * vertically on mobile.
 */
export function BeforeAfter() {
  return (
    <section
      className="bg-[#0a0a0f] border-b border-zinc-800"
      aria-labelledby="before-after-title"
      data-testid="before-after"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="before-after-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="before-after-title"
          >
            30 秒前 vs 30 秒后
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            你的哼唱 → 一首能发的小样
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          <CompareColumn config={BEFORE} />
          <div
            className="flex items-center justify-center text-zinc-500"
            data-testid="before-after-arrow"
            aria-hidden
          >
            <ArrowRightIcon />
          </div>
          <CompareColumn config={AFTER} />
        </div>
      </div>
    </section>
  );
}

function CompareColumn({ config }: { config: ColumnConfig }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
      data-testid={config.testId}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
        <span className="bg-zinc-800 px-2 py-0.5 rounded">{config.label}</span>
        <span>{config.caption}</span>
      </div>
      <div className="bg-zinc-950/60 rounded p-4 border border-zinc-800/60">
        {config.mock}
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{config.body}</p>
      <p className="text-xs text-zinc-500 font-mono">{config.meta}</p>
    </div>
  );
}

export default BeforeAfter;
