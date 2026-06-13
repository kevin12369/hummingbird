import { STYLES, STYLE_META, STYLE_BY_CATEGORY, type StyleId } from '@hummingbird/render';

interface Props {
  selected: StyleId;
  onChange: (id: StyleId) => void;
}

export function StyleSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {(['beat', 'mood', 'genre'] as const).map(category => (
        <div key={category}>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            {category === 'beat' ? 'Beat 节奏型' : category === 'mood' ? 'Mood 情绪' : 'Genre 流派'}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STYLE_BY_CATEGORY[category].map(id => {
              const meta = STYLE_META[id];
              const isSelected = selected === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange(id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={isSelected}
                  data-style-id={id}
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