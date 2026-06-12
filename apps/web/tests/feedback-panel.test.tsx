import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackPanel } from '../components/FeedbackPanel';

const sampleFeedback = {
  items: [
    { category: 'praise' as const, severity: 'praise' as const, text: '节奏稳定' },
    { category: 'pitch' as const, severity: 'warning' as const, text: '第 3 个音偏高半音' },
  ],
  rawText: '',
};

describe('FeedbackPanel', () => {
  it('renders Get feedback button when feedback is null and no error', () => {
    render(<FeedbackPanel feedback={null} feedbackError={null} loading={false} onGenerate={vi.fn()} />);
    expect(screen.getByRole('button', { name: /get feedback/i })).toBeTruthy();
  });

  it('renders nothing-yet state correctly when no feedback', () => {
    const { container } = render(<FeedbackPanel feedback={null} feedbackError={null} loading={false} onGenerate={vi.fn()} />);
    // Just the heading + button
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('renders feedback items when present', () => {
    render(<FeedbackPanel feedback={sampleFeedback} feedbackError={null} loading={false} onGenerate={vi.fn()} />);
    expect(screen.getByText('节奏稳定')).toBeTruthy();
    expect(screen.getByText('第 3 个音偏高半音')).toBeTruthy();
  });

  it('shows loading text when loading=true', () => {
    render(<FeedbackPanel feedback={null} feedbackError={null} loading={true} onGenerate={vi.fn()} />);
    expect(screen.getByText(/generating feedback/i)).toBeTruthy();
  });

  it('shows error when feedbackError is set', () => {
    render(<FeedbackPanel feedback={null} feedbackError="LLM failed" loading={false} onGenerate={vi.fn()} />);
    expect(screen.getByText(/LLM failed/)).toBeTruthy();
  });

  it('calls onGenerate when button clicked', () => {
    const onGenerate = vi.fn();
    render(<FeedbackPanel feedback={null} feedbackError={null} loading={false} onGenerate={onGenerate} />);
    fireEvent.click(screen.getByRole('button', { name: /get feedback/i }));
    expect(onGenerate).toHaveBeenCalled();
  });

  it('disables button when loading', () => {
    render(<FeedbackPanel feedback={null} feedbackError={null} loading={true} onGenerate={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /generating feedback/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
