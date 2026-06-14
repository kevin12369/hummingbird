import { useReducer, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Recorder } from '../components/Recorder';
import { WaveformView } from '../components/WaveformView';
import { KeyDisplay } from '../components/KeyDisplay';
import { Player } from '../components/Player';
import { DownloadMidi } from '../components/DownloadMidi';
import { SettingsModal } from '../components/SettingsModal';
import { StyleSelector } from '../components/StyleSelector';
import { DownloadButtons } from '../components/DownloadButtons';
import { LyricsPanel } from '../components/LyricsPanel';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { PitchView } from '../components/PitchView';
import { Toast } from '../components/Toast';
import { Hero } from '../components/Hero';
import { StatusBadges } from '../components/StatusBadges';
import { StyleCarousel } from '../components/StyleCarousel';
import { HowItWorks } from '../components/HowItWorks';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../lib/theme';
import {
  initialState,
  reducer,
  type Event,
} from '../lib/state-machine';
import { loadSettings, saveSettings } from '../lib/settings';
import {
  transcribeAudio,
  detectKey,
  setBasicPitchModelUrl,
  type NoteEvent,
  type Key,
  type Mode,
  type KeyDetection,
} from '@hummingbird/audio';
import { Midi } from '@tonejs/midi';
import { fallbackArrange, type StyleId, getPreset } from '@hummingbird/render';
import type { LyricsOutput, Locale as LyricsLocale } from '@hummingbird/lyrics';
import { getLyricsPrompt, generateLyrics } from '@hummingbird/lyrics';
import type { FeedbackOutput } from '@hummingbird/feedback';
import { buildFeedbackPrompt, generateFeedback } from '@hummingbird/feedback';

// BasicPitch model lives under the Next.js basePath on GitHub Pages.
if (typeof window !== 'undefined') {
  setBasicPitchModelUrl('/hummingbird/basic-pitch/model.json');
}

