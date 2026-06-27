import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// Lightweight toast notifications. Mount <ToastProvider> once near the app root
// and call useToast().success(msg) / .error(msg) from anywhere beneath it.

type ToastVariant = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const AUTO_DISMISS_MS = 4000;
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = nextId++;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-2 rounded-lg border px-3 py-2 shadow-lg text-sm bg-white dark:bg-slate-900 border-amber-900/20 dark:border-slate-700 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2"
          >
            {t.variant === 'success' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return {
    success: (message: string) => ctx.notify(message, 'success'),
    error: (message: string) => ctx.notify(message, 'error'),
  };
}
