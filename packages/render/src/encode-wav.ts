const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 2;

export function encodeWav(stereoPcm: Float32Array[]): Uint8Array {
  const [left, right] = stereoPcm;
  if (!left || !right) throw new Error('encodeWav: need stereo input');
  const length = left.length;
  const dataLength = length * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);            // chunk size
  view.setUint16(20, 1, true);             // PCM format
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), true);  // byte rate
  view.setUint16(32, NUM_CHANNELS * (BITS_PER_SAMPLE / 8), true);  // block align
  view.setUint16(34, BITS_PER_SAMPLE, true);
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // PCM data (interleaved 16-bit)
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const l = Math.max(-1, Math.min(1, left[i] ?? 0));
    const r = Math.max(-1, Math.min(1, right[i] ?? 0));
    view.setInt16(offset, l * 0x7FFF, true);
    offset += 2;
    view.setInt16(offset, r * 0x7FFF, true);
    offset += 2;
  }

  return bytes;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
