import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Recorder } from '../components/Recorder';
import { WaveformView } from '../components/WaveformView';
import { KeyDisplay } from '../components/KeyDisplay';
import { Player } from '../components/Player';
import { DownloadMidi } from '../components/DownloadMidi';
import { SettingsModal } from '../components/SettingsModal';
import { StyleSelector, type Style as HummingbirdStyle } from '../components/StyleSelector';
import { LyricsPanel } from '../components/LyricsPanel';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { PitchView } from '../components/PitchView';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../lib/theme';
import { createMachine, initialState, type State, type Event } from '../lib/state-machine';
import { loadSettings, saveSettings } from '../lib/settings';
import { transcribeAudio, detectKey, setBasicPitchModelUrl, type NoteEvent } from '@hummingbird/audio';

// BasicPitch model lives under the Next.js basePath on GitHub Pages.
// Set it once on module load so transcribeAudio() loads from the right URL.
if (typeof window !== 'undefined') {
  setBasicPitchModelUrl('/hummingbird/basic-pitch/model.json');
}
import { assembleMidi } from '@hummingbird/midi';
import { buildPrompt, type Style } from '@hummingbird/prompt';
import { arrangeMusic, trySampleArrangeMusic, type Arrangement } from '../lib/llm-direct';
import { getLyricsPrompt, generateLyrics, type Locale as LyricsLocale } from '@hummingbird/lyrics';
import { buildFeedbackPrompt, generateFeedback } from '@hummingbird/feedback';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [machine, setMachine] = useState(() => createMachine(initialState()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [style] = useState<Style>('pop');
  const [bpm, setBpm] = useState(120);
  const [arrangement, setArrangement] = useState<Arrangement | null>(null);
  const [lyricsLocale, setLyricsLocale] = useState<LyricsLocale>('zh');
  const [autoFeedback, setAutoFeedback] = useState(() => loadSettings().autoFeedback);
  const { toasts, showToast, dismiss } = useToast();

  const state = machine.state;

  function dispatch(event: Event) {
    setMachine((m) => createMachine(m.transition(event)));
  }

  function applyState(next: State) {
    setMachine(createMachine(next));
  }

  async function handleGetFeedback() {
    const s = machine.state;
    if (s.status !== 'ready') return;
    dispatch({ type: 'GENERATE_FEEDBACK' });
    try {
      const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
      const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
      const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
      const prompt = buildFeedbackPrompt({
        notesSummary: `${s.notes?.length ?? 0} notes`,
        key: s.key,
        mode: s.mode,
        bpm: s.bpm,
        style: s.style ?? 'pop',
      });
      const r = await generateFeedback({ prompt, model: llmProvider, localBaseUrl: llmBaseUrl, localModel: llmModel });
      if (!r.ok || !r.feedback) {
        const msg = r.error ?? 'Feedback failed';
        showToast({ severity: 'error', message: msg });
        dispatch({ type: 'FEEDBACK_ERROR', message: msg });
        return;
      }
      dispatch({ type: 'FEEDBACK_COMPLETE', feedback: r.feedback });
    } catch (e) {
      const msg = (e as Error).message;
      showToast({ severity: 'error', message: msg });
      dispatch({ type: 'FEEDBACK_ERROR', message: msg });
    }
  }

  // Auto-trigger feedback after a successful arrangement when the user has
  // enabled the setting. Idempotent: skips when feedback (or a recent error)
  // is already present.
  useEffect(() => {
    if (
      autoFeedback &&
      state.status === 'ready' &&
      !state.feedback &&
      !state.feedbackError
    ) {
      void handleGetFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFeedback, state.status, state.feedback, state.feedbackError]);

  async function handleTrySample() {
    // Fetch the demo audio + reference notes from the static samples/ dir.
    // basePath is configured in next.config.js (matches GitHub Pages path).
    // We run the full pipeline inline (transcribe -> key -> prompt -> arrange -> midi)
    // so the sample is treated the same as a real recording. The arrangement
    // step uses trySampleArrangeMusic(), which skips the LLM call when running
    // on GitHub Pages (or when NEXT_PUBLIC_TRY_SAMPLE_SKIP_LLM=true).
    const basePath = '/hummingbird';
    try {
      const audioRes = await fetch(`${basePath}/samples/humming-demo.webm`);
      if (!audioRes.ok) throw new Error(`Sample audio fetch failed: ${audioRes.status}`);
      const audioBlob = await audioRes.blob();
      const notesRes = await fetch(`${basePath}/samples/humming-demo.json`);
      if (!notesRes.ok) throw new Error(`Sample notes fetch failed: ${notesRes.status}`);
      const sampleData = await notesRes.json();
      const sampleBpm: number = sampleData.bpm;
      // Pre-fill processing state so the discriminated union is satisfied.
      applyState({
        status: 'processing',
        blob: audioBlob,
        key: sampleData.key,
        mode: sampleData.mode,
        bpm: sampleBpm,
      });
      try {
        // 1. Transcribe
        const notes: NoteEvent[] = await transcribeAudio(audioBlob);
        // 2. Detect key (use sampleData values since sample is reference-grade)
        const key = sampleData.key as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'C#' | 'D#' | 'F#' | 'G#' | 'A#';
        const mode = sampleData.mode as 'major' | 'minor';
        // 3. Build prompt
        const prompt = buildPrompt({ notes, key, mode, bpm: sampleBpm, style });
        // 4. Arrangement (LLM or hardcoded fallback for GitHub Pages)
        const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
        const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
        const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
        const arr = await trySampleArrangeMusic({ prompt, model: llmProvider, localBaseUrl: llmBaseUrl, localModel: llmModel });
        if (!arr.ok || !arr.arrangement) {
          applyState({ status: 'error', message: arr.error ?? 'Try-sample arrangement failed' });
          return;
        }
        const finalArr: Arrangement = { ...arr.arrangement, bpm: sampleBpm };
        // 5. Assemble MIDI
        const midiBytes = await assembleMidi({ notes, arrangement: finalArr });
        setArrangement(finalArr);
        applyState({ status: 'ready', midi: midiBytes, key, mode, bpm: sampleBpm, notes, style });
        showToast({ severity: 'success', message: 'Sample loaded' });
      } catch (inner) {
        applyState({ status: 'error', message: (inner as Error).message });
      }
    } catch (e) {
      showToast({ severity: 'error', message: (e as Error).message });
    }
  }

  async function handleRecordingComplete(blob: Blob) {
    const canStart = machine.state.status === 'recording' || machine.state.status === 'idle' || machine.state.status === 'error';
    // Pre-fill key/mode/bpm so the 'processing' state satisfies the discriminated union.
    // The real values are filled in by the pipeline below.
    applyState(
      canStart
        ? { status: 'processing', blob, key: 'C' as const, mode: 'major' as const, bpm }
        : machine.state,
    );
    try {
      // 1. Transcribe
      const notes: NoteEvent[] = await transcribeAudio(blob);
      // 2. Detect key
      const { key, mode } = detectKey(notes);
      // 3. Build prompt
      const prompt = buildPrompt({ notes, key, mode, bpm, style });
      // 4. LLM arrangement
      const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
      const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
      const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
      const arr = await arrangeMusic({ prompt, model: llmProvider, localBaseUrl: llmBaseUrl, localModel: llmModel });
      if (!arr.ok || !arr.arrangement) {
        applyState({ status: 'error', message: arr.error ?? 'LLM failed' });
        return;
      }
      const finalArr: Arrangement = { ...arr.arrangement, bpm };
      // 5. Assemble MIDI
      const midiBytes = await assembleMidi({ notes, arrangement: finalArr });
      setArrangement(finalArr);
      applyState({ status: 'ready', midi: midiBytes, key, mode, bpm, notes, style });
    } catch (e) {
      applyState({ status: 'error', message: (e as Error).message });
    }
  }

  async function handleStyleSwitch(newStyle: HummingbirdStyle) {
    // Re-run the pipeline with the new style
    const s = machine.state;
    if (s.status !== 'ready' || !s.notes || !s.key || !s.mode) return;
    dispatch({ type: 'TRY_OTHER_STYLE', style: newStyle });
    try {
      const prompt = buildPrompt({ notes: s.notes, key: s.key, mode: s.mode, bpm: s.bpm, style: newStyle });
      const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
      const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
      const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
      const arr = await arrangeMusic({ prompt, model: llmProvider, localBaseUrl: llmBaseUrl, localModel: llmModel });
      if (!arr.ok || !arr.arrangement) {
        dispatch({ type: 'PROCESS_ERROR', message: arr.error ?? 'Style switch failed' });
        return;
      }
      const finalArr = { ...arr.arrangement, bpm: s.bpm };
      const midiBytes = await assembleMidi({ notes: s.notes, arrangement: finalArr });
      dispatch({ type: 'PROCESS_COMPLETE', midi: midiBytes });
    } catch (e) {
      dispatch({ type: 'PROCESS_ERROR', message: (e as Error).message });
    }
  }

  async function handleGenerateLyrics() {
    const s = machine.state;
    if (s.status !== 'ready' || !s.notes || !s.key || !s.mode) return;
    dispatch({ type: 'GENERATE_LYRICS' });
    try {
      const llmBaseUrl = localStorage.getItem('hummingbird:local:baseUrl') ?? 'http://localhost:11434';
      const llmModel = localStorage.getItem('hummingbird:local:model') ?? 'llama3.1:8b';
      const llmProvider = (localStorage.getItem('hummingbird:local:provider') ?? 'ollama') as 'ollama' | 'openai-compatible';
      const prompt = getLyricsPrompt(lyricsLocale, {
        melodySummary: `${s.key} ${s.mode}, ${s.bpm} BPM, ${s.notes.length} notes`,
        bpm: s.bpm,
        style: s.style ?? 'pop',
      });
      const result = await generateLyrics({
        prompt,
        model: llmProvider,
        localBaseUrl: llmBaseUrl,
        localModel: llmModel,
        locale: lyricsLocale,
      });
      if (!result.ok) {
        dispatch({ type: 'LYRICS_ERROR', message: result.error ?? 'Lyrics generation failed' });
        return;
      }
      dispatch({ type: 'LYRICS_COMPLETE', lyrics: result.lyrics });
    } catch (e) {
      dispatch({ type: 'LYRICS_ERROR', message: (e as Error).message });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <h1 className="text-lg font-semibold">Hummingbird (哼哼编曲)</h1>
        <Link href="/hummingbird/portfolio" className="ml-4 text-sm text-zinc-400 hover:text-zinc-200">About</Link>
        <button type="button" onClick={() => setSettingsOpen(true)} className="ml-auto text-xl" aria-label="Open settings ⚙">⚙</button>
      </header>
      <main className="flex-1 p-6 max-w-3xl mx-auto flex flex-col gap-6">
        <section className="flex flex-col items-center gap-3">
          <Recorder onComplete={handleRecordingComplete} />
          <button
            type="button"
            onClick={handleTrySample}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            Try sample
          </button>
          <WaveformView audio={state.status === 'recording' || state.status === 'processing' ? null : (state as any).blob ?? null} />
          <PitchView
            notes={state.notes ?? []}
            keyName={(state as any).key ?? 'C'}
            mode={(state as any).mode ?? 'major'}
          />
        </section>

        {state.status === 'processing' && (
          <p className="text-sm text-zinc-400 text-center">Processing… (Basic Pitch → key detection → LLM arrangement → MIDI assembly)</p>
        )}

        {state.status === 'error' && (
          <div className="rounded bg-red-900/30 text-red-200 p-3 text-sm">
            ⚠ {state.message}. <button className="underline ml-2" onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
          </div>
        )}

        {state.status === 'ready' && (
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            <KeyDisplay keyName={state.key} mode={state.mode} bpm={state.bpm} confidence={null} />
            <StyleSelector
              current={(state.style ?? 'pop') as HummingbirdStyle}
              onSelect={handleStyleSwitch}
              disabled={false}
            />
            <LyricsPanel
              lyrics={state.lyrics ?? null}
              lyricsError={state.lyricsError ?? null}
              onGenerate={handleGenerateLyrics}
              onLocaleChange={setLyricsLocale}
            />
            <FeedbackPanel
              feedback={state.feedback ?? null}
              feedbackError={state.feedbackError ?? null}
              loading={false}
              onGenerate={handleGetFeedback}
            />
            <Player midi={state.midi} bpm={state.bpm} />
            <DownloadMidi midi={new Blob([state.midi as BlobPart], { type: 'audio/midi' })} />
          </div>
        )}

        {state.status === 'lyrics-generating' && (
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            <KeyDisplay keyName={state.key} mode={state.mode} bpm={state.bpm} confidence={null} />
            <p className="text-sm text-zinc-400 text-center">Generating lyrics…</p>
          </div>
        )}

        {state.status === 'feedback-generating' && (
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            <KeyDisplay keyName={state.key} mode={state.mode} bpm={state.bpm} confidence={null} />
            <p className="text-sm text-zinc-400 text-center">Generating feedback…</p>
          </div>
        )}

        {state.status === 'playing' && (
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            <KeyDisplay keyName={state.key} mode={state.mode} bpm={state.bpm} confidence={null} />
            <Player midi={state.midi} bpm={state.bpm} />
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
