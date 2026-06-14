import React from 'react';
import { FeatureCard } from './Features/FeatureCard';
import { StemsIcon, Mp3Icon, LyricsIcon, FeedbackIcon } from './Features/icons';

interface FeatureConfig {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
}

const FEATURES: FeatureConfig[] = [
  {
    id: 'stems',
    title: '4 轨分离',
    description:
      '主旋律 / 和弦 / 贝斯 / 鼓 4 个独立 MIDI,拖进 GarageBand / Logic / Ableton 二次创作',
    tags: ['MIDI', '4 stems', 'DAW-ready'],
    icon: <StemsIcon />,
  },
  {
    id: 'mp3',
    title: 'MP3 一键导出',
    description:
      '30 秒完整混音 WAV → MP3,免 lamejs 部署,纯浏览器编码',
    tags: ['MP3', 'WAV fallback', 'lamejs'],
    icon: <Mp3Icon />,
  },
  {
    id: 'lyrics',
    title: '3 语言歌词',
    description:
      '中文 / English / 日本語 歌词生成,自动嵌入 MIDI 第 5 轨 meta events,DAW 打开可见',
    tags: ['zh', 'en', 'ja', 'MIDI meta'],
    icon: <LyricsIcon />,
  },
  {
    id: 'feedback',
    title: 'AI 教学反馈',
    description:
      '3-5 条分类反馈,严重度配色(注意 / 警告 / 建议),告诉你"哪里可以更好"',
    tags: ['Categorical', 'Severity-coded', 'Educational'],
    icon: <FeedbackIcon />,
  },
];

/**
 * "4 件事,做完整" features section.
 *
 * 2x2 grid on md+ / single column on mobile. Each card highlights a
 * concrete artifact the user gets: 4 stems, MP3 export, multilingual
 * lyrics, AI feedback.
 */
export function Features() {
  return (
    <section
      className="bg-[#0a0a0f] border-b border-zinc-800"
      aria-labelledby="features-title"
      data-testid="features"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="features-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="features-title"
          >
            4 件事,做完整
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            不只是 4 轨 MIDI,是从原始音频到成品的全栈
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="features-grid"
        >
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.id}
              title={f.title}
              description={f.description}
              tags={f.tags}
              icon={f.icon}
              testId={`feature-card-${f.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
