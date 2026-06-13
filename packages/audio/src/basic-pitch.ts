import type { NoteEvent } from './types';

// Note: @spotify/basic-pitch is browser-only (uses TensorFlow.js + ONNX runtime).
// We dynamically import it so SSR/build doesn't try to load it server-side.
// v1.0.1 API: BasicPitch(model) -> evaluateModel(buffer, onComplete, percentCallback)
//   onComplete(frames, onsets, contours) where frames/onsets/contours are number[][].
//   outputToNotesPoly(frames, onsets) -> NoteEvent[] (frame-based, 88 pitch bins).
//   noteFramesToTime(notes) -> NoteEventTime[] (with startTimeSeconds, durationSeconds).
let cachedModel: any = null;

// BasicPitch v1.0.1 requires a URL pointing to a TF.js graph-model.json.
// We copy the bundled model (node_modules/@spotify/basic-pitch/model/) into
// apps/web/public/basic-pitch/ at build time so it's served by Next.js's
// static export at the same path on GitHub Pages.
// Passing '' would cause tf.loadGraphModel('') to throw
// "URL path for http must not be null, undefined or empty".
//
// The host app may override the URL at startup via setBasicPitchModelUrl(),
// e.g. when Next.js's basePath puts the site under a sub-path like
// /hummingbird/. Default is a relative '/basic-pitch/model.json' which is
// resolved against the document origin (suitable for root-deployed apps).
let modelUrl = '/basic-pitch/model.json';

export function setBasicPitchModelUrl(url: string): void {
  modelUrl = url;
  cachedModel = null; // invalidate cache so next call rebuilds with new URL
}

async function getModel() {
  if (cachedModel) return cachedModel;
  const { BasicPitch } = await import('@spotify/basic-pitch');
  cachedModel = new BasicPitch(modelUrl);
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
