import { Html, Head, Main, NextScript } from 'next/document';

const TITLE = 'Hummingbird / 哼哼编曲 - 30 秒从哼唱到一首能发的小样';
const DESCRIPTION =
  'Hummingbird 是一款开源 AI 音乐工具:你哼 30 秒,浏览器给你一首 4 轨 MIDI + MP3 小样。12 风格覆盖主流市场,完全本地处理,零配额。';
const KEYWORDS =
  'AI 哼唱编曲, hum to song, browser music, Web Audio, MIDI 4 stems, MP3, AI music tool, 12 styles, 不会乐器也能做音乐';
const CANONICAL = 'https://kevin12369.github.io/hummingbird/';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Hummingbird',
  alternateName: '哼哼编曲',
  description:
    '30 秒从哼唱到一首能发的小样。开源 AI 音乐工具,12 风格 4 轨 MIDI + MP3。',
  url: CANONICAL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser (Chrome, Edge, Firefox, Safari 16+)',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  license: 'https://github.com/kevin12369/hummingbird/blob/main/LICENSE',
  author: {
    '@type': 'Person',
    name: 'kevin12369',
    email: '491750329@qq.com',
  },
};

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content={KEYWORDS} />
        <meta name="author" content="kevin12369" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="Hummingbird" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />

        {/* Canonical */}
        <link rel="canonical" href={CANONICAL} />

        {/* JSON-LD SoftwareApplication schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </Head>
      <body className="bg-zinc-950 text-zinc-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}