const RENDER_DURATION_SEC = 30;

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [lyricsLocale, setLyricsLocale] = useState<LyricsLocale>('zh');
  const [lyrics, setLyrics] = useState<LyricsOutput | null>(null);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackOutput | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [autoFeedback, setAutoFeedback] = useState(() => loadSettings().autoFeedback);
  const [caps, setCaps] = useState<{ offlineAudioContext: boolean } | null>(null);
  const { toasts, showToast, dismiss } = useToast();

  // Lazily detect OfflineAudioContext capability for the Download MP3 button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCaps({ offlineAudioContext: typeof (window as any).OfflineAudioContext !== 'undefined' });
  }, []);

  // Style is the active StyleId; only meaningful when main.stage === 'arranging' or 'ready'.
  // Default to 'pop' until the user starts arranging.
  const style: StyleId = state.main.stage === 'arranging' || state.main.stage === 'ready'
    ? state.main.style
    : 'pop';

  const input = state.main.stage === 'arranging' || state.main.stage === 'ready'
    ? state.main.input
    : null;

  // Derive a small preview of the audio blob for the waveform view
  const audioBlob: Blob | null = useMemo(() => {
    if (!input) return null;
    return input.audioBlob;
  }, [input]);

  // Derive key/mode/bpm/notes from the input's key detection (for KeyDisplay + Playback).
  // The new state machine does not carry these as top-level fields; we keep them in input.key.
  const keyInfo: KeyDetection | null = input?.key ?? null;

  function dispatchEvent(ev: Event) {
    dispatch(ev);
  }

  async function handleGetFeedback() {
    if (state.main.stage !== 'ready' || !keyInfo) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
      const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
      const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
      const prompt = buildFeedbackPrompt({
        notesSummary: `${input?.notes.length ?? 0} notes`,
        key: keyInfo.key,
        mode: keyInfo.mode,
        bpm,
        style,
      });
      const r = await generateFeedback({ prompt, model: llmProvider, localBaseUrl: llmBaseUrl, localModel: llmModel });
      if (!r.ok || !r.feedback) {
        const msg = r.error ?? 'Feedback failed';
        setFeedbackError(msg);
        showToast({ severity: 'error', message: msg });
        return;
      }
      setFeedback(r.feedback);
    } catch (e) {
      const msg = (e as Error).message;
      setFeedbackError(msg);
      showToast({ severity: 'error', message: msg });
    } finally {
      setFeedbackLoading(false);
    }
  }

  // Auto-trigger feedback after a successful arrangement
  useEffect(() => {
    if (autoFeedback && state.main.stage === 'ready' && !feedback && !feedbackError) {
      void handleGetFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFeedback, state.main.stage, feedback, feedbackError]);

  function buildTracks(notes: NoteEvent[], key: KeyDetection, styleId: StyleId) {
    // Build 4 MIDI stems from a fallback arrangement. (Real LLM-arranged stems are
    // the next step; the v4 plan keeps the same flow but with StyleId-based presets.)
    const arr = fallbackArrange(notes, key, styleId);
    const secondsPerBeat = 60 / arr.bpm;
    const beatsPerChord = 4;

    // Melody: notes as-is
    const melody = new Midi();
    melody.name = 'melody';
    const mt = melody.addTrack();
    mt.name = 'melody';
    for (const n of notes) {
      mt.addNote({ midi: n.pitch, time: n.onset, duration: n.duration, velocity: n.velocity / 127 });
    }

    // Chords: 4 roots from arrangement.bassLine, each 4 beats, major triad
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NOTE_NAME_TO_MIDI: Record<string, number> = {};
    for (let octave = -1; octave <= 9; octave++) {
      for (let i = 0; i < 12; i++) {
        NOTE_NAME_TO_MIDI[`${NOTE_NAMES[i]}${octave}`] = (octave + 1) * 12 + i;
      }
    }
    const chords = new Midi();
    chords.name = 'chords';
    const ct = chords.addTrack();
    ct.name = 'chords';
    for (let i = 0; i < arr.chordProgression.length; i++) {
      const root = NOTE_NAME_TO_MIDI[arr.bassLine[i] ?? 'C2'] ?? 60;
      const triad = [root, root + 4, root + 7];
      const startSec = i * beatsPerChord * secondsPerBeat;
      for (const pitch of triad) {
        ct.addNote({ midi: pitch, time: startSec, duration: beatsPerChord * secondsPerBeat, velocity: 0.6 });
      }
    }

    // Bass: 8 root notes from arrangement.bassLine, 8th-notes
    const bass = new Midi();
    bass.name = 'bass';
    const bt = bass.addTrack();
    bt.name = 'bass';
    for (let i = 0; i < arr.bassLine.length; i++) {
      const pitch = NOTE_NAME_TO_MIDI[arr.bassLine[i] ?? 'C2'] ?? 36;
      bt.addNote({
        midi: pitch,
        time: i * (beatsPerChord / 2) * secondsPerBeat,
        duration: (beatsPerChord / 2) * secondsPerBeat * 0.9,
        velocity: 0.8,
      });
    }

    // Drums: GM drum map from arrangement.drumPattern (drumMap string)
    const GM_DRUM_MAP: Record<string, number> = {
      '1': 36, '2': 38, '3': 42, '4': 46, '5': 49,
    };
    // Reuse fallback's drumPattern is a string in v4 (drumMap name); we instead
    // re-derive a 16-step pattern from the same template used by midi-assembler.
    const drumCodes = deriveDrumCodes(arr.drumPattern as unknown as string);
    const drums = new Midi();
    drums.name = 'drums';
    const dt = drums.addTrack();
    dt.name = 'drums';
    dt.channel = 9;
    for (let i = 0; i < drumCodes.length; i++) {
      const code = drumCodes[i]!;
      if (code === 0) continue;
      const gmMidi = GM_DRUM_MAP[String(code)] ?? 36;
      dt.addNote({ midi: gmMidi, time: i * secondsPerBeat, duration: secondsPerBeat * 0.5, velocity: 0.7 });
    }

    return { melody, chords, bass, drums };
  }

  async function handleTrySample() {
    const basePath = '/hummingbird';
    try {
      const audioRes = await fetch(`${basePath}/samples/humming-demo.webm`);
      if (!audioRes.ok) throw new Error(`Sample audio fetch failed: ${audioRes.status}`);
      const audioBlob = await audioRes.blob();
      const notesRes = await fetch(`${basePath}/samples/humming-demo.json`);
      if (!notesRes.ok) throw new Error(`Sample notes fetch failed: ${notesRes.status}`);
      const sampleData = await notesRes.json();
      const sampleBpm: number = sampleData.bpm;
      const key: Key = sampleData.key;
      const mode: Mode = sampleData.mode;
      const keyDetection: KeyDetection = { key, mode, confidence: 0.9 };
      const sampleInput = {
        kind: 'sample' as const,
        audioBlob,
        notes: sampleData.notes as NoteEvent[],
        key: keyDetection,
      };
      dispatchEvent({ type: 'START_ARRANGING', input: sampleInput, style: 'pop' });
      setBpm(sampleBpm);
      try {
        // 1. Transcribe (real audio → real notes) just to keep the pipeline honest
        const notes: NoteEvent[] = await transcribeAudio(audioBlob);
        const tracks = buildTracks(notes.length ? notes : sampleInput.notes, keyDetection, 'pop');
        // Also assemble a single combined Midi for legacy Player/DownloadMidi
        const combined = new Midi();
        combined.name = 'hummingbird';
        for (const stem of [tracks.melody, tracks.chords, tracks.bass, tracks.drums]) {
          for (const t of stem.tracks) {
            const newT = combined.addTrack();
            newT.name = t.name;
            newT.channel = t.channel;
            for (const n of t.notes) {
              newT.addNote({ midi: n.midi, time: n.time, duration: n.duration, velocity: n.velocity });
            }
          }
        }
        const midiBytes = combined.toArray();
        dispatchEvent({
          type: 'ARRANGEMENT_READY',
          tracks: { melody: tracks.melody, chords: tracks.chords, bass: tracks.bass, drums: tracks.drums },
          stems: 'ready',
        });
        // Stash bytes/key/bpm in a side-store via window for Player/DownloadMidi
        // (the v4 state machine dropped bytes/key from the public State — these
        // are used only by the legacy display components.)
        stashCombinedMidi(midiBytes, keyDetection, sampleBpm);
        showToast({ severity: 'success', message: 'Sample loaded' });
      } catch (inner) {
        dispatchEvent({
          type: 'RENDER_ERROR',
          error: { code: 'UNKNOWN', message: (inner as Error).message, recoverable: true, fallbackChain: ['stems'] },
        });
        showToast({ severity: 'error', message: (inner as Error).message });
      }
    } catch (e) {
      showToast({ severity: 'error', message: (e as Error).message });
    }
  }

  async function handleRecordingComplete(blob: Blob) {
    try {
      // 1. Transcribe
      const notes: NoteEvent[] = await transcribeAudio(blob);
      // 2. Detect key
      const keyDetection: KeyDetection = notes.length ? detectKey(notes) : { key: 'C' as Key, mode: 'major' as Mode, confidence: 0 };
      const inputObj = {
        kind: 'recording' as const,
        audioBlob: blob,
        notes,
        key: keyDetection,
      };
      setBpm(120);
      dispatchEvent({ type: 'START_ARRANGING', input: inputObj, style });
      const tracks = buildTracks(notes, keyDetection, style);
      const combined = new Midi();
      for (const stem of [tracks.melody, tracks.chords, tracks.bass, tracks.drums]) {
        for (const t of stem.tracks) {
          const newT = combined.addTrack();
          newT.name = t.name;
          newT.channel = t.channel;
          for (const n of t.notes) {
            newT.addNote({ midi: n.midi, time: n.time, duration: n.duration, velocity: n.velocity });
          }
        }
      }
      const midiBytes = combined.toArray();
      dispatchEvent({
        type: 'ARRANGEMENT_READY',
        tracks: { melody: tracks.melody, chords: tracks.chords, bass: tracks.bass, drums: tracks.drums },
        stems: 'ready',
      });
      stashCombinedMidi(midiBytes, keyDetection, 120);
    } catch (e) {
      dispatchEvent({
        type: 'RENDER_ERROR',
        error: { code: 'UNKNOWN', message: (e as Error).message, recoverable: true, fallbackChain: ['stems'] },
      });
      showToast({ severity: 'error', message: (e as Error).message });
    }
  }

  function handleStyleSwitch(newStyleId: StyleId) {
    if (state.main.stage !== 'ready') return;
    const notes = state.main.input.notes;
    const key = state.main.input.key;
    const tracks = buildTracks(notes, key, newStyleId);
    const combined = new Midi();
    for (const stem of [tracks.melody, tracks.chords, tracks.bass, tracks.drums]) {
      for (const t of stem.tracks) {
        const newT = combined.addTrack();
        newT.name = t.name;
        newT.channel = t.channel;
        for (const n of t.notes) {
          newT.addNote({ midi: n.midi, time: n.time, duration: n.duration, velocity: n.velocity });
        }
      }
    }
    dispatchEvent({ type: 'RESET' });
    dispatchEvent({
      type: 'START_ARRANGING',
      input: { ...state.main.input },
      style: newStyleId,
    });
    dispatchEvent({
      type: 'ARRANGEMENT_READY',
      tracks: { melody: tracks.melody, chords: tracks.chords, bass: tracks.bass, drums: tracks.drums },
      stems: 'ready',
    });
    stashCombinedMidi(combined.toArray(), key, bpm);
  }

  async function handleGenerateLyrics() {
    if (state.main.stage !== 'ready' || !keyInfo) return;
    setLyricsLoading(true);
    setLyricsError(null);
    try {
      const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
      const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
      const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
      const prompt = getLyricsPrompt(lyricsLocale, {
        melodySummary: `${keyInfo.key} ${keyInfo.mode}, ${bpm} BPM, ${input?.notes.length ?? 0} notes`,
        bpm,
        style,
      });
      const result = await generateLyrics({
        prompt,
        model: llmProvider,
        localBaseUrl: llmBaseUrl,
        localModel: llmModel,
        locale: lyricsLocale,
      });
      if (!result.ok) {
        const msg = result.error ?? 'Lyrics generation failed';
        setLyricsError(msg);
        showToast({ severity: 'error', message: msg });
        return;
      }
      setLyrics(result.lyrics);
    } catch (e) {
      const msg = (e as Error).message;
      setLyricsError(msg);
      showToast({ severity: 'error', message: msg });
    } finally {
      setLyricsLoading(false);
    }
  }

  const isReady = state.main.stage === 'ready';
  const isArranging = state.main.stage === 'arranging';
  const isError = state.main.stage === 'error';
  const readyTracks = state.main.stage === 'ready' ? state.main.tracks : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <h1 className="text-lg font-semibold">Hummingbird (哼哼编曲)</h1>
        <Link href="/hummingbird/portfolio" className="ml-4 text-sm text-zinc-400 hover:text-zinc-200">About</Link>
        <button type="button" onClick={() => setSettingsOpen(true)} className="ml-auto text-xl" aria-label="Open settings ⚙">⚙</button>
      </header>
      <Hero />
      <StatusBadges />
      <StyleCarousel />
      <HowItWorks />
      <main id="demo" className="flex-1 p-6 max-w-3xl mx-auto flex flex-col gap-6">
        <section className="flex flex-col items-center gap-3">
          <Recorder onComplete={handleRecordingComplete} />
          <button
            type="button"
            onClick={handleTrySample}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            Try sample
          </button>
          <WaveformView audio={audioBlob} />
          <PitchView
            notes={input?.notes ?? []}
            keyName={keyInfo?.key ?? 'C'}
            mode={keyInfo?.mode ?? 'major'}
          />
        </section>

        {isArranging && (
          <p className="text-sm text-zinc-400 text-center">Arranging… (key detection → arrangement → MIDI stems)</p>
        )}

        {isError && (
          <div className="rounded bg-red-900/30 text-red-200 p-3 text-sm">
            ! {(state.main as { error: { message: string } }).error.message}.{' '}
            <button className="underline ml-2" onClick={() => dispatchEvent({ type: 'RESET' })}>Reset</button>
          </div>
        )}

        {isReady && keyInfo && (
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            <KeyDisplay keyName={keyInfo.key} mode={keyInfo.mode} bpm={bpm} confidence={keyInfo.confidence} />
            <StyleSelector selected={style} onChange={handleStyleSwitch} />
            <LyricsPanel
              lyrics={lyrics}
              lyricsError={lyricsError}
              onGenerate={handleGenerateLyrics}
              onLocaleChange={setLyricsLocale}
              loading={lyricsLoading}
            />
            <FeedbackPanel
              feedback={feedback}
              feedbackError={feedbackError}
              loading={feedbackLoading}
              onGenerate={handleGetFeedback}
            />
            <Player midi={getCombinedMidi()} bpm={bpm} />
            <DownloadMidi midi={getCombinedMidiBlob()} />
            <DownloadButtons
              tracks={readyTracks ?? { melody: null, chords: null, bass: null, drums: null }}
              preset={getPreset(style)}
              durationSec={RENDER_DURATION_SEC}
              capabilities={caps}
            />
          </div>
        )}
      </main>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        autoFeedback={autoFeedback}
        setAutoFeedback={(v) => {
          setAutoFeedback(v);
          saveSettings({ autoFeedback: v });
        }}
      />
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ---- helpers ----

const SIDE_STORE_KEY = 'hummingbird:combined-midi';

function stashCombinedMidi(bytes: Uint8Array, key: KeyDetection, bpm: number) {
  if (typeof window === 'undefined') return;
  (window as any).__hummingbird = { bytes, key, bpm };
  // Also persist the raw midi bytes as base64 for tests + reload
  try {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
    window.localStorage.setItem(SIDE_STORE_KEY, btoa(bin));
    window.localStorage.setItem('hummingbird:key', JSON.stringify(key));
    window.localStorage.setItem('hummingbird:bpm', String(bpm));
  } catch {
    // ignore
  }
}

function getCombinedMidi(): Uint8Array | null {
  if (typeof window === 'undefined') return null;
  const s = (window as any).__hummingbird;
  if (s?.bytes) return s.bytes as Uint8Array;
  const b64 = window.localStorage.getItem(SIDE_STORE_KEY);
  if (!b64) return null;
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function getCombinedMidiBlob(): Blob | null {
  const bytes = getCombinedMidi();
  if (!bytes) return null;
  return new Blob([bytes as BlobPart], { type: 'audio/midi' });
}

// Derive a 16-step drum pattern (1=kick 2=snare 3=hihat) from the drumMap name.
// Keeps the same 8 templates the rest of the pipeline uses.
function deriveDrumCodes(drumMap: string | undefined): number[] {
  const PATTERNS: Record<string, number[]> = {
    'standard':    [1, 0, 3, 0, 2, 0, 3, 0, 1, 0, 3, 0, 2, 0, 3, 0],
    'brush':       [1, 0, 3, 3, 2, 0, 3, 3, 1, 0, 3, 3, 2, 0, 3, 3],
    'half-time':   [1, 0, 0, 3, 0, 0, 2, 0, 0, 3, 0, 0, 1, 0, 2, 3],
    'triplet':     [1, 3, 0, 2, 3, 0, 1, 3, 0, 2, 3, 0, 1, 0, 3, 0],
    '4-on-floor':  [1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 2, 0],
    'half-trap':   [1, 0, 0, 3, 0, 0, 2, 3, 0, 3, 0, 0, 1, 3, 2, 0],
    'funk':        [1, 0, 3, 0, 0, 2, 3, 0, 1, 0, 0, 3, 0, 2, 3, 0],
    'soft-kit':    [1, 0, 3, 0, 2, 0, 0, 3, 1, 0, 3, 0, 2, 0, 3, 0],
  };
  return PATTERNS[drumMap ?? 'standard'] ?? PATTERNS['standard']!;
}
