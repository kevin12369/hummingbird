import { useEffect, useRef } from 'react';
import type { NoteEvent } from '@hummingbird/audio';

const MAJOR_SCALE_PCS = [0, 2, 4, 5, 7, 9, 11]; // C major
const MINOR_SCALE_PCS = [0, 2, 3, 5, 7, 8, 10]; // A minor (relative)
const TONIC_PCS = [0, 5, 7]; // 1, 4, 5 degrees (tonic / subdominant / dominant) — emphasized

export interface PitchViewProps {
  notes: NoteEvent[];
  keyName: string;
  mode: 'major' | 'minor';
  width?: number;
  height?: number;
}

const KEY_PC_OFFSET: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
};

export function PitchView({ notes, keyName, mode, width = 400, height = 100 }: PitchViewProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || notes.length === 0) return;
    const canvas = ref.current;
    const c2d = canvas.getContext('2d');
    if (!c2d) return;
    c2d.clearRect(0, 0, width, height);

    const keyOffset = KEY_PC_OFFSET[keyName] ?? 0;
    const scalePcs = (mode === 'major' ? MAJOR_SCALE_PCS : MINOR_SCALE_PCS).map((p) => (p + keyOffset) % 12);
    const tonicSet = new Set(TONIC_PCS.map((p) => (p + keyOffset) % 12));

    const minMidi = 48; // C3
    const maxMidi = 84; // C6
    const midiRange = maxMidi - minMidi;

    for (const n of notes) {
      const pc = n.pitch % 12;
      const isInScale = scalePcs.includes(pc);
      const isTonic = tonicSet.has(pc);

      let color: string;
      if (isTonic) color = '#fbbf24'; // amber-400 (tonic emphasis)
      else if (isInScale) color = '#10b981'; // emerald-500 (in-scale)
      else color = '#f87171'; // red-400 (out-of-scale)

      const x = Math.max(0, Math.min(width, n.onset * 100)); // 100px per second (rough)
      const y = height - ((n.pitch - minMidi) / midiRange) * height;
      const r = isTonic ? 6 : 4;

      c2d.fillStyle = color;
      c2d.beginPath();
      c2d.arc(x, y, r, 0, Math.PI * 2);
      c2d.fill();
    }
  }, [notes, keyName, mode, width, height]);

  if (notes.length === 0) return null;
  return <canvas ref={ref} width={width} height={height} className="bg-zinc-900 rounded" />;
}
