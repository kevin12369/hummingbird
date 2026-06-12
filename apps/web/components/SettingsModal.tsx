import type { Theme } from '../lib/theme';
import { LocalProviderCard } from './LocalProviderCard';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (patch: Partial<Theme>) => void;
  autoFeedback: boolean;
  setAutoFeedback: (v: boolean) => void;
}

export function SettingsModal({ open, onClose, theme, onThemeChange, autoFeedback, setAutoFeedback }: SettingsModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-zinc-800">
        <div className="flex items-center px-4 py-3 border-b border-zinc-800">
          <h2 className="text-lg font-medium">Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close settings" className="ml-auto text-zinc-400 hover:text-white text-xl">x</button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col gap-6">
          <section className="border border-zinc-800 rounded p-3 flex flex-col gap-2 text-sm">
            <h3 className="font-medium text-zinc-200">Theme</h3>
            <label htmlFor="theme-primary">Primary color</label>
            <input id="theme-primary" type="color" value={theme.primary} onChange={(e) => onThemeChange({ primary: e.target.value })} className="w-20 h-8 rounded bg-zinc-800 border border-zinc-700" />
            <label htmlFor="theme-secondary">Secondary color</label>
            <input id="theme-secondary" type="color" value={theme.secondary} onChange={(e) => onThemeChange({ secondary: e.target.value })} className="w-20 h-8 rounded bg-zinc-800 border border-zinc-700" />
          </section>
          <section className="border border-zinc-800 rounded p-3 flex flex-col gap-2 text-sm">
            <h3 className="font-medium text-zinc-200">Teaching feedback</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFeedback}
                onChange={(e) => setAutoFeedback(e.target.checked)}
                className="rounded bg-zinc-800 border border-zinc-700"
              />
              <span>Auto-generate feedback after each arrangement</span>
            </label>
          </section>
          <section className="border border-zinc-800 rounded p-3">
            <LocalProviderCard />
          </section>
        </div>
      </div>
    </div>
  );
}
