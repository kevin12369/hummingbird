# Run 哼哼编曲 · Hummingbird locally

5 steps. ~10 min total.

## 1. Prerequisites

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- A local LLM server (Ollama or LM Studio) — see step 4 below

## 2. Clone

```bash
git clone https://github.com/kevin12369/hummingbird.git
cd hummingbird
```

## 3. Install

```bash
pnpm install
```

## 4. Configure LLM

Install Ollama from https://ollama.com, then:

```bash
ollama pull llama3.1:8b
ollama serve   # listens on http://localhost:11434
```

Or use LM Studio on port 1234 with any Qwen2.5-Coder / Llama 3.1 model.

> **Quick demo without LLM:** Open the live demo at https://kevin12369.github.io/hummingbird/ and click the **"Try sample"** button — it runs the full pipeline (transcribe → key detect → arrange → MIDI) using a hardcoded fallback arrangement, so you can see the complete UX without any local LLM. The same fallback kicks in when you run this app on github.io; locally, providing a real LLM gives you the full AI-arranged MIDI.

## 5. Run

```bash
pnpm dev
# open http://localhost:3000/hummingbird
```

## 6. 下载小样 (可选)

在主页 ready 状态,点 "Download .mp3" 即可拿到 30s 完整混音 + "Download 4 stems" 拿到 4 个分轨 MIDI。

## What you'll see

- A live demo of 哼唱 → 4-track MIDI 编曲
- All 185 tests pass (`pnpm test` to re-run)
- TypeScript strict (`pnpm -r exec tsc --noEmit`)

## Need help?

- Issues: https://github.com/kevin12369/hummingbird/issues
- Email: 491750329@qq.com
