import type { Midi } from '@tonejs/midi';
import type { StylePreset } from './types';

const SAMPLE_RATE = 44100;

export interface RenderInput {
  melody: Midi;
  chords: Midi;
  bass: Midi;
  drums: Midi;
}

export async function renderCore(
  tracks: RenderInput,
  preset: StylePreset,
  durationSec: number,
): Promise<AudioBuffer> {
  const length = Math.ceil(durationSec * SAMPLE_RATE);
  const oac = new OfflineAudioContext({
    numberOfChannels: 2,
    length,
    sampleRate: SAMPLE_RATE,
  });

  // Master gain
  const master = oac.createGain();
  master.gain.value = 0.8;
  master.connect(oac.destination);

  // 4 轨调度(简化:用纯函数合成,后续会接 webaudiofont 音色)
  scheduleTrack(oac, tracks.melody,  preset.melody,  master, 0.0);
  scheduleTrack(oac, tracks.chords,  preset.harmony, master, 0.0);
  scheduleTrack(oac, tracks.bass,    preset.bass,    master, 0.0);
  scheduleTrack(oac, tracks.drums,   preset.drums,   master, 0.0);

  // FX chain:lowpass(rewire master)
  const lowpass = oac.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = preset.fx.lowpassCutoffHz;
  master.disconnect();
  master.connect(lowpass);
  lowpass.connect(oac.destination);
  // FX chain:long reverb (feedback loop after lowpass)
  if (preset.fx.longReverb) {
    const delay = oac.createDelay(6);
    delay.delayTime.value = 0.05;
    const sendGain = oac.createGain();
    sendGain.gain.value = 0.3;
    lowpass.connect(sendGain).connect(delay);
    delay.connect(lowpass);
  }

  return await oac.startRendering();
}

function scheduleTrack(
  oac: OfflineAudioContext,
  midi: Midi,
  preset: { layers: { program: number; octave: number; pan: number; velocity: number }[]; drumMap?: string },
  dest: AudioNode,
  startTime: number,
): void {
  const track = midi.tracks[0];
  if (!track) return;

  for (const note of track.notes) {
    for (const layer of preset.layers) {
      const osc = oac.createOscillator();
      osc.frequency.value = 440 * Math.pow(2, (note.midi - 69 + layer.octave * 12) / 12);
      osc.type = layer.program === 81 ? 'sawtooth' : 'sine';
      const gain = oac.createGain();
      gain.gain.value = note.velocity * layer.velocity * 0.2;
      const pan = oac.createStereoPanner();
      pan.pan.value = layer.pan;
      osc.connect(gain).connect(pan).connect(dest);
      osc.start(startTime + note.time);
      osc.stop(startTime + note.time + note.duration);
    }
  }
}
