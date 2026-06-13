import Link from 'next/link';
import Head from 'next/head';

const NAME = '哼哼编曲 · Hummingbird';
const TAGLINE = '30 秒哼唱 → 4 轨 MIDI 编曲';
const DESCRIPTION =
  'Hummingbird 让你哼出脑海里的旋律,浏览器在 30 秒内把它变成 4 轨 MIDI(主旋律 + 和弦 + 贝斯 + 鼓)。基础模型跑在浏览器里(Basic Pitch ONNX),调式识别是纯算法(Krumhansl-Schmuckler),编排调用本机 LLM(Ollama / LM Studio / vLLM),MIDI 客户端拼装 + Tone.js 实时回放,音频和 prompt 都不离开你的机器。';
const GITHUB_URL = 'https://github.com/kevin12369/hummingbird';
const DEMO_URL = 'https://kevin12369.github.io/hummingbird/';

export default function Portfolio() {
  return (
    <>
      <Head>
        <title>{NAME} — Portfolio</title>
        <meta name="description" content={DESCRIPTION} />
      </Head>
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-3xl mx-auto flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold">{NAME}</h1>
          <p className="text-zinc-400 mt-1">{TAGLINE}</p>
        </header>
        <section className="rounded border border-zinc-800 overflow-hidden">
          <img
            src="/hummingbird/docs/img/main.png"
            alt={`${NAME} demo screenshot`}
            className="w-full"
          />
        </section>
        <section className="prose prose-invert max-w-none">
          <p>{DESCRIPTION}</p>
          <h2>What you can do here</h2>
          <ul>
            <li>用浏览器麦克风哼 30 秒,自动转写为音符</li>
            <li>自动识别调式 + 12 大调 / 12 小调相关性匹配</li>
            <li>本机 LLM 配和弦 / 写贝斯 / 排鼓点(5 风格 preset)</li>
            <li>4 轨 MIDI 拼装 + Tone.js 实时回放 + 一键下载</li>
            <li>失败自动 fallback 到 I-V-vi-IV 经典进行,不会卡死</li>
          </ul>
          <h2>How to run it for real</h2>
          <p>上面看到的 live demo 是一个 portfolio 预览(github.io 上 Try-sample 走硬编码 fallback 演示完整流程)。要在本机真跑通,需要你提供本地 LLM 服务:</p>
          <ul>
            <li>
              <Link href="/hummingbird/docs/RUN-LOCALLY.md">Run locally guide</Link> — 1 屏 5 步 clone-and-run 指南
            </li>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">在 GitHub 上浏览源码</a>
            </li>
            <li>
              <a href={DEMO_URL} target="_blank" rel="noreferrer">在线 demo</a>(Try-sample 按钮走 fallback,无需 LLM)
            </li>
          </ul>
          <h2>Other projects in this portfolio</h2>
          <ul>
            <li>
              <a href="https://kevin12369.github.io/sry-portfolio/" target="_blank" rel="noreferrer">
                嘴笨助手 Sry
              </a>{' '}
              — 5 风格道歉信生成器
            </li>
            <li>
              <a href="https://kevin12369.github.io/whimsy-portfolio/" target="_blank" rel="noreferrer">
                一念成游 Whimsy
              </a>{' '}
              — AI 2D 小游戏生成器
            </li>
            <li>
              <a href="https://kevin12369.github.io/hummingbird-portfolio/" target="_blank" rel="noreferrer">
                哼哼编曲 Hummingbird
              </a>{' '}
              — 哼唱→MIDI 编曲
            </li>
          </ul>
        </section>
        <footer>
          <Link href="/hummingbird/" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Back to demo
          </Link>
        </footer>
      </main>
    </>
  );
}
