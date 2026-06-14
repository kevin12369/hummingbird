import React from 'react';
import {
  STYLES,
  STYLE_META,
  STYLE_BY_CATEGORY,
  type StyleId,
  type StyleMeta,
} from '@hummingbird/render';

interface Props {
  selected: StyleId;
  onSelect: (id: StyleId) => void;
}

const CATEGORY_LABELS: Record<StyleMeta['category'], string> = {
  beat: 'Beat 节奏型',
  mood: 'Mood 情绪',
  genre: 'Genre 流派',
};

/**
 * Horizontally scrolling row of 12 style chips, grouped by category
 * with sticky category labels. Each chip is a button (role=button) so the
 * carousel can be keyboard-navigated.
 */
export function StyleThumbnails({ selected, onSelect }: Props) {
  // Flat list to validate / iterate, but render grouped by category.
  const groups: StyleMeta['category'][] = ['beat', 'mood', 'genre'];

  // Sanity guard: STYLES should equal flatten(STYLE_BY_CATEGORY)
  const groupedCount = groups.reduce((acc, c) => acc + STYLE_BY_CATEGORY[c].length, 0);
  if (groupedCount !== STYLES.length) {
    // eslint-disable-next-line no-console
    console.warn('StyleThumbnails: category grouping is out of sync with STYLES');
  }

  return (
    <div className="flex flex-col gap-3" data-testid="style-thumbnails">
      {groups.map((cat) => (
        <div key={cat}>
          <div
            className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5 sticky left-0"
            data-testid="group-label"
            data-category={cat}
          >
            {CATEGORY_LABELS[cat]}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
            {STYLE_BY_CATEGORY[cat].map((id) => {
              const meta = STYLE_META[id];
              const isSelected = selected === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  aria-pressed={isSelected}
                  data-style-id={id}
                  data-testid="style-thumb"
                  className={`snap-start flex-shrink-0 px-3 py-2 rounded-lg text-sm transition border whitespace-nowrap ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                  }`}
                  aria-label={`${meta.emoji}${meta.name}`}
                >
                  <span className="mr-1">{meta.emoji}</span>
                  {meta.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}