import { useEffect, useRef } from 'react';

export interface WaveformViewProps {
  audio: Blob | null;
}

export function WaveformView({ audio }: WaveformViewProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!audio || !ref.current) return;
    let cancelled = false;
    (async () => {
      try {
        const arrayBuffer = await audio.arrayBuffer();
        const AudioContextClass = (globalThis as any).AudioContext ?? (globalThis as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        if (cancelled || !ref.current) return;
      const channel = audioBuffer.getChannelData(0);
      const canvas = ref.current;
      const c2d = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;
      c2d.clearRect(0, 0, w, h);
      c2d.strokeStyle = '#3aa6ff';
      c2d.lineWidth = 1;
      c2d.beginPath();
      const samplesPerPx = Math.floor(channel.length / w);
      for (let x = 0; x < w; x++) {
        const start = x * samplesPerPx;
        const end = Math.min(start + samplesPerPx, channel.length);
        let min = 0, max = 0;
        for (let i = start; i < end; i++) {
          const v = channel[i]!;
          if (v < min) min = v;
          if (v > max) max = v;
        }
        c2d.moveTo(x, h / 2 + min * (h / 2));
        c2d.lineTo(x, h / 2 + max * (h / 2));
      }
      c2d.stroke();
      } catch {
        // ignore decode/draw errors (e.g. test environment)
      }
    })();
    return () => { cancelled = true; };
  }, [audio]);
  if (!audio) return null;
  return <canvas ref={ref} width={400} height={80} className="bg-zinc-900 rounded" />;
}
