import type { Style, PromptInput, PromptOutput } from './types';

export type { Style, PromptInput, PromptOutput };

export interface StylePreset {
  id: Style;
  name: string;
  description: string;
  systemPrompt: string;
}

export const STYLES: StylePreset[] = [
  {
    id: 'pop',
    name: 'Pop',
    description: 'Catchy, 4-chord progressions, simple bass, 4-on-the-floor drums',
    systemPrompt: `You are a music arranger specializing in pop music. Given a melody (extracted from humming) and detected key/BPM, propose a 4-chord progression, an 8-note bass line, and a 16-step drum pattern.

Output STRICT JSON only — no prose, no markdown fences:
{
  "chordProgression": ["I", "V", "vi", "IV"],   // Roman numerals relative to the given key
  "bassLine": ["C2", "G2", "A2", "F2", "C2", "G2", "A2", "F2"],  // 8 notes, root motion matches chords
  "drumPattern": [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0]  // 16 steps, 1 = kick, 2 = snare, 3 = hat
}

Use simple I-V-vi-IV pop progressions. Bass uses root notes. Drums are 4-on-the-floor kicks with snare on 2 and 4.`,
  },
  {
    id: 'lo-fi',
    name: 'Lo-fi',
    description: 'Mellow, jazzy chords, walking bass, swung drums',
    systemPrompt: `You are a music arranger specializing in lo-fi hip-hop. Given a melody, key, and BPM (typically 70-90), propose a 4-chord jazz-influenced progression, an 8-note walking bass, and a 16-step swung drum pattern.

Output STRICT JSON only:
{
  "chordProgression": ["ii", "V", "I", "vi"],  // Roman numerals, jazz substitutions allowed (7ths, 9ths)
  "bassLine": ["D2", "F2", "C2", "A2", "D2", "F2", "C2", "A2"],
  "drumPattern": [1, 0, 2, 0, 0, 2, 0, 1, 0, 1, 0, 2, 0, 2, 0, 0]
}

Use 7th and 9th chords. Bass walks (root-3-5-7 motion). Drums are swung with light kick + soft snare.`,
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Complex harmonies (ii-V-I), walking bass, brushed drums',
    systemPrompt: `You are a music arranger specializing in jazz. Given a melody, key, and BPM (typically 100-180), propose a 4-chord progression with strong jazz voice leading, an 8-note walking bass line, and a 16-step brushed drum pattern.

Output STRICT JSON only:
{
  "chordProgression": ["ii7", "V7", "Imaj7", "vi7"],
  "bassLine": ["D2", "F2", "A2", "C3", "C2", "E2", "G2", "A2"],
  "drumPattern": [1, 0, 2, 0, 3, 0, 2, 3, 1, 3, 2, 0, 3, 0, 2, 0]
}

Use extended chords (7ths, 9ths, 13ths). Walking bass moves by step or 4th. Drums are brush patterns (cymbal-heavy).`,
  },
  {
    id: 'rock',
    name: 'Rock',
    description: 'Power chords, driving bass, aggressive drums',
    systemPrompt: `You are a music arranger specializing in rock. Given a melody, key, and BPM (typically 110-160), propose a 4-chord power-chord progression, an 8-note driving bass line, and a 16-step aggressive drum pattern.

Output STRICT JSON only:
{
  "chordProgression": ["I", "IV", "V", "I"],
  "bassLine": ["C2", "C2", "F2", "F2", "G2", "G2", "C2", "C2"],
  "drumPattern": [1, 0, 2, 1, 1, 0, 2, 1, 1, 0, 2, 1, 1, 0, 2, 0]
}

Use power chords (no 3rd). Bass uses root notes with octaves. Drums are driving kick-snare backbeat.`,
  },
  {
    id: 'classical',
    name: 'Classical',
    description: 'Diatonic harmony, arpeggiated bass, sparse drums (or none)',
    systemPrompt: `You are a music arranger specializing in classical music. Given a melody, key, and BPM (typically 60-120), propose a 4-chord diatonic progression (I-IV-V-I or vi-IV-V-I), an 8-note arpeggiated bass line, and a 16-step minimal drum pattern (or all zeros for no drums).

Output STRICT JSON only:
{
  "chordProgression": ["I", "IV", "V", "I"],
  "bassLine": ["C2", "E2", "G2", "C3", "F2", "A2", "C3", "F2"],
  "drumPattern": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

Use diatonic triads and 7ths. Bass arpeggios (root-3-5-octave). Drums are sparse or absent.`,
  },
];

export function buildPrompt(input: PromptInput): PromptOutput {
  const style = STYLES.find(s => s.id === input.style);
  if (!style) throw new Error(`Unknown style: ${input.style}`);
  const system = style.systemPrompt;
  const user = `Detected musical parameters from humming:
- Key: ${input.key} ${input.mode}
- BPM: ${input.bpm}
- Extracted notes (MIDI pitch, onset in seconds, duration in seconds):
${input.notes.map((n) => `  - pitch=${n.pitch} onset=${n.onset.toFixed(2)} duration=${n.duration.toFixed(2)}`).join('\n')}

Propose a 4-chord progression, 8-note bass line, and 16-step drum pattern for this melody in the ${style.name} style. Output STRICT JSON only.`;
  return { system, user };
}
