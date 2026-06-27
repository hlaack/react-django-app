import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Crown, Shield, Trash2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch, ensureCsrfToken } from '../../lib/api';
import { errorMessage } from '../../lib/apiError';
import { useResourceList, useResourceMutations } from '../../hooks/useCrud';
import type { ManagedUser } from '../../types';

// Superuser-only account management: list users, toggle staff/active, reset a
// password, or delete an account. Self-lockout guardrails are enforced on the
// backend; here we just disable the self-targeting controls to make that clear.

const pillBase = 'px-2 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const pillOn = 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300';
const pillOff = 'bg-transparent border-amber-900/20 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-500';

function formatJoined(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

export function UsersView() {
  const { user } = useAuth();
  const toast = useToast();
  const list = useResourceList<ManagedUser>('users');
  const { update, remove } = useResourceMutations('users');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [pwUserId, setPwUserId] = useState<number | null>(null);
  const [pwValue, setPwValue] = useState('');

  const setPassword = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      await ensureCsrfToken();
      return apiFetch(`/users/${id}/set_password/`, { method: 'POST', json: { password } });
    },
  });

  if (list.isPending) return <p className="text-sm text-slate-400">Loading…</p>;
  if (list.isError) return <p className="text-sm text-red-600 dark:text-red-400">Could not load users. Is the backend running?</p>;

  const toggle = (u: ManagedUser, field: 'is_staff' | 'is_active') =>
    update.mutate(
      { id: u.id, data: { [field]: !u[field] } },
      {
        onSuccess: () => toast.success(`Updated ${u.username}`),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );

  const handleDelete = (u: ManagedUser) =>
    remove.mutate(u.id, {
      onSuccess: () => {
        setConfirmDeleteId(null);
        toast.success(`Deleted ${u.username}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  const submitPassword = (u: ManagedUser) => {
    setPassword.mutate(
      { id: u.id, password: pwValue },
      {
        onSuccess: () => {
          setPwUserId(null);
          setPwValue('');
          toast.success(`Password reset for ${u.username}`);
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <>
      <h2 className="text-xl font-serif font-bold mb-1">Users</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Manage accounts. You can't change your own staff/active status or delete yourself.
      </p>

      <ul className="divide-y divide-amber-900/10 dark:divide-slate-800 border border-amber-900/10 dark:border-slate-800 rounded-lg">
        {list.data.map((u) => {
          const isSelf = u.id === user?.id;
          return (
            <li key={u.id} className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{u.username}</span>
                    {isSelf && (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">you</span>
                    )}
                    {u.is_superuser && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                        <Crown className="h-3 w-3" /> super
                      </span>
                    )}
                    {!u.is_active && (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">disabled</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {u.email || 'no email'} · joined {formatJoined(u.date_joined)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggle(u, 'is_staff')}
                    disabled={isSelf || update.isPending}
                    title={isSelf ? "You can't change your own staff access" : 'Toggle staff access'}
                    className={`${pillBase} inline-flex items-center gap-1 ${u.is_staff ? pillOn : pillOff}`}
                  >
                    <Shield className="h-3 w-3" /> Staff
                  </button>
                  <button
                    onClick={() => toggle(u, 'is_active')}
                    disabled={isSelf || update.isPending}
                    title={isSelf ? "You can't deactivate yourself" : 'Toggle active'}
                    className={`${pillBase} ${u.is_active ? pillOn : pillOff}`}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => { setPwUserId(pwUserId === u.id ? null : u.id); setPwValue(''); }}
                    title="Reset password"
                    className="p-1.5 rounded text-slate-500 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Reset password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  {confirmDeleteId === u.id ? (
                    <>
                      <button onClick={() => handleDelete(u)} className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(u.id)}
                      disabled={isSelf}
                      title={isSelf ? "You can't delete yourself" : 'Delete user'}
                      aria-label="Delete user"
                      className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {pwUserId === u.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={pwValue}
                    onChange={(e) => setPwValue(e.target.value)}
                    placeholder="New password"
                    className="flex-1 max-w-xs rounded-md border border-amber-900/20 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm outline-none focus:border-amber-600 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-600/40"
                  />
                  <button
                    onClick={() => submitPassword(u)}
                    disabled={!pwValue || setPassword.isPending}
                    className="text-sm px-3 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-medium"
                  >
                    {setPassword.isPending ? 'Saving…' : 'Set password'}
                  </button>
                  <button
                    onClick={() => { setPwUserId(null); setPwValue(''); }}
                    className="text-sm px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
