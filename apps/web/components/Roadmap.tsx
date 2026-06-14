import React from 'react';

type PhaseStatus = 'done' | 'in-progress' | 'planned';

interface RoadmapPhase {
  id: string;
  version: string;
  period: string;
  title: string;
  description: string;
  status: PhaseStatus;
  badge: string;
}

const ROADMAP: RoadmapPhase[] = [
  {
    id: 'v1',
    version: 'Phase 1',
    period: 'v1',
    title: 'v1 30 秒从哼唱到小样',
    description:
      '4 轨 MIDI + MP3 编码 + 12 风格 + 零 LLM 配额的浏览器直连',
    status: 'done',
    badge: 'Done',
  },
  {
    id: 'v2',
    version: 'Phase 2',
    period: '2026 Q3',
    title: 'v2 多语言歌词 + AI 教学反馈 + 协作分享',
    description:
      '中文 / English / 日本語 歌词嵌入 MIDI 第 5 轨;3-5 条分类反馈(注意/警告/建议);用户间可分享小样链接(URL hash)',
    status: 'in-progress',
    badge: 'In progress',
  },
  {
    id: 'v3',
    version: 'Phase 3',
    period: '2026 Q4',
    title: 'v3 风格上传 + 自定义音色 + 多用户协作',
    description:
      '用户可上传自己训练的 LoRA 音色;自定义 SoundFont 替换 GM;多人同时编辑一个 session',
    status: 'planned',
    badge: 'Planned',
  },
];

function StatusDot({ status }: { status: PhaseStatus }) {
  const cls =
    status === 'done'
      ? 'bg-emerald-500 ring-emerald-300/40'
      : status === 'in-progress'
      ? 'bg-amber-400 ring-amber-300/40 animate-pulse'
      : 'bg-zinc-600 ring-zinc-500/30';
  return (
    <span
      aria-hidden
      className={`inline-block w-4 h-4 rounded-full ring-4 ${cls}`}
    />
  );
}

function StatusBadge({ status, badge }: { status: PhaseStatus; badge: string }) {
  const cls =
    status === 'done'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : status === 'in-progress'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-full border ${cls}`}
      data-testid={`roadmap-status-${status}`}
    >
      {badge}
    </span>
  );
}

/**
 * "路线图" — 3 phase vertical timeline.
 *
 * Vertical line drawn via relative/absolute positioning. Each phase is a
 * circular dot (StatusDot) connected by a 2px zinc-800 line.
 */
export function Roadmap() {
  return (
    <section
      id="roadmap"
      className="bg-[#0a0a0f] border-b border-zinc-800"
      aria-labelledby="roadmap-title"
      data-testid="roadmap"
    >
      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="roadmap-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="roadmap-title"
          >
            路线图
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            v1 已部署,接下来 6 个月
          </p>
        </div>

        <ol
          className="relative flex flex-col gap-8 pl-6 md:pl-8"
          data-testid="roadmap-list"
        >
          {/* Vertical timeline rail */}
          <span
            aria-hidden
            className="absolute left-[7px] md:left-[11px] top-2 bottom-2 w-px bg-zinc-800"
          />

          {ROADMAP.map((phase) => (
            <li
              key={phase.id}
              className="relative pl-6 md:pl-8"
              data-testid={`roadmap-phase-${phase.id}`}
            >
              {/* Dot anchored on the rail */}
              <span className="absolute -left-[2px] md:-left-[2px] top-1.5 flex items-center justify-center">
                <StatusDot status={phase.status} />
              </span>

              <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    {phase.version}
                  </span>
                  <span className="text-xs text-zinc-500">·</span>
                  <span className="text-xs text-zinc-400">{phase.period}</span>
                  <StatusBadge status={phase.status} badge={phase.badge} />
                </div>
                <h3
                  className="text-lg md:text-xl font-semibold text-zinc-50"
                  data-testid={`roadmap-title-${phase.id}`}
                >
                  {phase.title}
                </h3>
                <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Roadmap;