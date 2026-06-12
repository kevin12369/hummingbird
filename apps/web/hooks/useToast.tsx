import { useState, useCallback, useEffect, useRef } from 'react';

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  severity: ToastSeverity;
  message: string;
  createdAt: number;
}

export interface ShowToastArgs {
  severity: ToastSeverity;
  message: string;
}

const AUTO_DISMISS_MS: Record<ToastSeverity, number> = {
  info: 4000,
  success: 4000,
  warning: 4000,
  error: 0, // never auto-dismiss
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((args: ShowToastArgs) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item: ToastItem = { id, severity: args.severity, message: args.message, createdAt: Date.now() };
    setToasts((prev) => [...prev, item]);
    const delay = AUTO_DISMISS_MS[args.severity];
    if (delay > 0) {
      const handle = setTimeout(() => dismiss(id), delay);
      timersRef.current.set(id, handle);
    }
  }, [dismiss]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, []);

  return { toasts, showToast, dismiss };
}
