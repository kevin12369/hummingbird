export interface RecordOptions {
  maxDurationMs: number;
  mimeType?: string;
}

export function isRecordingSupported(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as any).MediaRecorder !== 'undefined';
}

export async function startRecording(opts: RecordOptions): Promise<Blob> {
  if (!isRecordingSupported()) {
    throw new Error('MediaRecorder is not supported in this browser');
  }
  const stream = await (navigator as any).mediaDevices.getUserMedia({ audio: true });
  const MediaRecorder = (globalThis as any).MediaRecorder;
  const mimeType = opts.mimeType ?? pickSupportedMime();
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  return new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e: any) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e: any) => {
      clearTimeout(timeoutHandle);
      reject(new Error(e.error?.message ?? 'MediaRecorder error'));
    };
    recorder.onstop = () => {
      clearTimeout(timeoutHandle);
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
      stream.getTracks().forEach((t: any) => t.stop());
    };
    recorder.start();
    timeoutHandle = setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, opts.maxDurationMs);
  });
}

export function stopRecording(): void {
  // No-op: auto-stop is handled by maxDurationMs.
  // Kept as a stable API hook for callers that may want to stop early
  // in a future revision (e.g. manual stop button). Currently unused.
}

function pickSupportedMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const c of candidates) {
    if ((globalThis as any).MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return '';
}
