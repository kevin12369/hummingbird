/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  basePath: '/hummingbird',
  assetPrefix: '/hummingbird/',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ['@hummingbird/audio', '@hummingbird/midi', '@hummingbird/prompt', '@hummingbird/llm', '@hummingbird/render'],
};
