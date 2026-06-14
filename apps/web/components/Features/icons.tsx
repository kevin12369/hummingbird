import React from 'react';

/**
 * 4 inline SVG icons used by the Features grid.
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

// 4-track separation: 4 horizontal staff lines with a note each.
export function StemsIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="3" y1="16" x2="21" y2="16" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <circle cx="6" cy="14" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Lightning bolt: signals fast MP3 export.
export function Mp3Icon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <polygon points="13 2 4 14 11 14 9 22 20 10 13 10 13 2" />
    </svg>
  );
}

// Microphone: signals lyrics / vocal track.
export function LyricsIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

// Bar chart with 3 bars: signals categorical feedback.
export function FeedbackIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <line x1="3" y1="20" x2="21" y2="20" />
      <rect x="5" y="12" width="3" height="8" />
      <rect x="11" y="8" width="3" height="12" />
      <rect x="17" y="4" width="3" height="16" />
    </svg>
  );
}
