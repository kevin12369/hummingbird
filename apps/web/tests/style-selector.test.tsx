import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleSelector } from '../components/StyleSelector';

function getButtonByText(re: RegExp): HTMLButtonElement {
  const el = screen.getByText(re) as HTMLElement;
  return el.closest('button') as HTMLButtonElement;
}

describe('StyleSelector', () => {
  it('renders 12 chip buttons', () => {
    render(<StyleSelector selected="pop" onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(12);
  });

  it('selected chip has aria-pressed="true"', () => {
    render(<StyleSelector selected="lofi" onChange={() => {}} />);
    const lofiBtn = getButtonByText(/Lo-Fi/);
    expect(lofiBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('clicking a chip calls onChange with its style id', () => {
    const onChange = vi.fn();
    render(<StyleSelector selected="pop" onChange={onChange} />);
    fireEvent.click(getButtonByText(/Trap/));
    expect(onChange).toHaveBeenCalledWith('trap');
  });

  it('renders 3 category group labels (beat / mood / genre)', () => {
    const { container } = render(<StyleSelector selected="pop" onChange={() => {}} />);
    expect(container.textContent).toMatch(/Beat 节奏型/);
    expect(container.textContent).toMatch(/Mood 情绪/);
    expect(container.textContent).toMatch(/Genre 流派/);
  });
});