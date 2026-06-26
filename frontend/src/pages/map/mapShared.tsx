import { AlertCircle } from 'lucide-react';
import { Breadcrumb, type Crumb } from '../../components/Breadcrumb';

// Shared primitives for the interactive maps. Every level (world, region,
// location) renders a scope as a backdrop "territory" with its children plotted
// as pins, so these pieces are reused across all of them.

// Fixed viewBox — the SVG scales to its container via preserveAspectRatio, so
// no width measurement is needed.
export const VB_W = 820;
export const VB_H = 560;

export const TYPE_STYLE = {
  region: { fill: 'fill-indigo-500', label: 'Region' },
  city: { fill: 'fill-amber-500', label: 'City' },
  town: { fill: 'fill-sky-500', label: 'Town' },
  village: { fill: 'fill-emerald-500', label: 'Village' },
  geography: { fill: 'fill-stone-500', label: 'Geography' },
  poi: { fill: 'fill-rose-500', label: 'Point of Interest' },
} as const;

export type MarkerType = keyof typeof TYPE_STYLE;

/** A child of the current scope, plotted as a pin. */
export interface MapMarker {
  key: string;
  name: string;
  type: MarkerType;
  to: string; // route to navigate to on click
  drill: boolean; // true => opens a sub-map; false => a leaf detail page
}

export function truncate(name: string, max = 18) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

/** Even, deterministic placement of n markers within a unit disc. */
export function phyllotaxis(n: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, k) => {
    const r = Math.sqrt((k + 0.5) / Math.max(n, 1));
    const a = k * golden;
    return { nx: Math.cos(a) * r, ny: Math.sin(a) * r };
  });
}

export function CompassRose({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="fill-amber-700/70 dark:fill-amber-500/70" aria-hidden>
      <circle r="22" className="fill-none stroke-amber-700/40 dark:stroke-amber-500/40" strokeWidth={1.5} />
      <polygon points="0,-26 5,0 0,8 -5,0" />
      <polygon points="0,26 5,0 0,-8 -5,0" className="fill-amber-700/30 dark:fill-amber-500/30" />
      <polygon points="-26,0 0,5 8,0 0,-5" className="fill-amber-700/30 dark:fill-amber-500/30" />
      <polygon points="26,0 0,5 -8,0 0,-5" className="fill-amber-700/30 dark:fill-amber-500/30" />
      <text y="-30" textAnchor="middle" className="fill-amber-800 dark:fill-amber-400 font-serif" fontSize="13">
        N
      </text>
    </g>
  );
}

/** The SVG shell: sea background, decorative frame, compass, and children. */
export function MapCanvas({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className="rounded-lg border border-amber-900/20 dark:border-slate-700"
      role="img"
      aria-label={ariaLabel}
    >
      <rect x={0} y={0} width={VB_W} height={VB_H} className="fill-[#dbe6ea] dark:fill-slate-950" />
      <rect
        x={8}
        y={8}
        width={VB_W - 16}
        height={VB_H - 16}
        rx={6}
        className="fill-none stroke-amber-800/30 dark:stroke-slate-700"
        strokeWidth={2}
      />
      {children}
      <CompassRose x={VB_W - 46} y={56} />
    </svg>
  );
}

/** A single map pin. Drillable markers get a dashed ring to signal "opens up". */
export function MarkerPin({
  x,
  y,
  marker,
  onClick,
}: {
  x: number;
  y: number;
  marker: MapMarker;
  onClick: () => void;
}) {
  const style = TYPE_STYLE[marker.type];
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer transition-transform duration-150 hover:scale-150"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      onClick={onClick}
    >
      <title>{marker.drill ? `${marker.name} (open map)` : marker.name}</title>
      {marker.drill && (
        <circle
          r={11}
          className="fill-none stroke-slate-500 dark:stroke-slate-400"
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />
      )}
      <circle r={7} className={`${style.fill} stroke-white dark:stroke-slate-900`} strokeWidth={2} />
      <text
        y={marker.drill ? 24 : 20}
        textAnchor="middle"
        className="fill-slate-700 dark:fill-slate-300 pointer-events-none"
        fontSize="11"
      >
        {truncate(marker.name)}
      </text>
    </g>
  );
}

export function MapLegend({ types, drillable }: { types: MarkerType[]; drillable: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
      {types.map((t) => (
        <span key={t} className="flex items-center gap-1.5">
          <svg width="14" height="14" aria-hidden>
            <circle cx="7" cy="7" r="6" className={TYPE_STYLE[t].fill} />
          </svg>
          {TYPE_STYLE[t].label}
        </span>
      ))}
      {drillable && (
        <span className="flex items-center gap-1.5">
          <svg width="16" height="16" aria-hidden>
            <circle cx="8" cy="8" r="6" className="fill-none stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.5" strokeDasharray="2 3" />
          </svg>
          opens a sub-map
        </span>
      )}
    </div>
  );
}

export function MapSkeleton({ breadcrumb }: { breadcrumb?: Crumb[] }) {
  return (
    <div className="animate-in fade-in">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="h-9 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
      <div className="aspect-[820/560] w-full rounded-lg bg-slate-200 dark:bg-slate-900 border border-amber-900/20 dark:border-slate-700 animate-pulse" />
    </div>
  );
}

export function MapErrorBox({ breadcrumb, message }: { breadcrumb?: Crumb[]; message: string }) {
  return (
    <div className="animate-in fade-in">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {message}
      </div>
    </div>
  );
}
