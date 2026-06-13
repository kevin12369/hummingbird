import { Mp3Encoder } from '@breezystack/lamejs';
import { encodeWav } from './encode-wav';

export type Mp3Bitrate = 64 | 96 | 128;

export async function encodeMp3Core(
  stereoPcm: Float32Array[],
  kbps: Mp3Bitrate,
): Promise<Uint8Array> {
  const [left, right] = stereoPcm;
  if (!left || !right) throw new Error('encodeMp3Core: need stereo input');

  // Float32 → Int16
  const leftInt16 = floatToInt16(left);
  const rightInt16 = floatToInt16(right);

  const encoder = new Mp3Encoder(2, 44100, kbps);
  const chunkSize = 1152;
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < leftInt16.length; i += chunkSize) {
    const leftChunk = leftInt16.subarray(i, i + chunkSize);
    const rightChunk = rightInt16.subarray(i, i + chunkSize);
    const encoded = encoder.encodeBuffer(leftChunk, rightChunk);
    if (encoded.length > 0) chunks.push(encoded);
  }

  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(tail);

  // 拼接
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const v = Math.max(-1, Math.min(1, input[i] ?? 0));
    out[i] = v * 0x7FFF;
  }
  return out;
}

export type EncodeResult = { format: 'mp3' | 'wav'; bytes: Uint8Array };

export async function encodeMp3CoreWithFallback(
  stereoPcm: Float32Array[],
  kbps: Mp3Bitrate,
): Promise<EncodeResult> {
  try {
    const bytes = await encodeMp3Core(stereoPcm, kbps);
    return { format: 'mp3', bytes };
  } catch (e) {
    // 任意异常降级到 WAV
    return { format: 'wav', bytes: encodeWav(stereoPcm) };
  }
}
