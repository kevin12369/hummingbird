import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';

describe('SettingsModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<SettingsModal open={false} onClose={() => {}} theme={{ primary: '#fff', secondary: '#000' }} onThemeChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Theme + Local LLM sections when open', () => {
    render(<SettingsModal open={true} onClose={() => {}} theme={{ primary: '#fff', secondary: '#000' }} onThemeChange={() => {}} />);
    expect(screen.getByText(/theme/i)).toBeTruthy();
    expect(screen.getByText(/local llm/i)).toBeTruthy();
  });

  it('calls onClose on × click', () => {
    const onClose = vi.fn();
    render(<SettingsModal open={true} onClose={onClose} theme={{ primary: '#fff', secondary: '#000' }} onThemeChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /close|×/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('passes theme changes through onThemeChange', () => {
    const onThemeChange = vi.fn();
    render(<SettingsModal open={true} onClose={() => {}} theme={{ primary: '#ffffff', secondary: '#000000' }} onThemeChange={onThemeChange} />);
    const primary = screen.getByLabelText(/primary/i) as HTMLInputElement;
    fireEvent.change(primary, { target: { value: '#aabbcc' } });
    expect(onThemeChange).toHaveBeenCalledWith({ primary: '#aabbcc' });
  });
});
