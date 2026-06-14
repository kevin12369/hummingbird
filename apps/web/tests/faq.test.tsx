import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAQ } from '../components/FAQ';

describe('FAQ', () => {
  it('renders section title and subtitle', () => {
    render(<FAQ />);
    const title = screen.getByTestId('faq-title');
    expect(title.textContent).toMatch(/常见疑问/);
    expect(screen.getByText(/7 个最常被问/)).toBeTruthy();
  });

  it('renders all 7 FAQ items', () => {
    const { container } = render(<FAQ />);
    const items = container.querySelectorAll('[data-testid^="faq-item-faq-"]');
    expect(items.length).toBe(7);
  });

  it('uses native <details>/<summary> for accessibility', () => {
    const { container } = render(<FAQ />);
    const details = container.querySelectorAll('details');
    const summaries = container.querySelectorAll('summary');
    expect(details.length).toBe(7);
    expect(summaries.length).toBe(7);
  });

  it('answers expand on click (native behavior)', () => {
    render(<FAQ />);
    const copyrightDetails = screen.getByTestId('faq-item-faq-copyright');
    expect(copyrightDetails.hasAttribute('open')).toBe(false);
    fireEvent.click(screen.getByText('我哼的版权属于谁?'));
    expect(copyrightDetails.hasAttribute('open')).toBe(true);
  });

  it('contains key text snippets from each answer', () => {
    render(<FAQ />);
    expect(screen.getByText(/完全免费,无配额/)).toBeTruthy();
    expect(screen.getByText(/音频不离开你的设备/)).toBeTruthy();
    expect(screen.getByText(/100% 兼容/)).toBeTruthy();
    expect(screen.getByText(/good first issue/)).toBeTruthy();
    expect(screen.getByText(/12 个风格/)).toBeTruthy();
  });

  it('keeps dark theme background', () => {
    const { container } = render(<FAQ />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-[#0a0a0f]');
    expect(section?.className).toContain('border-zinc-800');
  });

  it('renders with id="faq" for in-page anchors', () => {
    const { container } = render(<FAQ />);
    const section = container.querySelector('section#faq');
    expect(section).toBeTruthy();
  });
});