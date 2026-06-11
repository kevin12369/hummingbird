import { useState } from 'react';
import { Recorder } from '../components/Recorder';
import { WaveformView } from '../components/WaveformView';
import { KeyDisplay } from '../components/KeyDisplay';
import { Player } from '../components/Player';
import { DownloadMidi } from '../components/DownloadMidi';
import { SettingsModal } from '../components/SettingsModal';
import { useTheme } from '../lib/theme';
import { createMachine, initialState, type State, type Event } from '../lib/state-machine';
import { transcribeAudio, detectKey } from '@hummingbird/audio';
import { assembleMidi } from '@hummingbird/midi';
import { buildPrompt, type Style } from '@hummingbird/prompt';
import { arrangeMusic, type Arrangement } from '../lib/llm-direct';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [machine, setMachine] = useState(() => createMachine(initialState()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [style] = useState<Style>('pop');
  const [bpm, setBpm] = useState(120);
  const [arrangement, setArrangement] = useState<Arrangement | null>(null);

  function dispatch(event: Event) {
    setMachine((m) => createMachine(m.transition(event)));
  }

  function applyState(next: State) {
    setMachine(createMachine(next));
  }

  async function handleRecordingComplete(blob: Blob) {
    applyState(machine.state.status === 'recording' || machine.state.status === 'idle' || machine.state.status === 'error'
      ? { status: 'processing', blob }
      : machine.state);
    try {
      // 1. Transcribe
      const notes = await transcribeAudio(blob);
      // 2. Detect key
      const { key, mode, confidence } = detectKey(notes);
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
      applyState({ status: 'ready', midi: midiBytes, key, mode, bpm });
    } catch (e) {
      applyState({ status: 'error', message: (e as Error).message });
    }
  }

  const state = machine.state;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <h1 className="text-lg font-semibold">Hummingbird (哼哼编曲)</h1>
        <button type="button" onClick={() => setSettingsOpen(true)} className="ml-auto text-xl" aria-label="Open settings ⚙">⚙</button>
      </header>
      <main className="flex-1 p-6 max-w-3xl mx-auto flex flex-col gap-6">
        <section className="flex flex-col items-center gap-3">
          <Recorder onComplete={handleRecordingComplete} />
          <WaveformView audio={state.status === 'recording' || state.status === 'processing' ? null : (state as any).blob ?? null} />
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
            <Player midi={state.midi} bpm={state.bpm} />
            <DownloadMidi midi={new Blob([state.midi as BlobPart], { type: 'audio/midi' })} />
          </div>
        )}

        {state.status === 'playing' && (
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            <KeyDisplay keyName={state.key} mode={state.mode} bpm={state.bpm} confidence={null} />
            <Player midi={state.midi} bpm={state.bpm} />
          </div>
        )}
      </main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} onThemeChange={setTheme} />
    </div>
  );
}
