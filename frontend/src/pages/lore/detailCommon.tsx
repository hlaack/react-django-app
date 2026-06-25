import { AlertCircle } from 'lucide-react';
import { Breadcrumb } from '../../components/Breadcrumb';

// Shared loading and error frames for the individual lore detail pages, so
// each page keeps the breadcrumb visible while its data resolves or fails.

export function DetailLoading({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <div className="animate-in fade-in">
      <Breadcrumb items={[...trail, { label: 'Loading…' }]} />
      <div className="h-9 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    </div>
  );
}

export function DetailError({
  trail,
  message,
}: {
  trail: { label: string; to?: string }[];
  message: string;
}) {
  return (
    <div className="animate-in fade-in">
      <Breadcrumb items={[...trail, { label: 'Not found' }]} />
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
