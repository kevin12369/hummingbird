import { useMemo, useState } from 'react';
import type { LyricsOutput, Locale } from '@hummingbird/lyrics';
import { SUPPORTED_LOCALES } from '@hummingbird/lyrics';

const LOCALE_LABELS: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
};

export interface LyricsPanelProps {
  lyrics: LyricsOutput | null;
  lyricsError: string | null;
  onGenerate: (locale: Locale) => Promise<void>;
  onLocaleChange: (locale: Locale) => void;
  loading?: boolean;
}

export function LyricsPanel({ lyrics, lyricsError, onGenerate, onLocaleChange, loading = false }: LyricsPanelProps) {
  const [locale, setLocale] = useState<Locale>(lyrics?.locale ?? 'zh');

  const text = useMemo(() => {
    if (!lyrics) return '';
    return lyrics.lines.map((l) => l.text).join('\n');
  }, [lyrics]);

  const downloadUrl = useMemo(() => {
    if (!text) return null;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, [text]);

  function switchLocale(l: Locale) {
    setLocale(l);
    onLocaleChange(l);
  }

  if (!lyrics && !lyricsError) {
    return (
      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-200">Lyrics</h3>
          <div className="ml-auto flex gap-1">
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLocale(l)}
                className={`text-xs px-2 py-1 rounded border ${
                  locale === l ? 'border-emerald-500 text-emerald-300 bg-emerald-900/20' : 'border-zinc-700 text-zinc-400'
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onGenerate(locale)}
          disabled={loading}
          className="self-start rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Generating lyrics...' : 'Generate lyrics'}
        </button>
      </div>
    );
  }

  if (!lyrics && lyricsError) {
    return (
      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-200">Lyrics</h3>
        </div>
        <p className="text-sm text-red-300">{lyricsError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-zinc-200">Lyrics</h3>
        <div className="ml-auto flex gap-1">
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLocale(l)}
              className={`text-xs px-2 py-1 rounded border ${
                locale === l ? 'border-emerald-500 text-emerald-300 bg-emerald-900/20' : 'border-zinc-700 text-zinc-400'
              }`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <pre className="text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded p-3 whitespace-pre-wrap font-sans">
{text}
        </pre>
        {downloadUrl && lyrics && (
          <a
            href={downloadUrl}
            download={`hummingbird-lyrics-${lyrics.locale}.txt`}
            className="self-start rounded bg-primary text-black px-3 py-1 text-sm font-medium"
          >
            Download .txt
          </a>
        )}
      </div>
    </div>
  );
}
