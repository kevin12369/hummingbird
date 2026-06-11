import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WaveformView } from '../components/WaveformView';

describe('WaveformView', () => {
  it('renders nothing when no audio', () => {
    const { container } = render(<WaveformView audio={null} />);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('renders a canvas when audio is provided', () => {
    const { container } = render(<WaveformView audio={new Blob(['x'])} />);
    expect(container.querySelector('canvas')).toBeTruthy();
  });
});
