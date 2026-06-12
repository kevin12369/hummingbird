import { describe, it, expect } from 'vitest';
import { buildFeedbackPrompt } from '../src/prompt';

describe('buildFeedbackPrompt', () => {
  it('returns system + user prompt with all input fields', () => {
    const r = buildFeedbackPrompt({
      notesSummary: '8 notes, C major, 120 BPM',
      key: 'C',
      mode: 'major',
      bpm: 120,
      style: 'pop',
    });
    expect(r.system).toBeTruthy();
    expect(r.system.length).toBeGreaterThan(50);
    expect(r.user).toContain('8 notes');
    expect(r.user).toContain('C major');
    expect(r.user).toContain('120');
    expect(r.user).toContain('pop');
  });

  it('system prompt requests STRICT JSON output with 3-5 feedback items', () => {
    const r = buildFeedbackPrompt({ notesSummary: 'x', key: 'C', mode: 'major', bpm: 120, style: 'pop' });
    expect(r.system).toMatch(/JSON/i);
    expect(r.system).toMatch(/3.{0,10}5/); // 3-5
    expect(r.system).toMatch(/pitch|rhythm|tempo|style/i);
  });
});
