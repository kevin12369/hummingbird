import React from 'react';
import { Step } from './HowItWorks/Step';
import { StepConnector } from './HowItWorks/StepConnector';
import {
  MicIcon,
  WaveformIcon,
  ChordSheetIcon,
  RenderIcon,
  DownloadIcon,
} from './HowItWorks/icons';

interface StepConfig {
  index: number;
  title: string;
  titleZh: string;
  description: string;
  durationSec: number;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    index: 1,
    title: 'Record',
    titleZh: '录音',
    description: '你哼 30 秒,浏览器自动停止。',
    durationSec: 5,
    icon: <MicIcon />,
  },
  {
    index: 2,
    title: 'Analyze',
    titleZh: '分析',
    description: 'Basic Pitch 识别音高 + Krumhansl 识别调式。',
    durationSec: 5,
    icon: <WaveformIcon />,
  },
  {
    index: 3,
    title: 'Arrange',
    titleZh: '编排',
    description: '本地 LLM 选 12 风格,自动配和弦 / 贝斯 / 鼓。',
    durationSec: 5,
    icon: <ChordSheetIcon />,
  },
  {
    index: 4,
    title: 'Render',
    titleZh: '渲染',
    description: '4 轨 MIDI 拼装 + OfflineAudioContext 渲染 + lamejs 编码 MP3。',
    durationSec: 10,
    icon: <RenderIcon />,
  },
  {
    index: 5,
    title: 'Download',
    titleZh: '下载',
    description: '1 个 MP3 + 4 个分轨 MIDI。',
    durationSec: 2,
    icon: <DownloadIcon />,
  },
];

const TOTAL_SEC = STEPS.reduce((acc, s) => acc + s.durationSec, 0);

/**
 * "How It Works" section for the landing page.
 *
 * Visualizes the 5 pipeline steps (Record → Analyze → Arrange → Render → Download)
 * as a horizontal timeline on md+ and a stacked column on mobile. Includes a
 * summary line with the total seconds, two CTAs, and a one-line comparison
 * hint against GarageBand / Suno.
 */
export function HowItWorks() {
  return (
    <section
      className="bg-[#0a0a0f] border-b border-zinc-800"
      aria-labelledby="how-it-works-title"
      data-testid="how-it-works"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="how-it-works-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
          >
            30 秒,5 步,从哼唱到小样
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            完全在浏览器内,不上传任何音频。
          </p>
        </div>

        {/* Steps row: connectors interleaved between steps on md+,
            stacked single-column on mobile. */}
        <div
          className="flex flex-col md:flex-row md:items-start gap-6 md:gap-0"
          data-testid="how-it-works-steps"
        >
          {STEPS.map((s, i) => (
            <React.Fragment key={s.index}>
              <Step
                index={s.index}
                title={s.title}
                titleZh={s.titleZh}
                description={s.description}
                durationLabel={`~${s.durationSec}s`}
                icon={s.icon}
              />
              {i < STEPS.length - 1 && <StepConnector />}
            </React.Fragment>
          ))}
        </div>

        {/* Total + CTAs */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <p className="text-zinc-300 text-sm md:text-base text-center">
            5 + 5 + 5 + 10 + 2 = <span data-testid="how-it-works-total">{TOTAL_SEC}</span> 秒(平均)
            + 30 秒小样 MP3。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              data-testid="how-it-works-cta-try"
            >
              Try online
            </a>
            <a
              href="https://github.com/kevin12369/hummingbird"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-200 px-5 py-2.5 rounded-lg font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="how-it-works-cta-gh"
            >
              Run locally
            </a>
          </div>
        </div>

        {/* Comparison hint */}
        <p
          className="text-center text-xs md:text-sm text-zinc-500"
          data-testid="how-it-works-compare"
        >
          Hummingbird {TOTAL_SEC} 秒 vs GarageBand 30 分钟 vs Suno 60 秒 + 配额
        </p>
      </div>
    </section>
  );
}

export default HowItWorks;