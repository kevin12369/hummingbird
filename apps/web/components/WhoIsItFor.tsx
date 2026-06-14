import React from 'react';

interface AudienceConfig {
  id: string;
  emoji: string;
  title: string;
  quote: string;
  scenarios: string;
  value: string;
}

const AUDIENCE: AudienceConfig[] = [
  {
    id: 'beginner',
    emoji: '🌱',
    title: 'Beginner 不会乐器',
    quote:
      '我一直想做音乐,但学钢琴要 3 年,学编曲要 1 年,我只是想哼出脑子里的旋律',
    scenarios: '洗澡时 / 地铁里 / 梦里刚醒的那段',
    value: '零门槛,30 秒出成品',
  },
  {
    id: 'hobbyist',
    emoji: '🎨',
    title: 'Hobbyist 想做 BGM',
    quote:
      '我做短视频 / 播客,需要配 BGM 但不想用版权音乐,也不想去 GarageBand 学半小时',
    scenarios: '短视频 / 播客 / 朋友圈',
    value: '免费 + 12 风格覆盖主流 + 零配额',
  },
  {
    id: 'creator',
    emoji: '🎹',
    title: 'Creator 想要 Demo 起点',
    quote:
      '我是音乐人 / 作曲人,我想要一个"骨架"快速试编曲,然后拖进 Logic / Ableton 二次创作',
    scenarios: 'demo 草稿 / 编曲实验 / 旋律验证',
    value: '分轨 MIDI 标准化,直接拖进 DAW',
  },
];

/**
 * "这是给谁用的?" — three audience personas.
 *
 * Single column on mobile, 3-column grid on md+. Each card shows an
 * emoji, title, a quoted voice, where they would use it, and the
 * core value prop.
 */
export function WhoIsItFor() {
  return (
    <section
      className="bg-[#0a0a0f] border-b border-zinc-800"
      aria-labelledby="who-is-it-for-title"
      data-testid="who-is-it-for"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="who-is-it-for-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="who-is-it-for-title"
          >
            这是给谁用的?
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-testid="who-is-it-for-grid"
        >
          {AUDIENCE.map((a) => (
            <article
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
              data-testid={`who-card-${a.id}`}
            >
              <div className="text-3xl" aria-hidden data-testid="who-card-emoji">
                {a.emoji}
              </div>
              <h3
                className="text-lg font-semibold text-zinc-50"
                data-testid="who-card-title"
              >
                {a.title}
              </h3>
              <p
                className="text-sm text-zinc-300 leading-relaxed italic"
                data-testid="who-card-quote"
              >
                &ldquo;{a.quote}&rdquo;
              </p>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/60">
                <p className="text-xs text-zinc-500" data-testid="who-card-scenarios">
                  场景:<span className="text-zinc-300">{a.scenarios}</span>
                </p>
                <p className="text-xs text-zinc-500" data-testid="who-card-value">
                  价值:<span className="text-zinc-300">{a.value}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhoIsItFor;
