import { Midi } from '@tonejs/midi';
import type { NoteEvent, Arrangement } from './types';

const GM_DRUM_MAP: Record<number, number> = {
  1: 36,  // kick (bass drum 1)
  2: 38,  // snare
  3: 42,  // closed hi-hat
};

const NOTE_NAME_TO_MIDI: Record<string, number> = {};
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
for (let octave = -1; octave <= 9; octave++) {
  for (let i = 0; i < 12; i++) {
    const name = `${NOTE_NAMES[i]}${octave}`;
    const midi = (octave + 1) * 12 + i;
    NOTE_NAME_TO_MIDI[name] = midi;
  }
}

function parseNoteName(name: string): number {
  return NOTE_NAME_TO_MIDI[name] ?? 60; // default to C4
}

function velocityToMidi(v: number): number {
  return Math.max(1, Math.min(127, Math.round(v * 127)));
}

export async function assembleMidi(input: { notes: NoteEvent[]; arrangement: Arrangement }): Promise<Uint8Array> {
  const { notes, arrangement } = input;
  const midi = new Midi();
  midi.header.setTempo(arrangement.bpm);
  // 4/4 time, 4 quarter notes per bar
  midi.header.timeSignatures = [{ ticks: 0, timeSignature: [4, 4] }];

  // Track 0: melody
  const melodyTrack = midi.addTrack();
  melodyTrack.name = 'melody';
  for (const n of notes) {
    const ticksOnset = Math.round(midi.header.secondsToTicks(n.onset));
    const ticksDuration = Math.round(midi.header.secondsToTicks(n.duration));
    melodyTrack.addNote({
      midi: n.pitch,
      time: ticksOnset / midi.header.ppq,
      duration: ticksDuration / midi.header.ppq,
      velocity: velocityToMidi(n.velocity) / 127,
    });
  }

  // Track 1: chords (4 chords, 1 per bar)
  const chordTrack = midi.addTrack();
  chordTrack.name = 'chords';
  const beatsPerChord = 4;
  const secondsPerBeat = 60 / arrangement.bpm;
  // Map Roman numerals to notes for C major; the actual mapping requires the key,
  // but for now we use the bass line notes as chord roots
  for (let i = 0; i < arrangement.chordProgression.length; i++) {
    const rootNote = parseNoteName(arrangement.bassLine[i] ?? 'C2');
    // Major triad by default; for 'm' or '7' or 'maj7' etc, we'd need the key, simplified here
    const chord = [rootNote, rootNote + 4, rootNote + 7];
    chordTrack.addNote({
      midi: chord[0]!,
      time: i * beatsPerChord * secondsPerBeat,
      duration: beatsPerChord * secondsPerBeat,
      velocity: 0.6,
    });
    chordTrack.addNote({
      midi: chord[1]!,
      time: i * beatsPerChord * secondsPerBeat,
      duration: beatsPerChord * secondsPerBeat,
      velocity: 0.6,
    });
    chordTrack.addNote({
      midi: chord[2]!,
      time: i * beatsPerChord * secondsPerBeat,
      duration: beatsPerChord * secondsPerBeat,
      velocity: 0.6,
    });
  }

  // Track 2: bass (8 notes, 8th notes over 4 bars = 32 eighth notes; we have 8)
  const bassTrack = midi.addTrack();
  bassTrack.name = 'bass';
  for (let i = 0; i < arrangement.bassLine.length; i++) {
    const rootNote = parseNoteName(arrangement.bassLine[i]!);
    bassTrack.addNote({
      midi: rootNote,
      time: i * (beatsPerChord / 2) * secondsPerBeat,
      duration: (beatsPerChord / 2) * secondsPerBeat * 0.9,
      velocity: 0.8,
    });
  }

  // Track 3: drums (16 steps, each step = 1/4 note, total 4 bars)
  const drumTrack = midi.addTrack();
  drumTrack.name = 'drums';
  drumTrack.channel = 9; // GM drum channel
  for (let i = 0; i < arrangement.drumPattern.length; i++) {
    const code = arrangement.drumPattern[i]!;
    if (code === 0) continue;
    const gmMidi = GM_DRUM_MAP[code] ?? 36;
    drumTrack.addNote({
      midi: gmMidi,
      time: i * secondsPerBeat,
      duration: secondsPerBeat * 0.5,
      velocity: 0.7,
    });
  }

  return midi.toArray();
}
