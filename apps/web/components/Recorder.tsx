import { useState } from 'react';
import { startRecording, isRecordingSupported, type RecordOptions } from '@hummingbird/audio';

export interface RecorderProps {
  onComplete: (blob: Blob) => void;
  maxDurationMs?: number;
}

export function Recorder({ onComplete, maxDurationMs = 30000 }: RecorderProps) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
