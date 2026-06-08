# 哼哼编曲 · Hummingbird

> **哼唱变 MIDI 编曲 / Hum → MIDI arrangement**

浏览器录 30 秒哼唱 → Spotify Basic Pitch 转 MIDI → LLM 推调式 + 4 轨(旋律/和弦/贝斯/鼓) → `.mid` 下载 + Tone.js 浏览器试听。

*代码待写。Portfolio project; implementation forthcoming.*

---

## Why

**5 个项目里成本最低**——Workers AI Llama 3.1 8B 免费 10k neurons/天 ≈ 1000 次编曲/天。无需 Sonnet,默认就够。

具体做这个因为**多模态整合的工程感强**:浏览器音频 + 外部 ML(Basic Pitch)+ LLM 编排 + 客户端 MIDI 拼装。简历上一个端到端的多模态 LLM 应用。

---

## Stack

- MediaRecorder API(WebM/Opus)
- Spotify Basic Pitch(免费,音频→MIDI 音符)
- Workers AI Llama 3.1 8B(默认,免费) / DeepSeek V3(便宜) / Claude Haiku(BYOK 升级)
- Krumhansl-Schmuckler 调式识别(JS 客户端,无 ML 依赖)
- `@tonejs/midi`(MIDI 字节拼装,纯函数)
- Tone.js(浏览器试听)
- Cloudflare Pages + Workers + D1 + R2

**关键:整套流程没有服务端音频处理。** Server 不碰音频字节,带宽和 CPU 几乎为 0。

---

## Architecture (planned)

```
Browser
  ├── MediaRecorder (WebM/Opus, 30s max)
  ├── Upload to Worker
Worker
  ├── Forward to Basic Pitch (Spotify API, free)
  ├── Cache by audio_hash (KV)
  ├── LLM arrangement (Workers AI default)
  └── Return JSON arrangement
Browser
  ├── @tonejs/midi assemble (pure function)
  ├── Tone.js preview
  └── Download .mid
```

---

## Tradeoffs (real)

- **Basic Pitch 准确率:** 清晰哼唱 80%+,口哨/含混 50%。Fallback: Krumhansl-Schmuckler 从识别出的音符反推调式。
- **LLM 编曲质量天花板。** 4 个和弦 + 1 条贝斯 + 1 个鼓 pattern,比专业编曲师差远了。预期"够用,不出错,但惊艳不到"。
- **风格区分。** "pop" vs "lo-fi" 在 200 token 输出里分不清。Plan 写 prompt 模板时做细:每个风格独立 system prompt(代表乐队 + 编曲特征 + 鼓型 + 贝斯线型)。
- **音色问题。** 导的是裸 MIDI,用户得自己挂 SoundFont。MVP 不解决。

---

## Run

```bash
pnpm install
pnpm dev:web
pnpm dev:worker
```

---

## Known limitations

- No built-in sound(用户自己挂 SoundFont)
- 30s duration cap(超了截断,需加 toast 警告)
- KV 缓存按 audio_hash 重复请求不重调 LLM
- 移动端"按住录音"体验不如 PC
- 浏览器需要 WebM/Opus 支持(iOS Safari 限制)

---

## Explicit non-goals

- No real-time collab(two people humming together)
- No stem separation / vocal removal
- No reference-track style transfer
- No lyrics generation
- No music theory tutorial
- No multi-user / sharing / social

---

## Cost (5 个项目里最低)

| Usage | Monthly |
|---|---|
| Self + friends | $0 |
| 10K generations/month | $0 |
| 1M generations/month | $30-50(DeepSeek fallback) |

---

## Status

- Design: [docs/design/2026-06-07-ai-hum-to-song-design.md](../docs/design/2026-06-07-ai-hum-to-song-design.md)
- Plan: [docs/plans/2026-06-07-hummingbird-hum-to-song-plan.md](../docs/plans/2026-06-07-hummingbird-hum-to-song-plan.md)
- Code: 0% — forthcoming
- Live URL: TBD
