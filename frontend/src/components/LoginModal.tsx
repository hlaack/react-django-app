import { useEffect, useRef, useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

type Mode = 'login' | 'register';

const inputClass =
  'w-full rounded-md border border-amber-900/20 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-600 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-600/40';

// Flatten DRF field errors ({ field: [messages] }) into a single readable line.
function messagesFromError(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === 'object') {
    const msgs: string[] = [];
    for (const value of Object.values(err.data as Record<string, unknown>)) {
      if (Array.isArray(value)) msgs.push(...value.map(String));
      else if (typeof value === 'string') msgs.push(value);
    }
    if (msgs.length) return msgs.join(' ');
  }
  return 'Something went wrong. Please try again.';
}

export function LoginModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  const isRegister = mode === 'register';

  // Focus the first field on open and close on Escape.
  useEffect(() => {
    usernameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
    setConfirm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ username, password, email: email || undefined });
      } else {
        await login({ username, password });
      }
      onClose();
    } catch (err) {
      if (!isRegister && err instanceof ApiError && err.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError(messagesFromError(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-lg bg-[#faf8f5] dark:bg-slate-900 border border-amber-900/20 dark:border-slate-700 shadow-xl p-6 animate-in fade-in zoom-in-95"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="auth-modal-title" className="text-xl font-serif font-bold">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="auth-username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="auth-username"
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className={inputClass}
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium mb-1">
                Email <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={inputClass}
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-confirm" className="block text-sm font-medium mb-1">
                Confirm password
              </label>
              <input
                id="auth-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-medium py-2 transition-colors"
          >
            {isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {submitting
              ? isRegister
                ? 'Creating…'
                : 'Signing in…'
              : isRegister
                ? 'Create account'
                : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-amber-700 dark:text-amber-500 hover:underline"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}
