import { useEffect, useState } from 'react';
import { startRecording, isRecordingSupported, type RecordOptions } from '@hummingbird/audio';

export interface RecorderProps {
  onComplete: (blob: Blob) => void;
  maxDurationMs?: number;
}

export function Recorder({ onComplete, maxDurationMs = 30000 }: RecorderProps) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 客户端 mount 之前 SSR 一律渲染占位(空),避免 hydration mismatch:
  // SSR 阶段 MediaRecorder 不存在,客户端存在。
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function start() {
    setError(null);
    try {
      setRecording(true);
      const blob = await startRecording({ maxDurationMs });
      setRecording(false);
      onComplete(blob);
    } catch (e) {
      setRecording(false);
      setError((e as Error).message);
    }
  }

  // SSR + 首次客户端 render:渲染占位(空 div 高度占位),保证 SSR/CSR 输出一致
  if (!mounted) {
    return <div className="h-[52px]" aria-hidden="true" />;
  }

  // 客户端 mount 后才检查是否支持,避免 hydration mismatch
  if (!isRecordingSupported()) {
    return <p className="text-sm text-red-300">MediaRecorder is not supported in this browser.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={start}
        disabled={recording}
        className="rounded-full bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-medium disabled:opacity-50"
      >
        {recording ? 'Stop recording' : 'Start recording'}
      </button>
      {error && <p className="text-xs text-red-300">! {error}</p>}
    </div>
  );
}
