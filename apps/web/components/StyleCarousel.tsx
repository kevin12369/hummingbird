import React, { useEffect, useState, useMemo } from 'react';
import {
  STYLES,
  STYLE_META,
  STYLE_PRESETS_BY_ID,
  type StyleId,
} from '@hummingbird/render';
import { StyleThumbnails } from './StyleCarousel/StyleThumbnails';
import { StyleWaveform } from './StyleCarousel/StyleWaveform';
import { StyleMockScreenshot } from './StyleCarousel/StyleMockScreenshot';

// Marketing copy + color per style. Kept inline (not in @hummingbird/render)
// because these are landing-page concerns, not render-pipeline concerns.
interface StyleMarketing {
  description: string;
  colorHue: number;
}

const STYLE_MARKETING: Record<StyleId, StyleMarketing> = {
  'pop':         { description: '短视频、朋友圈,朗朗上口。朗朗上口的旋律 + 干净鼓组,适合做开场 hook。', colorHue: 0 },
  'lofi':        { description: '学习、睡前,磁带嘶声。爵士和弦 + 软鼓 + 黑胶底噪,放松陪伴。', colorHue: 30 },
  'indie-pop':   { description: 'Vlog、旅行 vlog。原声吉他 + 轻鼓,清新明亮,日常感强。', colorHue: 60 },
  'trap':        { description: '抖音 BGM,808 滑音。半拍 kick + 滑动 808 bass,节奏感强。', colorHue: 340 },
  'drill':       { description: 'TikTok viral,滑动 808。三连音 hi-hat + 暗色 808,英美地下风。', colorHue: 300 },
  'kpop':        { description: '翻跳、偶像练习生。双层 supersaw + 强 sidechain,韩系炸场。', colorHue: 280 },
  'city-pop':    { description: '复古、80 年代开车。Rhodes + funk 鼓 + 轻 swing,怀旧又时髦。', colorHue: 200 },
  'house':       { description: '夜店、跑步、健身。4-on-floor kick + sidechain bass,持续律动。', colorHue: 220 },
  'future-bass': { description: '游戏 EDM、过场动画。supersaw lead + 半拍 trap 鼓 + shimmer。', colorHue: 260 },
  'ambient':     { description: '冥想、白噪音、背景音。Pad + 长混响 + 极少节奏,氛围感拉满。', colorHue: 180 },
  'rnb':         { description: '慢歌、深情对唱。slap bass + 软鼓 + 摇摆律动,情绪饱满。', colorHue: 320 },
  'jazz':        { description: '咖啡馆、Smooth Night。刷扫鼓 + walking bass + 和弦铺底,优雅。', colorHue: 40 },
};

const DRUM_CHIP_LABEL: Record<string, string> = {
  'standard':    'Standard',
  'brush':       'Brush',
  'half-time':   'Half-time',
  'triplet':     'Triplet',
  '4-on-floor':  '4-on-floor',
  'half-trap':   'Half-trap',
  'funk':        'Funk',
  'soft-kit':    'Soft-kit',
};

export function StyleCarousel() {
  const [selected, setSelected] = useState<StyleId>('pop');

  const meta = STYLE_META[selected];
  const preset = STYLE_PRESETS_BY_ID[selected];
  const marketing = STYLE_MARKETING[selected];

  // Keyboard arrow navigation: left/right moves through STYLES array.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      // Don't hijack typing in form fields / contenteditable
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) {
        return;
      }
      const idx = STYLES.indexOf(selected);
      if (idx < 0) return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const wrappedIdx = (idx + dir + STYLES.length) % STYLES.length;
      const next: StyleId | undefined = STYLES[wrappedIdx];
      if (next) setSelected(next);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const drumChip = useMemo(() => {
    const map: string = preset.drums.drumMap ?? 'standard';
    return DRUM_CHIP_LABEL[map] ?? map;
  }, [preset]);

  return (
    <section
      className="bg-[#0a0a0f] border-y border-zinc-800"
      aria-labelledby="style-carousel-title"
      data-testid="style-carousel"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 id="style-carousel-title" className="text-3xl md:text-4xl font-bold text-zinc-50">
            12 风格,一键切换
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            从 Lo-Fi 到 Drill,从 House 到 City Pop,覆盖 2025-2026 主流市场。
          </p>
        </div>

        {/* Main 2-column area */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left column 5/12: current style details */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div
              className="flex items-center gap-3"
              data-testid="style-header"
              data-style-id={selected}
            >
              <span
                aria-hidden="true"
                className="text-5xl md:text-6xl leading-none"
              >
                {meta.emoji}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-zinc-50">
                  {meta.nameZh}
                </span>
                <span className="text-sm text-zinc-400">{meta.name}</span>
              </div>
            </div>

            <p className="text-zinc-300 leading-relaxed text-[15px]">
              {marketing.description}
            </p>

            <div className="flex flex-wrap gap-2" aria-label="style metadata">
              <span className="text-[11px] px-2 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                BPM {preset.drums.bpmRange[0]}–{preset.drums.bpmRange[1]}
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                {drumChip}
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400">
                {meta.category === 'beat' ? 'Beat 节奏型'
                  : meta.category === 'mood' ? 'Mood 情绪'
                  : 'Genre 流派'}
              </span>
            </div>

            {/* 5 representative demo waveforms */}
            <div className="flex flex-col gap-1.5 mt-1" aria-label="representative demo waveforms">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                Demo snippets
              </span>
              {Array.from({ length: 5 }).map((_, i) => (
                <StyleWaveform
                  key={i}
                  styleId={selected}
                  bars={32}
                  colorHue={(marketing.colorHue + i * 12) % 360}
                />
              ))}
            </div>
          </div>

          {/* Right column 7/12: mock screenshot */}
          <div className="md:col-span-7">
            <StyleMockScreenshot selected={selected} colorHue={marketing.colorHue} />
          </div>
        </div>

        {/* Thumbnail navigation */}
        <StyleThumbnails selected={selected} onSelect={setSelected} />

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-zinc-400 text-sm md:text-base">
            想听你哼的版本?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Try sample
            </a>
            <a
              href="https://github.com/kevin12369/hummingbird/blob/main/docs/superpowers/specs/2026-06-11-hummingbird-mvp-design.md"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-200 px-5 py-2.5 rounded-lg font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read spec
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StyleCarousel;