import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribeAudio } from '../src/basic-pitch';

describe('transcribeAudio', () => {
  beforeEach(() => {
    // Mock @spotify/basic-pitch module
    vi.doMock('@spotify/basic-pitch', () => ({
      BasicPitch: class {
        model = Promise.resolve({} as any);
        constructor(_model: any) {}
        async evaluateModel(
          _buffer: any,
          onComplete: (frames: number[][], onsets: number[][], contours: number[][]) => void,
        ) {
          onComplete(
            [
              new Array(88).fill(0).map((_, i) => (i === 57 ? 1 : 0)),
              new Array(88).fill(0).map((_, i) => (i === 59 ? 1 : 0)),
              new Array(88).fill(0).map((_, i) => (i === 57 ? 1 : 0)),
            ],
            [[1], [0], [1]],
            [[0.8], [0.7], [0.6]],
          );
        }
      },
      outputToNotesPoly: (_frames: number[][], _onsets: number[][]) => [
        { startFrame: 0, durationFrames: 1, pitchMidi: 69, amplitude: 0.8 },
        { startFrame: 1, durationFrames: 1, pitchMidi: 71, amplitude: 0.7 },
        { startFrame: 2, durationFrames: 1, pitchMidi: 69, amplitude: 0.6 },
      ],
      noteFramesToTime: (notes: any[]) =>
        notes.map((n) => ({
          startTimeSeconds: n.startFrame * 0.1,
          durationSeconds: n.durationFrames * 0.1,
          pitchMidi: n.pitchMidi,
          amplitude: n.amplitude,
        })),
    }));

    // Mock AudioContext
    const mockDecode = vi.fn().mockResolvedValue({
      length: 44100,
      sampleRate: 44100,
      numberOfChannels: 1,
      getChannelData: () => new Float32Array(44100),
    });
    const AudioContextMock = class {
      decodeAudioData = mockDecode;
      close = vi.fn();
    };
    (globalThis as any).AudioContext = AudioContextMock;
    (globalThis as any).webkitAudioContext = AudioContextMock;
  });

  it('returns NoteEvent[] from audio blob', async () => {
    const blob = new Blob(['fake audio'], { type: 'audio/webm' });
    const notes = await transcribeAudio(blob);
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBe(3);
  });

  it('NoteEvent has pitch (MIDI 0-127), onset (s), duration (s), velocity (0-1)', async () => {
    const blob = new Blob(['fake'], { type: 'audio/webm' });
    const notes = await transcribeAudio(blob);
    expect(notes.length).toBeGreaterThan(0);
    const n = notes[0]!;
    expect(typeof n.pitch).toBe('number');
    expect(n.pitch).toBeGreaterThanOrEqual(0);
    expect(n.pitch).toBeLessThanOrEqual(127);
    expect(typeof n.onset).toBe('number');
    expect(typeof n.duration).toBe('number');
    expect(typeof n.velocity).toBe('number');
    expect(n.velocity).toBeGreaterThanOrEqual(0);
    expect(n.velocity).toBeLessThanOrEqual(1);
  });

  it('decodes audio blob to AudioBuffer first', async () => {
    const mockDecode = vi.fn().mockResolvedValue({
      length: 44100,
      sampleRate: 44100,
      numberOfChannels: 1,
      getChannelData: () => new Float32Array(44100),
    });
    (globalThis as any).AudioContext = class {
      decodeAudioData = mockDecode;
      close = vi.fn();
    };
    const blob = new Blob(['fake'], { type: 'audio/webm' });
    await transcribeAudio(blob);
    expect(mockDecode).toHaveBeenCalled();
  });
});
