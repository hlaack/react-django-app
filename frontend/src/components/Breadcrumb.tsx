import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  /** Omit `to` for the current (last) crumb so it renders as plain text. */
  to?: string;
}

/** A breadcrumb trail, e.g. Home › Lore Archive › Character One. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
    >
      {items.map((crumb, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-amber-700 dark:hover:text-amber-500 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-300">{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
