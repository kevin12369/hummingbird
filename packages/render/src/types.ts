// 12 风格枚举(单一来源)
export type StyleId =
  | 'pop' | 'lofi' | 'indie-pop' | 'trap' | 'drill' | 'kpop'
  | 'city-pop' | 'house' | 'future-bass' | 'ambient' | 'rnb' | 'jazz';

// 单轨 MIDI 描述
export interface MidiLayer {
  program: number;       // GM program number 0-127
  octave: number;        // octave shift
  pan: number;           // -1 to 1
  velocity: number;      // 0 to 1
}

// 单轨可包含多个 layer(为 K-Pop 5/9 延伸、Future Bass 双 lead)
export interface TrackPreset {
  layers: MidiLayer[];
  drumMap?: 'standard' | 'brush' | 'half-time' | 'triplet' | '4-on-floor' | 'half-trap' | 'funk' | 'soft-kit';
  bpmRange: [number, number];
}

// 单个风格 preset
export interface StylePreset {
  id: StyleId;
  name: string;          // 英文
  nameZh: string;        // 中文
  melody: TrackPreset;
  harmony: TrackPreset;
  bass: TrackPreset;
  drums: TrackPreset;
  fx: StyleFxMap;
}

export interface StyleFxMap {
  reverbSendDb: number;        // -60 to 0
  lowpassCutoffHz: number;     // 200 to 20000
  swingPercent: number;        // 0 to 100
  sidechainDb: number | null;  // null = no sidechain
  vinylNoise: boolean;
  halfTimeClosedHat: boolean;
  sliding808: boolean;
  longReverb: boolean;
  slapArticulation: boolean;
  supersawLayer: boolean;
  highFreqShimmer: boolean;
  brightStab: boolean;
}

export interface RenderError {
  code: 'CORS' | 'NETWORK' | 'OAC_UNSUPPORTED' | 'TIMEOUT' | 'OOM' | 'WORKER_CRASHED' | 'MP3_FAILED' | 'UNKNOWN';
  message: string;
  recoverable: boolean;
  fallbackChain: ('wav' | 'stems' | 'try-sample' | 'none')[];
}

export interface Capabilities {
  offlineAudioContext: boolean;
  audioWorklet: boolean;
  webAssemblyStreaming: boolean;
  crossOriginIsolated: boolean;
  sharedArrayBuffer: boolean;
  indexedDb: boolean;
  webWorkerModule: boolean;
  lamejsLoadable: boolean;
  webmOpus: boolean;  // for iOS 16- fallback
}