import { describe, it, expect } from 'vitest';
import { buildPrompt, STYLES, type Style, type PromptInput } from '../src/styles';

describe('buildPrompt', () => {
  it('STYLES contains 5 styles: pop, lo-fi, jazz, rock, classical', () => {
    expect(STYLES).toHaveLength(5);
    expect(STYLES.map(s => s.id)).toEqual(['pop', 'lo-fi', 'jazz', 'rock', 'classical']);
  });

  it('each style has name, description, and system prompt', () => {
    for (const s of STYLES) {
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.systemPrompt).toBeTruthy();
      expect(s.systemPrompt.length).toBeGreaterThan(50);
    }
  });

  it('buildPrompt returns a system + user prompt', () => {
    const input: PromptInput = { notes: [{ pitch: 60, onset: 0, duration: 0.5, velocity: 0.7 }], key: 'C', mode: 'major', bpm: 120, style: 'pop' };
    const r = buildPrompt(input);
    expect(r.system).toContain('pop');
    expect(r.user).toContain('C major');
    expect(r.user).toContain('120');
  });

  it('system prompt requires strict JSON output with chord/bass/drum', () => {
    const r = buildPrompt({ notes: [], key: 'C', mode: 'major', bpm: 120, style: 'pop' });
    expect(r.system).toMatch(/chord|bass|drum/i);
    expect(r.system).toMatch(/JSON|json/);
  });

  it('user prompt includes the extracted notes', () => {
    const r = buildPrompt({ notes: [{ pitch: 60, onset: 0, duration: 0.5, velocity: 0.7 }], key: 'C', mode: 'major', bpm: 120, style: 'pop' });
    expect(r.user).toContain('60'); // MIDI note number
  });
});
