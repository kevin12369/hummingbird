import React from 'react';

export interface StepProps {
  index: number;            // 1-based
  title: string;            // "Record"
  titleZh: string;          // "录音"
  description: string;      // 1-sentence description
  durationLabel: string;    // "~5s"
  icon: React.ReactNode;    // inline SVG
}

/**
 * Single cell of the 5-step timeline.
 *
 * Vertical layout:
 *   [ icon + number badge in a 14x14 gradient circle ]
 *   title (English + Chinese)
 *   description (1 line)
 *   duration chip
 *
 * Connector lines between steps live in <StepConnector /> and are siblings
 * inside the parent flex row, so they're easy to skip on the last step.
 */
export function Step({
  index,
  title,
  titleZh,
  description,
  durationLabel,
  icon,
}: StepProps) {
  return (
    <div
      className="relative flex flex-col items-center text-center gap-3 flex-1 min-w-0"
      data-testid="how-it-works-step"
      data-step-index={index}
    >
      {/* Gradient circle with icon + 1-based number badge */}
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg text-white">
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-zinc-900 border border-zinc-700 text-zinc-100">
          {index}
        </span>
        <span className="text-zinc-50">{icon}</span>
      </div>

      {/* Title */}
      <span className="text-base font-semibold text-zinc-100">
        {title} <span className="text-zinc-400">{titleZh}</span>
      </span>

      {/* Description */}
      <p className="text-sm text-zinc-400 leading-relaxed max-w-[14rem]">
        {description}
      </p>

      {/* Duration chip */}
      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs">
        {durationLabel}
      </span>
    </div>
  );
}