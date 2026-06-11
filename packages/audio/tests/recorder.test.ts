import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startRecording, stopRecording, isRecordingSupported } from '../src/recorder';

describe('recorder', () => {
  beforeEach(() => {
    // Mock MediaRecorder with isTypeSupported static + instance methods
    const mockRecorder = {
      start: vi.fn(function (this: any) { this.state = 'recording'; }),
      stop: vi.fn(),
      ondataavailable: null as any,
      onstop: null as any,
      onerror: null as any,
      state: 'inactive' as 'inactive' | 'recording' | 'paused',
    };
    const MediaRecorderMock = vi.fn().mockImplementation(() => mockRecorder) as any;
    MediaRecorderMock.isTypeSupported = vi.fn().mockReturnValue(false);
    (globalThis as any).MediaRecorder = MediaRecorderMock;
  });

  afterEach(() => {
    delete (globalThis as any).MediaRecorder;
  });

  function setNavigator(value: any) {
    Object.defineProperty(globalThis, 'navigator', { value, configurable: true, writable: true });
  }

  function mockStream() {
    return { getTracks: () => [{ stop: vi.fn() }] };
  }

  // Helper: trigger onstop on the most-recently-constructed mock recorder
  function triggerStop(dataChunks: Blob[] = [new Blob(['x'])]) {
    const rec = (globalThis as any).MediaRecorder.mock.results[0].value;
    for (const d of dataChunks) rec.ondataavailable({ data: d });
    rec.onstop();
  }

  it('isRecordingSupported returns true when MediaRecorder exists', () => {
    expect(isRecordingSupported()).toBe(true);
  });

  it('isRecordingSupported returns false when MediaRecorder missing', () => {
    delete (globalThis as any).MediaRecorder;
    expect(isRecordingSupported()).toBe(false);
  });

  it('startRecording requests microphone permission and starts MediaRecorder', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream());
    setNavigator({ mediaDevices: { getUserMedia: mockGetUserMedia } });
    const blobP = startRecording({ maxDurationMs: 30000 });
    // Trigger stop immediately so the promise resolves
    setTimeout(() => triggerStop(), 0);
    await blobP;
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('startRecording throws when MediaRecorder is not supported', async () => {
    delete (globalThis as any).MediaRecorder;
    await expect(startRecording({ maxDurationMs: 30000 })).rejects.toThrow(/not supported/i);
  });

  it('startRecording resolves with the recorded Blob', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream());
    setNavigator({ mediaDevices: { getUserMedia: mockGetUserMedia } });
    const recording = startRecording({ maxDurationMs: 30000 });
    setTimeout(() => triggerStop([new Blob(['x'])]), 0);
    const blob = await recording;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('rejects with error message on MediaRecorder error', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream());
    setNavigator({ mediaDevices: { getUserMedia: mockGetUserMedia } });
    const recording = startRecording({ maxDurationMs: 30000 });
    setTimeout(() => {
      const rec = (globalThis as any).MediaRecorder.mock.results[0].value;
      rec.onerror({ error: { message: 'mic denied' } });
    }, 0);
    await expect(recording).rejects.toThrow(/mic denied/);
  });

  it('auto-stops after maxDurationMs', async () => {
    vi.useFakeTimers();
    try {
      const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream());
      setNavigator({ mediaDevices: { getUserMedia: mockGetUserMedia } });
      const mockStop = vi.fn();
      const MediaRecorderCtor = (globalThis as any).MediaRecorder;
      const origImpl = MediaRecorderCtor.getMockImplementation();
      MediaRecorderCtor.mockImplementation(() => {
        const r = origImpl();
        r.stop = mockStop;
        return r;
      });
      const recording = startRecording({ maxDurationMs: 1000 });
      // Drain microtasks so the getUserMedia promise resolves and recorder is created
      await vi.advanceTimersByTimeAsync(0);
      // Advance past maxDurationMs to trigger the auto-stop setTimeout
      await vi.advanceTimersByTimeAsync(1100);
      expect(mockStop).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
