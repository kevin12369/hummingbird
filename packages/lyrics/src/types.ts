export type Locale = 'zh' | 'en' | 'ja';

export interface LyricLine {
  text: string;
}

export interface LyricsInput {
  melodySummary: string;
  bpm: number;
  style: string;
}

export interface LyricsOutput {
  locale: Locale;
  lines: LyricLine[];
  rawText: string;
}

export class LyricsError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = 'LyricsError';
  }
}
