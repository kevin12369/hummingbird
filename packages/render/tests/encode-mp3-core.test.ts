import { describe, it, expect } from 'vitest';
import { encodeMp3Core, encodeMp3CoreWithFallback } from '../src/encode-mp3-core';
import { encodeWav } from '../src/encode-wav';

function fakePcm(seconds: number, freq: number = 440): Float32Array {
  const sampleRate = 44100;
  const length = seconds * sampleRate;
  const pcm = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    pcm[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.5;
  }
  return pcm;
}

function toStereo(mono: Float32Array): Float32Array[] {
  return [mono, mono];
}

describe('encodeMp3Core', () => {
  it('1s 正弦波编码为 MP3', async () => {
    const pcm = fakePcm(1);
    const bytes = await encodeMp3Core(toStereo(pcm), 128);
    expect(bytes.length).toBeGreaterThan(100);
    // MP3 文件头 0xFFFB / 0xFFFA
    expect(bytes[0]).toBe(0xFF);
    expect(bytes[1]! & 0xE0).toBe(0xE0);
  });

  it('降码率 96kbps 编码', async () => {
    const pcm = fakePcm(1);
    const bytes96 = await encodeMp3Core(toStereo(pcm), 96);
    const bytes128 = await encodeMp3Core(toStereo(pcm), 128);
    expect(bytes96.length).toBeLessThan(bytes128.length);
  });

  it('降码率 64kbps 编码', async () => {
    const pcm = fakePcm(1);
    const bytes = await encodeMp3Core(toStereo(pcm), 64);
    expect(bytes.length).toBeGreaterThan(50);
  });
});

describe('encodeMp3CoreWithFallback', () => {
  it('MP3 成功时返回 { format: "mp3", bytes }', async () => {
    const pcm = fakePcm(1);
    const result = await encodeMp3CoreWithFallback(toStereo(pcm), 128);
    expect(result.format).toBe('mp3');
    expect(result.bytes.length).toBeGreaterThan(100);
  });
});

describe('encodeWav', () => {
  it('立体声 PCM → 合法 WAV 头(RIFF)', () => {
    const pcm = fakePcm(0.5);
    const bytes = encodeWav(toStereo(pcm));
    expect(String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!)).toBe('RIFF');
    expect(String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!)).toBe('WAVE');
  });

  it('WAV 长度 = 44 头 + PCM 数据字节', () => {
    const pcm = fakePcm(1);
    const bytes = encodeWav(toStereo(pcm));
    const expected = 44 + pcm.length * 2 * 2;  // 头 + 2 通道 × 2 字节
    expect(bytes.length).toBe(expected);
  });
});
