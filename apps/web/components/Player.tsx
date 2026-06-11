import { useState, useRef } from 'react';
import { Midi } from '@tonejs/midi';

export interface PlayerProps {
  midi: Uint8Array | null;
  bpm: number;
}

export function Player({ midi, bpm }: PlayerProps) {
  const [playing, setPlaying] = useState(false);
  const synthsRef = useRef<any[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  async function start() {
    if (!midi) return;
    setPlaying(true);
    // Lazy import tone (client-side only, ~500KB)
    const toneModule = await import('tone');
    await toneModule.start();
    const parsed = new Midi(midi);
    parsed.header.setTempo(bpm);
    const tracks = parsed.tracks.filter((t) => t.channel !== 9); // exclude drums for now
    synthsRef.current = tracks.map(() => new toneModule.PolySynth(toneModule.Synth).toDestination());
    const tempoBpm = parsed.header.tempos[0]?.bpm ?? bpm;
    const secondsPerBeat = 60 / tempoBpm;
    let absoluteTime = 0;
    for (const t of tracks) {
      for (const note of t.notes) {
        const noteName = toneModule.Frequency(note.midi, 'midi').toNote();
        const delayMs = absoluteTime * 1000;
        timeoutsRef.current.push(setTimeout(() => {
          const synth = synthsRef.current[0];
          if (synth) synth.triggerAttackRelease(noteName, note.duration, undefined, note.velocity);
        }, delayMs));
        absoluteTime += note.duration;
      }
    }
    const totalMs = absoluteTime * 1000 + 500;
    timeoutsRef.current.push(setTimeout(() => setPlaying(false), totalMs));
  }

  function stop() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    synthsRef.current.forEach((s) => s.dispose());
    synthsRef.current = [];
    setPlaying(false);
  }

  if (!midi) return null;
  return (
    <div className="flex gap-2">
      <button type="button" onClick={start} disabled={playing} className="rounded bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 disabled:opacity-50">
        Play 4 tracks
      </button>
      <button type="button" onClick={stop} disabled={!playing} className="rounded bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 disabled:opacity-50">
        Stop
      </button>
    </div>
  );
}
