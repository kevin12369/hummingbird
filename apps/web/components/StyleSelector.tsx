export type Style = 'pop' | 'lo-fi' | 'jazz' | 'rock' | 'classical';

export const STYLES: { id: Style; name: string }[] = [
  { id: 'pop', name: 'Pop' },
  { id: 'lo-fi', name: 'Lo-fi' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'rock', name: 'Rock' },
  { id: 'classical', name: 'Classical' },
];

export interface StyleSelectorProps {
  current: Style;
  onSelect: (style: Style) => void;
  disabled: boolean;
}

export function StyleSelector({ current, onSelect, disabled }: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-500">Try another style:</span>
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          disabled={disabled}
          className={`text-xs px-3 py-1 rounded-full border ${
            current === s.id
              ? 'border-emerald-500 text-emerald-300 bg-emerald-900/20'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
