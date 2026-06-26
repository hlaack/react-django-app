import { Link } from 'react-router-dom';
import { AlertCircle, MapPin } from 'lucide-react';
import { Breadcrumb } from '../../components/Breadcrumb';
import type { PointOfInterest } from '../../types';

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

// A labeled, linked list of the Points of Interest attached to a location.
export function PoiList({ items }: { items: PointOfInterest[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-serif font-bold mb-3">
        <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-500" />
        Points of Interest
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((poi) => (
          <li key={poi.id}>
            <Link
              to={`/lore/pois/${poi.id}`}
              className="inline-block px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-amber-900/10 dark:border-slate-800 text-sm hover:border-amber-600 dark:hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            >
              {poi.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
