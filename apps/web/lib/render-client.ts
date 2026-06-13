import type { StylePreset, RenderError, Capabilities } from '@hummingbird/render';

// capabilities 探测
export async function detectCapabilities(): Promise<Capabilities> {
  const has = (k: string) => typeof (globalThis as any)[k] !== 'undefined';
  return {
    offlineAudioContext: has('OfflineAudioContext'),
    audioWorklet: has('AudioWorkletNode'),
    webAssemblyStreaming: has('WebAssembly') && typeof WebAssembly.compileStreaming === 'function',
    crossOriginIsolated: (globalThis as any).crossOriginIsolated === true,
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    indexedDb: has('indexedDB'),
    webWorkerModule: (() => { try { new Worker('', { type: 'module' }); return true; } catch { return false; } })(),
    lamejsLoadable: true,  // 延迟到首次 render 探测
    webmOpus: (() => {
      try { return MediaRecorder.isTypeSupported('audio/webm;codecs=opus'); } catch { return false; }
    })(),
  };
}

// Worker 客户端胶水
let workerInstance: Worker | null = null;

export function getRenderWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL('@hummingbird/render/render.worker.ts', import.meta.url),
      { type: 'module' },
    );
  }
  return workerInstance;
}

export function terminateRenderWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

// 触发渲染 + progress 回调
export interface RenderJob {
  requestId: string;
  tracks: unknown;
  preset: StylePreset;
  durationSec: number;
  kbps: 64 | 96 | 128;
  onProgress: (progress: number) => void;
  onDone: (bytes: Uint8Array, format: 'mp3' | 'wav', durationMs: number) => void;
  onError: (err: RenderError) => void;
  signal: AbortSignal;
}

export function startRender(job: RenderJob): void {
  const worker = getRenderWorker();
  const handler = (e: MessageEvent) => {
    const msg = e.data;
    if (msg.requestId !== job.requestId) return;
    if (msg.type === 'progress') {
      job.onProgress(msg.progress);
    } else if (msg.type === 'done') {
      job.onDone(msg.bytes, msg.format, msg.durationMs);
      worker.removeEventListener('message', handler);
    } else if (msg.type === 'error') {
      job.onError({ code: 'UNKNOWN', message: msg.error, recoverable: true, fallbackChain: ['stems'] });
      worker.removeEventListener('message', handler);
    }
  };
  worker.addEventListener('message', handler);

  job.signal.addEventListener('abort', () => {
    worker.removeEventListener('message', handler);
    terminateRenderWorker();  // 强制终止
  });

  worker.postMessage({
    type: 'render',
    requestId: job.requestId,
    tracks: job.tracks,
    preset: job.preset,
    durationSec: job.durationSec,
    kbps: job.kbps,
  });
}

// 触发浏览器下载
export function downloadBytes(bytes: Uint8Array, filename: string, mime: string): void {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}