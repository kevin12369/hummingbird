import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DownloadButtons } from './DownloadButtons';
import * as renderClient from '../lib/render-client';

vi.mock('../lib/render-client', async () => {
  const actual = await vi.importActual<typeof import('../lib/render-client')>('../lib/render-client');
  return {
    ...actual,
    downloadBytes: vi.fn(),
    startRender: vi.fn(),
  };
});

import type { StylePreset } from '@hummingbird/render';

const fakePreset: StylePreset = {
  id: 'pop',
  name: 'Pop',
  nameZh: '流行',
  melody: { layers: [], bpmRange: [95, 128] },
  harmony: { layers: [], bpmRange: [95, 128] },
  bass: { layers: [], bpmRange: [95, 128] },
  drums: { layers: [], bpmRange: [95, 128], drumMap: 'standard' },
  fx: { reverbSendDb: -20, lowpassCutoffHz: 18000, swingPercent: 0, sidechainDb: null, vinylNoise: false, halfTimeClosedHat: false, sliding808: false, longReverb: false, slapArticulation: false, supersawLayer: false, highFreqShimmer: false, brightStab: false },
};

describe('DownloadButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染 2 个主按钮', () => {
    render(<DownloadButtons tracks={{ melody: null, chords: null, bass: null, drums: null }} preset={fakePreset} durationSec={30} capabilities={{ offlineAudioContext: true }} />);
    expect(screen.getByTestId('download-mp3')).toBeTruthy();
    expect(screen.getByTestId('download-stems')).toBeTruthy();
  });

  it('OAC 不支持时 MP3 按钮 disabled', () => {
    render(<DownloadButtons tracks={{ melody: null, chords: null, bass: null, drums: null }} preset={fakePreset} durationSec={30} capabilities={{ offlineAudioContext: false }} />);
    expect((screen.getByTestId('download-mp3') as HTMLButtonElement).disabled).toBe(true);
  });

  it('点击 stems 按钮调用 downloadBytes 4 次', () => {
    const downloadBytes = vi.mocked(renderClient.downloadBytes);
    render(<DownloadButtons tracks={{ melody: { toArray: () => new Uint8Array([1]) }, chords: { toArray: () => new Uint8Array([2]) }, bass: { toArray: () => new Uint8Array([3]) }, drums: { toArray: () => new Uint8Array([4]) } }} preset={fakePreset} durationSec={30} capabilities={{ offlineAudioContext: true }} />);
    fireEvent.click(screen.getByTestId('download-stems'));
    expect(downloadBytes).toHaveBeenCalledTimes(4);
  });
});
