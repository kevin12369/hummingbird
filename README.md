# Hummingbird · 哼唱编曲

> **你哼 30 秒,浏览器给你一首歌的 MIDI。/ Hum 30 seconds, get a 4-track MIDI in your browser.**

[![Status](https://img.shields.io/badge/status-Phase_1_MVP_shipped-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Stack](https://img.shields.io/badge/stack-GitHub_Pages-222?logo=github)](#)
[![Tests](https://img.shields.io/badge/tests-101_passing-brightgreen)](#)

---

## 这个想法

你脑子里突然冒出一段旋律——洗澡时哼的、地铁里随口唱的、梦里刚醒还记得的——**但你不会弹琴,也没时间学编曲**。这段旋律三分钟后就被忘了。

**让浏览器在 30 秒内把那段哼唱变成 4 轨 MIDI**:主旋律 + 和弦 + 贝斯 + 鼓。你哼完,Basic Pitch 帮你把音高扒下来,Krumhansl-Schmuckler 帮你识别调式,本地 LLM 帮你配和弦/写贝斯/排鼓点,`@tonejs/midi` 帮你拼成标准 MIDI 文件,浏览器直接播放 + 一键下载。

> **不替你做音乐**——只帮你**把脑子里的哼唱变成可编辑的 MIDI 草稿**。后续调音色、混音、母带还是 DAW(Logic / Ableton / FL Studio)来做。

---

## 这件事有意思在哪

**浏览器内完整跑通"哼唱→MIDI"是个硬需求,但 AI 之前没人认真做过"全客户端"**。市面上的"AI 作曲"工具都要上传音频到云端——隐私 + 延迟 + 配额三连劝退。

更细的:

- **基础模型跑在浏览器** — Basic Pitch(Spotify 开源 ONNX 音高检测模型)用 Web Audio API + Web Worker 隔离主线程,**不上传任何音频**
- **调式识别纯算法** — Krumhansl-Schmuckler 12 大调 + 12 小调相关性匹配,无 ML,200 行 TypeScript
- **LLM 直连本机** — 默认走 Ollama(原生协议)或 LM Studio / vLLM / llama.cpp(OpenAI 兼容),**音频和 prompt 都不离开本机**,Cloudflare 配额记 0
- **MIDI 客户端拼装** — `@tonejs/midi` 4 轨(melody / chords / bass / drums)客户端拼装,GM 鼓映射 + 4/4 拍
- **Tone.js 试听** — PolySynth 4 轨实时回放,Web Audio 调度,无需后端

如果 LLM 不可达或 JSON 解析失败,**自动 fallback 到 I-V-vi-IV 经典进行**,绝不会让用户卡死。

---

## 想要实现的样子

- 用户点红色录音按钮 → 浏览器弹麦克风权限 → 哼 30 秒(自动停止)
- 屏幕显示"Processing..."→ 4 个步骤在跑(音高识别 → 调式识别 → LLM 编排 → MIDI 拼装)
- 几秒后:显示 `C major / 120 BPM`,下面 4 轨 MIDI 已经拼好
- 用户点 **Play 4 tracks** → Tone.js 实时回放 melody / chords / bass(鼓暂未实现,Phase 2)
- 用户点 **Download .mid** → 拿到 `hummingbird.mid`,直接拖进 Logic / Ableton / FL Studio 二次创作
- 右上角 ⚙ 打开 Settings → 切主题色 / 配置本机 LLM(Ollama / LM Studio / vLLM / llama.cpp 都行)

---

## 未来可能拓展成什么

- **5 风格选择器** — 现在只有 pop,Phase 2 加 lo-fi / jazz / rock / classical 风格 picker(prompt 模板已就绪)
- **鼓轨试听** — 需要 Sampler + GM 鼓 WAV,Phase 2
- **MIDI 二次编辑** — 音高修正 / 量化 / 力度调整,直接在网页上拖
- **导出 MusicXML** — 方便乐谱软件(Sibelius / MuseScore)打开
- **多轨混音** — 每轨音量 / 静音 / 独奏
- **历史侧边栏** — 你录过的所有哼唱都在
- **哼唱识别准确度提升** — Basic Pitch 替换为自训练小模型(目前在嘈杂环境下识别率约 70%)

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 前端 | Next.js 14 (Pages Router, `output: 'export'`) |
| 录音 | MediaRecorder API(webm/opus,30s 自动停止) |
| 音高识别 | `@spotify/basic-pitch` ONNX(Web Worker 隔离) |
| 调式识别 | Krumhansl-Schmuckler + Pearson 相关性(12 大调 + 12 小调) |
| LLM(本地) | Ollama 原生 (`/api/generate`) + OpenAI 兼容 (`/chat/completions`) |
| Prompt 模板 | 5 风格预设(pop/lo-fi/jazz/rock/classical),严格 JSON 输出 |
| MIDI 拼装 | `@tonejs/midi` 4 轨客户端拼装,GM 鼓映射 |
| 试听 | Tone.js PolySynth + Web Audio 调度 |
| 状态机 | 6 状态(idle/recording/processing/ready/playing/error) |
| 部署 | GitHub Pages(静态导出,`basePath: '/hummingbird'`) |

---

## To-do

- [x] 写 `packages/audio`(MediaRecorder + Basic Pitch + Krumhansl-Schmuckler)
- [x] 写 `packages/prompt`(5 风格 prompt 模板)
- [x] 写 `packages/llm`(6 provider 抽象,4 云端 + 2 本地,SSRF 防护)
- [x] 写 `packages/midi`(4 轨 MIDI 拼装)
- [x] 写 `apps/web` 骨架(Next.js 14 + Tailwind + vitest)
- [x] 写 `lib/theme` + `lib/state-machine`(6 状态 7 事件)
- [x] 写 `lib/llm-direct`(浏览器直连 Ollama / OAI 兼容)
- [x] 写 `Recorder` + `WaveformView` + `KeyDisplay` + `Player` + `DownloadMidi` + `SettingsModal`
- [x] 写 `pages/index.tsx` 端到端流
- [x] 写 GitHub Pages 自动部署 + CI 工作流
- [x] 写 README + 101 测试通过

---

## 欢迎词

开源 + 公开 portfolio。

如果你:

- 试用了,录完 30 秒识别出来一堆奇怪音符 → 提 issue,贴录音环境(浏览器/麦克风型号/背景噪音),我看是 Basic Pitch 调参问题还是用户操作问题
- Krumhansl-Schmuckler 识别错了(明明是 D 大调说成 G)→ 提 issue,带识别前后音高列表,我看是直方图权重还是相关性公式问题
- 5 风格 prompt 区分度不够(pop 出来像 jazz)→ 提 issue,带 "prompt" 标签,**重点讨论**
- 本机 LLM 连接失败,Settings 里点 "Test connection" 一直 500 → 提 issue,贴 baseUrl + provider + 模型名 + 错误片段
- 想加新 LLM provider(OpenAI 云端 / Mistral / Groq)→ 提 PR
- 想加新风格(电子 / 民谣 / 嘻哈)→ 提 PR,附 `StylePreset` 实现
- 真人,想给作者说"加油" → 提 issue 带 "encouragement" 标签,我收

提交 issue: [github.com/kevin12369/hummingbird/issues](https://github.com/kevin12369/hummingbird/issues)
发邮件: 491750329@qq.com

### 特别欢迎

- **音乐人 / 作曲人** — 用 MIDI 草稿二次创作的痛点是什么?哪些工具链最常用?
- **音频算法研究者** — Krumhansl-Schmuckler 在中国五声音阶场景下要不要换算法?
- **WebAssembly 工程师** — Basic Pitch 推理能不能再快 2 倍(目前 30s 音频要 3-5s)
- **TypeScript 包架构师** — 帮我看 pnpm workspace 拆分(4 pure-TS + 1 Next.js app)

---

## 本地 LLM (Local LLM)

默认走**本机 LLM 服务**——哼唱和 prompt 都不离开你的机器。这种用法下:

- **零云端消耗** — 不吃 Cloudflare / OpenAI 配额
- **隐私** — 录音、调式、prompt、MIDI 全在浏览器 + 本机 LLM 之间流转
- **自定义模型** — 用你 fine-tune 过的 LoRA / 量化模型
- **离线可用** — 断网也能用(只要 LLM 服务还跑着)

> Web 部署在 GitHub Pages 上,LLM 调用直接走浏览器到本机 LLM 服务,**不需要后端中转**。

### 支持的本地 backend

| Backend | 默认 baseUrl | 协议 |
|---------|--------------|------|
| [Ollama](https://ollama.com) | `http://localhost:11434` | Ollama 原生 (`/api/generate`) |
| [LM Studio](https://lmstudio.ai) | `http://localhost:1234/v1` | OpenAI 兼容 |
| [vLLM](https://docs.vllm.ai) | `http://localhost:8000/v1` | OpenAI 兼容 |
| [llama.cpp server](https://github.com/ggerganov/llama.cpp) | `http://localhost:8080/v1` | OpenAI 兼容 |

### 快速启动

1. 装好本机 LLM 服务,任选其一:

   ```bash
   # Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:8b
   ollama serve    # 监听 http://localhost:11434

   # LM Studio
   # 从 lmstudio.ai 下载,搜索并下载模型,在 Developer 标签点 "Start Server"
   # (默认端口 1234)

   # vLLM
   pip install vllm
   python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2.5-Coder-7B-Instruct

   # llama.cpp
   ./server -m model.gguf --host 0.0.0.0 --port 8080
   ```

2. 打开 Hummingbird Web → 右上角 **⚙** → **Local LLM** 卡片:
   - 选 Provider(Ollama / OpenAI Compatible)
   - 选/填 Base URL(下拉里给了 4 个常用 preset,不够可以手填)
   - 填 Model 名(你本机装的模型,例如 `llama3.1:8b`)
   - 可选 API Key / Timeout(默认 30s,大型模型可调到 120s)
   - 点 **Test connection**,看到 "Connected" 即通

3. 直接录音就行——`arrangeMusic` 自动读 `hummingbird:local:*` 这几个 localStorage key。

### 推荐模型

这些 Hummingbird 实际试过、生成 pop / jazz / rock 风格 prompt 还比较稳的:

- **`llama3.1:8b`** (Ollama) — 通用不错,约 5GB 内存
- **`qwen2.5-coder:7b`** (Ollama) — 代码 / 结构化 JSON 输出最强,约 5GB 内存
- **`deepseek-coder-v2:16b`** (Ollama) — 最强但吃资源,约 10GB 内存
- **`qwen2.5-coder-7b-instruct`** (vLLM / LM Studio) — Ollama 之外的等价选择

不是硬性推荐 — Settings 里 Model 字段是自由文本,你装啥就用啥。

### 注意事项

- **本地不是免费** — 你烧的是 CPU/GPU 时间和电费,不是美元;但 Cloudflare 配额记 0
- **默认 30s 超时** — 小模型够,大模型(16B+)建议调到 60-120s(Settings 里改)
- **fallback 兜底** — LLM 返回坏 JSON 或网络失败时,自动用 I-V-vi-IV 经典 pop 进行,不会卡死
- **baseUrl 仅限 http(s)** — `file://` / `ftp://` 会被 400 挡掉(SSRF 防护)
- **CORS 要在 LLM 服务端放行** — Ollama 默认 `OLLAMA_ORIGINS="*"`,LM Studio 同样,具体看各 backend 文档

---

## 项目亮点

**做了什么**

- 4 个 pure-TS package(`audio` / `midi` / `prompt` / `llm`)+ 1 个 Next.js app(web),pnpm workspace 管理
- 浏览器内完整音视频管线:MediaRecorder → Basic Pitch ONNX → Krumhansl-Schmuckler → 本地 LLM → `@tonejs/midi` 拼装 → Tone.js 回放,**全程不上传任何数据**
- 6 状态状态机(idle / recording / processing / ready / playing / error),所有 transition 受 current state 守卫
- 4 轨 MIDI 拼装:melody(通道 0) + chords(1) + bass(2) + drums(9 GM),含 tempo + 4/4 拍号
- Tone.js PolySynth 4 轨实时回放(鼓轨 Phase 2),Web Audio 调度
- 5 风格 prompt 模板(pop / lo-fi / jazz / rock / classical),严格 JSON 输出(chordProgression / bassLine / drumPattern)
- 6 LLM provider 抽象(Workers AI / DeepSeek / Gemini / Anthropic / Ollama / OpenAI 兼容),含 SSRF 防护 + 30s 可调超时
- 主题色 localStorage 持久化 + Theme panel
- GitHub Pages 静态部署:`next build` → `apps/web/out/` → 工作流自动发布

**怎么做到的**

- `packages/audio` — `recorder.ts`(MediaRecorder 4 种 mime fallback) + `basic-pitch.ts`(ONNX 浏览器推理) + `key-detect.ts`(12 × 2 Krumhansl-Schmuckler profile + Pearson 相关性)
- `packages/midi` — `assembler.ts`(`@tonejs/midi` 4 轨拼装,GM 鼓映射 1=kick/2=snare/3=hat)
- `packages/prompt` — `styles.ts`(5 风格 preset)+ `buildPrompt(input)` 严格 JSON 输出
- `packages/llm` — `Provider` interface + 6 个实现,`pickProvider(model, env, local?)` 路由,`validateLocalBaseUrl` SSRF 防护
- `apps/web/lib/state-machine.ts` — `createMachine(state)` 纯状态机,7 个 event type
- `apps/web/lib/llm-direct.ts` — `arrangeMusic(input)` 浏览器直连 Ollama `/api/generate` 或 OAI `/chat/completions`,30s AbortController timeout
- `apps/web/components/Recorder.tsx` — 录音按钮 + 30s 自动停止 + 错误展示
- `apps/web/components/Player.tsx` — Tone.js PolySynth 4 轨回放,lazy-load tone lib(~500KB)
- `apps/web/pages/index.tsx` — 端到端流:录音 → 转写 → 调式 → prompt → LLM → MIDI → ready 状态

**跑起来的数字**

- 101 测试通过(audio 15 + prompt 5 + llm 40 + midi 5 + web 36)
- TypeScript strict + `noUncheckedIndexedAccess` 干净
- 5 风格 prompt × 6 LLM provider × 4 packages/apps × 1 web app

**本地开发**

```bash
pnpm install
pnpm dev            # = pnpm --filter @hummingbird/web dev, http://localhost:3000/hummingbird
```

**测试**

```bash
pnpm test          # 101 tests across 5 packages
pnpm -r exec tsc --noEmit   # strict typecheck
```

**部署(GitHub Pages)**

- 推送到 `main` 即自动部署,工作流在 `.github/workflows/pages.yml`
- 站点 URL: https://kevin12369.github.io/hummingbird/
- 一次性配置: GitHub 仓库 Settings → Pages → Source = **GitHub Actions**
- 手动部署: `pnpm --filter @hummingbird/web build` → 把 `apps/web/out/` 上传到任意静态主机

---

## 架构图

```
+--------------------------------------------------------------+
|  Browser (Next.js static export, basePath=/hummingbird)      |
|                                                              |
|  +---------+    +-----------+    +-----------+    +------+   |
|  |Recorder | -> |Basic      | -> |Key        | -> |Prompt|  |
|  |MediaRec |    |Pitch ONNX |    |Detection  |    |Build |  |
|  |30s auto |    |Web Worker |    |Krumhansl- |    |5 sty |  |
|  +---------+    +-----------+    |Schmuckler |    +------+  |
|       |              |           +-----------+       |      |
|       v              v                                 v      |
|  +---------+    +-----------+    +-----------+    +------+   |
|  |Waveform |    |NoteEvent  |    |Key + Mode |    |Local |   |
|  |Canvas   |    |[]         |    |+ Confidnc |    |LLM   |   |
|  +---------+    +-----------+    +-----------+    |direct|   |
|                                                  |Ollama|   |
|                                                  |/OAI  |   |
|                                                  +--+---+   |
|                                                     v       |
|                                              +-----------+  |
|                                              |arrangeMsc |  |
|                                              |JSON extct |  |
|                                              |fallback ok|  |
|                                              +-----+-----+  |
|                                                    v        |
|  +----------+    +----------+    +----------+    +------+    |
|  |Download  | <- |Player    | <- |KeyDisplay| <- |MIDI  |   |
|  |.mid file |    |Tone.js   |    |C major   |    |4 trk |   |
|  |          |    |PolySynth |    |120 BPM   |    |assmb |   |
|  +----------+    +----------+    +----------+    +------+    |
+--------------------------------------------------------------+
```

---

> 这项目 Phase 1 代码已经 100% 写完,15 个 task 全部 commit。是 ATNL 5 个项目里**唯一一个全客户端、无后端**的——Whimsy 还要 Cloudflare Workers 转发,Sry 还要后端 session,Tome-FM 还要 Spotify OAuth,只有 Hummingbird 是真·纯静态。
