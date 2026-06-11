import type { NoteEvent } from './types';

// Note: @spotify/basic-pitch is browser-only (uses TensorFlow.js + ONNX runtime).
// We dynamically import it so SSR/build doesn't try to load it server-side.
// v1.0.1 API: BasicPitch(model) -> evaluateModel(buffer, onComplete, percentCallback)
//   onComplete(frames, onsets, contours) where frames/onsets/contours are number[][].
//   outputToNotesPoly(frames, onsets) -> NoteEvent[] (frame-based, 88 pitch bins).
//   noteFramesToTime(notes) -> NoteEventTime[] (with startTimeSeconds, durationSeconds).
let cachedModel: any = null;

async function getModel() {
  if (cachedModel) return cachedModel;
  const { BasicPitch } = await import('@spotify/basic-pitch');
  // The default Basic Pitch model is hosted by the library. Passing a model instance
  // is the v1.0.1 contract; the library will lazy-load TF.js and the model weights.
  // The empty path string tells BasicPitch to use its built-in default.
  cachedModel = new BasicPitch('');
  return cachedModel;
}

async function decodeAudio(blob: Blob): Promise<AudioBuffer> {
  const AudioContextClass = (globalThis as any).AudioContext ?? (globalThis as any).webkitAudioContext;
  if (!AudioContextClass) throw new Error('AudioContext not available');
  const ctx = new AudioContextClass();
  const arrayBuffer = await blob.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

function pickChannel(audioBuffer: AudioBuffer): Float32Array {
  // Mono: use channel 0. Stereo: downmix to mono by averaging.
  const channels = audioBuffer.numberOfChannels;
  if (channels === 1) return audioBuffer.getChannelData(0);
  const len = audioBuffer.length;
  const out = new Float32Array(len);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < len; i++) out[i] = (out[i] ?? 0) + (data[i] ?? 0) / channels;
  }
  return out;
}

export async function transcribeAudio(blob: Blob): Promise<NoteEvent[]> {
  const audioBuffer = await decodeAudio(blob);
  const audioData = pickChannel(audioBuffer);
  const model = await getModel();
  const { outputToNotesPoly, noteFramesToTime } = await import('@spotify/basic-pitch');

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  // v1.0.1 evaluateModel(buffer, onComplete, percentCallback)
  await (model as any).evaluateModel(
    audioData,
    (f: number[][], o: number[][], c: number[][]) => {
      for (const row of f) frames.push(row);
      for (const row of o) onsets.push(row);
      for (const row of c) contours.push(row);
    },
    () => {},
  );

  const noteEvents = outputToNotesPoly(frames, onsets);
  const noteTimes = noteFramesToTime(noteEvents as any);

  return noteTimes.map((n: any) => ({
    pitch: n.pitchMidi,
    onset: n.startTimeSeconds,
    duration: n.durationSeconds,
    velocity: n.amplitude,
  }));
}
