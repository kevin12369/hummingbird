import React from 'react';
import { HeroScreenshot } from './HeroScreenshot';

/**
 * Hero section for the landing page.
 * Left column: brand tag, headline, sub-headline, value props, two CTAs.
 * Right column: mock product screenshot placeholder.
 */
export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-zinc-950 to-zinc-900 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <div className="text-sm text-red-400 font-medium tracking-wide">
            AI Music Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-50 leading-tight tracking-tight">
            Hummingbird
            <br />
            <span className="text-zinc-400 text-3xl md:text-4xl">哼哼编曲</span>
          </h1>
          <p className="text-xl text-zinc-300">
            你哼 30 秒,浏览器给你一首 4 轨 MIDI + MP3 小样。
          </p>
          <p className="text-base text-zinc-400">
            不会乐器?零门槛。想要完整作品?一键导出。
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors animate-pulse"
            >
              Try live demo
            </a>
            <a
              href="https://github.com/kevin12369/hummingbird"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-200 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
        <div className="md:order-2">
          <HeroScreenshot />
          <p className="mt-4 text-sm text-zinc-500 text-center md:text-right">
            30 秒从哼唱到一首能发的小样
          </p>
        </div>
      </div>
    </section>
  );
}