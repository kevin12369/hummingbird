// Polyfill Web Audio API on globalThis for worker + jsdom environment
// (the existing render-core.test.ts also imports web-audio-api/polyfill directly;
// setupFiles ensures worker tests get it too without duplication.)
import 'web-audio-api/polyfill';