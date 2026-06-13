import { useState } from 'react';
import { downloadBytes, startRender, type RenderJob } from '../lib/render-client';
import type { StylePreset, RenderError } from '@hummingbird/render';

interface Props {
  tracks: { melody: unknown; chords: unknown; bass: unknown; drums: unknown };
  preset: StylePreset;
  durationSec: number;
  capabilities: { offlineAudioContext: boolean } | null;
}

export function DownloadButtons({ tracks, preset, durationSec, capabilities }: Props) {
  const [renderState, setRenderState] = useState<'idle' | 'queued' | 'rendering' | 'rendered' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');
  const [bytes, setBytes] = useState<Uint8Array | null>(null);

  const mp3Disabled = !capabilities?.offlineAudioContext || renderState === 'queued' || renderState === 'rendering';

  const onDownloadMp3 = () => {
    setRenderState('queued');
    setProgress(0);
    const controller = new AbortController();
    const job: RenderJob = {
      requestId: crypto.randomUUID(),
      tracks,
      preset,
      durationSec,
      kbps: 128,
      onProgress: (p) => { setProgress(p); setRenderState('rendering'); },
      onDone: (b, fmt) => { setBytes(b); setFormat(fmt); setRenderState('rendered'); downloadBytes(b, `hummingbird.${fmt}`, fmt === 'mp3' ? 'audio/mpeg' : 'audio/wav'); },
      onError: () => setRenderState('error'),
      signal: controller.signal,
    };
    startRender(job);
  };

  const onDownloadStems = () => {
    const stems = [
      { name: 'melody.mid', data: downloadStem(tracks.melody) },
      { name: 'chords.mid', data: downloadStem(tracks.chords) },
      { name: 'bass.mid', data: downloadStem(tracks.bass) },
      { name: 'drums.mid', data: downloadStem(tracks.drums) },
    ];
    for (const stem of stems) {
      downloadBytes(stem.data, stem.name, 'audio/midi');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDownloadMp3}
          disabled={mp3Disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          data-testid="download-mp3"
        >
          🎵 Download .mp3
          {renderState === 'queued' && ' (queued)'}
          {renderState === 'rendering' && ` (${Math.round(progress * 100)}%)`}
        </button>
        <button
          type="button"
          onClick={onDownloadStems}
          className="px-4 py-2 bg-gray-200 rounded-lg"
          data-testid="download-stems"
        >
          🎼 Download 4 stems
        </button>
      </div>
      {renderState === 'error' && (
        <div className="text-sm text-red-600">渲染失败,试试 Download 4 stems</div>
      )}
    </div>
  );
}

function downloadStem(midi: any): Uint8Array {
  return midi && typeof midi.toArray === 'function' ? midi.toArray() : new Uint8Array();
}
