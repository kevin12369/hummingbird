import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const Thrower = () => { throw new Error('boom'); };
const Safe = () => <div>safe</div>;

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><Safe /></ErrorBoundary>);
    expect(screen.getByText('safe')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    // Suppress React's error log for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Thrower /></ErrorBoundary>);
    expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    spy.mockRestore();
  });
});
