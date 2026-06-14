import React from 'react';

/**
 * 5 inline SVG icons used by the HowItWorks timeline.
 *
 * Why inline SVG instead of emoji:
 * - Emoji fonts render inconsistently across macOS / Windows / Linux / mobile.
 * - Inline SVG uses currentColor so the parent text color drives the stroke.
 *
 * All icons are 24x24, stroke-based, and use strokeWidth=1.75.
 */

interface IconProps {
  className?: string;
}

function baseProps(className?: string) {
  return {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
}

export function MicIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

export function WaveformIcon({ className }: IconProps) {
  // Stylized: a peak + horizontal line, hinting at pitch / key detection.
  return (
    <svg {...baseProps(className)}>
      <path d="M3 12h3l2-5 3 10 3-7 2 4 2-2h3" />
    </svg>
  );
}

export function ChordSheetIcon({ className }: IconProps) {
  // Music staff with notes: 4 horizontal lines + 2 small dots.
  return (
    <svg {...baseProps(className)}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="3" y1="14" x2="21" y2="14" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <circle cx="8" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RenderIcon({ className }: IconProps) {
  // Lightning bolt: signals the offline rendering step.
  return (
    <svg {...baseProps(className)}>
      <polygon points="13 2 4 14 11 14 9 22 20 10 13 10 13 2" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}