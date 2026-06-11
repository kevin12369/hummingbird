import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DownloadMidi } from '../components/DownloadMidi';

describe('DownloadMidi', () => {
  beforeAll(() => {
    // jsdom doesn't implement URL.createObjectURL
    if (typeof URL.createObjectURL !== 'function') {
      (URL as any).createObjectURL = vi.fn(() => 'blob:mock-url');
      (URL as any).revokeObjectURL = vi.fn();
    }
  });

  it('renders a download link when midi is provided', () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/midi' });
    render(<DownloadMidi midi={blob} />);
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('download')).toMatch(/\.mid$/);
  });

  it('renders nothing when midi is null', () => {
    const { container } = render(<DownloadMidi midi={null} />);
    expect(container.firstChild).toBeNull();
  });
});
