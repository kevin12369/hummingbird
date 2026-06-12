export type FeedbackCategory = 'pitch' | 'rhythm' | 'tempo' | 'style' | 'praise';
export type FeedbackSeverity = 'info' | 'warning' | 'praise';

export interface FeedbackItem {
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  text: string;
  context?: { measure?: number; noteIndex?: number };
}

export interface FeedbackInput {
  notesSummary: string;
  key: string;
  mode: 'major' | 'minor';
  bpm: number;
  style: string;
}

export interface FeedbackOutput {
  items: FeedbackItem[];
  rawText: string;
}

export class FeedbackError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = 'FeedbackError';
  }
}
