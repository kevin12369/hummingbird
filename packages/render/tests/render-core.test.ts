import { describe, it, expect, beforeAll } from 'vitest';
// Side-effect import installs OfflineAudioContext / AudioBuffer / OscillatorNode etc. on globalThis
import 'web-audio-api/polyfill';

import { renderCore } from '../src/render-core';
import type { StylePreset } from '../src/types';

const fakeTracks = {
  melody:  { header: { ppq: 480, secondsToTicks: (s: number) => s * 480 * 2 }, tracks: [{ notes: [{ midi: 60, time: 0, duration: 0.5, velocity: 0.7 }] }] },
  chords:  { header: { ppq: 480, secondsToTicks: (s: number) => s * 480 * 2 }, tracks: [{ notes: [] }] },
  bass:    { header: { ppq: 480, secondsToTicks: (s: number) => s * 480 * 2 }, tracks: [{ notes: [] }] },
  drums:   { header: { ppq: 480, secondsToTicks: (s: number) => s * 480 * 2 }, tracks: [{ notes: [] }] },
};

const fakePreset: StylePreset = {
  id: 'pop',
  name: 'Pop',
  nameZh: '流行',
  melody: { layers: [{ program: 81, octave: 0, pan: 0, velocity: 0.7 }], bpmRange: [95, 128] },
  harmony: { layers: [{ program: 5, octave: 0, pan: 0, velocity: 0.6 }], bpmRange: [95, 128] },
  bass: { layers: [{ program: 38, octave: 0, pan: 0, velocity: 0.7 }], bpmRange: [95, 128] },
  drums: { layers: [{ program: 0, octave: 0, pan: 0, velocity: 0.8 }], bpmRange: [95, 128], drumMap: 'standard' },
  fx: {
    reverbSendDb: -20, lowpassCutoffHz: 18000, swingPercent: 0,
    sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false,
    sliding808: false, longReverb: false, slapArticulation: false,
    supersawLayer: false, highFreqShimmer: false, brightStab: false,
  },
};

describe('renderCore', () => {
  it('返回 AudioBuffer(30s 立体声 44100)', async () => {
    const buf = await renderCore(fakeTracks as any, fakePreset, 30);
    expect(buf.numberOfChannels).toBe(2);
    expect(buf.sampleRate).toBe(44100);
    expect(buf.duration).toBeCloseTo(30, 0);
  });

  it('空 tracks 也返回合法 buffer', async () => {
    const emptyTracks = {
      melody: { ...fakeTracks.melody, tracks: [{ notes: [] }] },
      chords: fakeTracks.chords,
      bass: fakeTracks.bass,
      drums: fakeTracks.drums,
    };
    const buf = await renderCore(emptyTracks as any, fakePreset, 5);
    expect(buf.numberOfChannels).toBe(2);
  });

  it('duration 自定义', async () => {
    const buf = await renderCore(fakeTracks as any, fakePreset, 10);
    expect(buf.duration).toBeCloseTo(10, 0);
  });
});
