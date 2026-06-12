import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PitchView } from '../components/PitchView';

const sampleNotes = [
  { pitch: 60, onset: 0, duration: 0.5, velocity: 0.7 },
  { pitch: 62, onset: 0.5, duration: 0.5, velocity: 0.7 },
  { pitch: 64, onset: 1, duration: 0.5, velocity: 0.7 },
];

describe('PitchView', () => {
  it('renders nothing when no notes', () => {
    const { container } = render(<PitchView notes={[]} keyName="C" mode="major" />);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('renders a canvas when notes are provided', () => {
    const { container } = render(<PitchView notes={sampleNotes} keyName="C" mode="major" />);
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('canvas has correct dimensions', () => {
    const { container } = render(<PitchView notes={sampleNotes} keyName="C" mode="major" width={300} height={100} />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.getAttribute('width')).toBe('300');
    expect(canvas?.getAttribute('height')).toBe('100');
  });
});
