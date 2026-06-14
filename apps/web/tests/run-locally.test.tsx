import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RunLocally } from '../components/RunLocally';

describe('RunLocally', () => {
  beforeEach(() => {
    // Polyfill navigator.clipboard for the jsdom env
    (globalThis as any).navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('renders the section title and subtitle', () => {
    render(<RunLocally />);
    const title = screen.getByTestId('run-locally-title');
    expect(title.textContent).toMatch(/本地跑/);
    expect(screen.getByText(/不需要 API key/)).toBeTruthy();
  });

  it('renders the terminal code block with 3 commands', () => {
    render(<RunLocally />);
    const pre = screen.getByTestId('run-locally-terminal');
    expect(pre).toBeTruthy();
    expect(pre.textContent).toMatch(/git clone/);
    expect(pre.textContent).toMatch(/pnpm install/);
    expect(pre.textContent).toMatch(/pnpm dev/);
  });

  it('renders a copy button and copies on click', async () => {
    render(<RunLocally />);
    const btn = screen.getByTestId('run-locally-copy');
    expect(btn).toBeTruthy();
    await act(async () => {
      fireEvent.click(btn);
    });
    expect((navigator as any).clipboard.writeText).toHaveBeenCalledTimes(1);
    const call = ((navigator as any).clipboard.writeText as any).mock.calls[0][0];
    expect(call).toMatch(/git clone/);
    expect(call).toMatch(/pnpm install/);
    expect(call).toMatch(/pnpm dev/);
  });

  it('renders the hard requirements list (4 items: 2 required + 2 optional)', () => {
    render(<RunLocally />);
    const list = screen.getByTestId('run-locally-requirements-list');
    expect(list).toBeTruthy();
    const items = list.querySelectorAll('[data-testid="run-locally-requirement"]');
    expect(items.length).toBe(4);
    // Two required (Node, pnpm) and two optional (Ollama, 8GB+)
    expect(screen.getByText('Node.js 20+')).toBeTruthy();
    expect(screen.getByText('pnpm 9+')).toBeTruthy();
    expect(screen.getByText(/Ollama \/ LM Studio/)).toBeTruthy();
    expect(screen.getByText(/8GB\+ 内存/)).toBeTruthy();
  });

  it('renders a docs link and two CTA links (GitHub + issue)', () => {
    render(<RunLocally />);
    const docs = screen.getByTestId('run-locally-docs-link');
    expect(docs.getAttribute('href')).toMatch(/RUN-LOCALLY\.md/);

    const gh = screen.getByTestId('run-locally-cta-gh');
    expect(gh.getAttribute('href')).toMatch(/github\.com/);

    const issue = screen.getByTestId('run-locally-cta-issue');
    expect(issue.getAttribute('href')).toMatch(/issues/);
  });

  it('uses the inverted zinc-900 background to break visual rhythm', () => {
    const { container } = render(<RunLocally />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-zinc-900');
  });

  it('lays out terminal + requirements as 2 columns on md+ and 1 column on mobile', () => {
    const { container } = render(<RunLocally />);
    const grid = container.querySelector(
      '[data-testid="run-locally-terminal-card"]'
    )?.parentElement;
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
  });

  it('shows the 4-minutes "4 分钟跑起来" tagline', () => {
    render(<RunLocally />);
    expect(screen.getByText(/4 分钟跑起来/)).toBeTruthy();
  });
});
