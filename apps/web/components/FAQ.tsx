import React from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-copyright',
    question: '我哼的版权属于谁?',
    answer:
      '你哼的是你的输入,4 轨 MIDI 编排和 MP3 编码是 Hummingbird 生成的(开源 MIT)。两者都属于你,可以自由使用。',
  },
  {
    id: 'faq-upload',
    question: '我的音频会上传到云端吗?',
    answer:
      '不会。所有处理(音高识别 / 调式识别 / LLM / 音频渲染 / MP3 编码)都在你的浏览器内完成,音频不离开你的设备。LLM 走本地 Ollama / LM Studio,或 Cloudflare Workers AI(零存储,只转发不记录)。',
  },
  {
    id: 'faq-pricing',
    question: '需要付费吗?有配额吗?',
    answer:
      '完全免费,无配额。Cloudflare Workers AI 有免费额度,本地 LLM 走你自己的 Ollama(无限)。Suno / Udio 这种要付费 + 配额的我们不学。',
  },
  {
    id: 'faq-mobile',
    question: '移动端能用吗?',
    answer:
      '主功能在桌面 Chrome / Edge / Firefox / Safari 全跑通。移动 Safari 16 之前不支持 OfflineAudioContext,会自动降级到只导 4 stems .mid。',
  },
  {
    id: 'faq-12-styles',
    question: '5 风格够了,为什么 Hummingbird 给 12 风格?',
    answer:
      '因为 2025-2026 主流市场 12 个风格覆盖了 90% 短视频 / 朋友圈 / 学习 BGM 场景。再多就过拟合了,不如让 LLM 选得准。',
  },
  {
    id: 'faq-midi-daw',
    question: '输出的 MIDI 跟 GarageBand / Logic / Ableton 兼容吗?',
    answer:
      '100% 兼容。Hummingbird 用的是标准 GM 音色 + 标准 MIDI 格式,任何 DAW 都能直接拖入。4 轨分离(旋律/和弦/贝斯/鼓)就是为二次创作设计的。',
  },
  {
    id: 'faq-contribute',
    question: '怎么贡献代码?',
    answer:
      'GitHub Issues 标 "good first issue" 标签的,新手友好;PR 流程见 CONTRIBUTING.md(目前还在 v1 草稿);有想法也可以开 Discussion。',
  },
];

/**
 * "常见疑问" — FAQ accordion using native <details>/<summary>.
 *
 * No React state, SSR-friendly, keyboard + a11y free out of the box.
 */
export function FAQ() {
  return (
    <section
      id="faq"
      className="bg-[#0a0a0f] border-b border-zinc-800"
      aria-labelledby="faq-title"
      data-testid="faq"
    >
      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="faq-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="faq-title"
          >
            常见疑问
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            7 个最常被问的问题
          </p>
        </div>

        <div className="flex flex-col gap-3" data-testid="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.id}
              data-testid={`faq-item-${item.id}`}
              className="group rounded-lg border border-zinc-800 bg-zinc-950/40 open:bg-zinc-950/70 transition-colors"
            >
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-zinc-100 text-sm md:text-base font-medium list-none">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="text-zinc-500 group-open:rotate-45 transition-transform text-xl leading-none select-none"
                >
                  +
                </span>
              </summary>
              <div
                className="px-5 pb-4 text-sm md:text-base text-zinc-300 leading-relaxed"
                data-testid={`faq-answer-${item.id}`}
              >
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;