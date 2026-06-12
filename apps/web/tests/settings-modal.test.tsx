import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';

const baseProps = {
  theme: { primary: '#ffffff', secondary: '#000000' },
  onThemeChange: () => {},
  autoFeedback: false,
  setAutoFeedback: () => {},
};

describe('SettingsModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<SettingsModal open={false} onClose={() => {}} {...baseProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Theme + Local LLM + Teaching feedback sections when open', () => {
    render(<SettingsModal open={true} onClose={() => {}} {...baseProps} />);
    expect(screen.getByText(/theme/i)).toBeTruthy();
    expect(screen.getByText(/teaching feedback/i)).toBeTruthy();
    expect(screen.getByText(/local llm/i)).toBeTruthy();
  });

  it('calls onClose on × click', () => {
    const onClose = vi.fn();
    render(<SettingsModal open={true} onClose={onClose} {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /close|×/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('passes theme changes through onThemeChange', () => {
    const onThemeChange = vi.fn();
    render(<SettingsModal open={true} onClose={() => {}} {...baseProps} onThemeChange={onThemeChange} />);
    const primary = screen.getByLabelText(/primary/i) as HTMLInputElement;
    fireEvent.change(primary, { target: { value: '#aabbcc' } });
    expect(onThemeChange).toHaveBeenCalledWith({ primary: '#aabbcc' });
  });

  it('toggles autoFeedback via setAutoFeedback', () => {
    const setAutoFeedback = vi.fn();
    render(<SettingsModal open={true} onClose={() => {}} {...baseProps} setAutoFeedback={setAutoFeedback} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(setAutoFeedback).toHaveBeenCalledWith(true);
  });
});
