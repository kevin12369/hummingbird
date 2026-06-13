/// <reference lib="webworker" />
import { renderCore } from './render-core';
import { encodeMp3CoreWithFallback, type Mp3Bitrate } from './encode-mp3-core';
import type { StylePreset } from './types';

interface RenderRequest {
  type: 'render';
  tracks: unknown;
  preset: StylePreset;
  durationSec: number;
  kbps: Mp3Bitrate;
  requestId: string;
}

interface ProgressRequest {
  type: 'progress';
  requestId: string;
  progress: number;  // 0-1
}

interface DoneRequest {
  type: 'done';
  requestId: string;
  bytes: Uint8Array;
  format: 'mp3' | 'wav';
  durationMs: number;
}

interface ErrorRequest {
  type: 'error';
  requestId: string;
  error: string;
}

type WorkerOut = ProgressRequest | DoneRequest | ErrorRequest;

self.addEventListener('message', async (e: MessageEvent<RenderRequest>) => {
  const msg = e.data;
  if (msg.type !== 'render') return;

  const start = performance.now();
  try {
    // 进度:25%
    postMessage({ type: 'progress', requestId: msg.requestId, progress: 0.25 } as WorkerOut);

    const audioBuffer = await renderCore(msg.tracks as any, msg.preset, msg.durationSec);

    // 进度:50%
    postMessage({ type: 'progress', requestId: msg.requestId, progress: 0.5 } as WorkerOut);

    const pcm: Float32Array[] = [
      audioBuffer.getChannelData(0),
      audioBuffer.getChannelData(1),
    ];

    // 进度:75%
    postMessage({ type: 'progress', requestId: msg.requestId, progress: 0.75 } as WorkerOut);

    const { format, bytes } = await encodeMp3CoreWithFallback(pcm, msg.kbps);

    const durationMs = performance.now() - start;

    // transferable 零拷贝
    postMessage(
      { type: 'done', requestId: msg.requestId, bytes, format, durationMs } as WorkerOut,
      [bytes.buffer],
    );
  } catch (err) {
    postMessage({
      type: 'error',
      requestId: msg.requestId,
      error: err instanceof Error ? err.message : String(err),
    } as WorkerOut);
  }
});