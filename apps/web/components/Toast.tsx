import type { ToastItem, ToastSeverity } from '../hooks/useToast';

const SEVERITY_CLASSES: Record<ToastSeverity, string> = {
  info: 'border-zinc-500 bg-zinc-800 text-zinc-100',
  success: 'border-emerald-500 bg-emerald-900/40 text-emerald-100',
  warning: 'border-amber-500 bg-amber-900/40 text-amber-100',
  error: 'border-red-500 bg-red-900/40 text-red-100',
};

export interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded border p-3 text-sm min-w-[240px] max-w-md shadow-lg ${SEVERITY_CLASSES[t.severity]}`}
        >
          <div className="flex items-start gap-2">
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="opacity-60 hover:opacity-100"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
