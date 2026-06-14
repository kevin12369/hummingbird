import React from 'react';

/**
 * Horizontal connector line between two steps on md+ screens.
 * On mobile (stacked layout) the connector is hidden via CSS.
 */
export function StepConnector() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block flex-1 h-px bg-zinc-700 self-start mt-7"
      data-testid="how-it-works-connector"
    />
  );
}