import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useRegions } from '../hooks/useLore';
import type { Region } from '../types';

// --- Marker types ---

const TYPE_STYLE = {
  city: { fill: 'fill-amber-500', label: 'City', resource: 'cities' },
  town: { fill: 'fill-sky-500', label: 'Town', resource: 'towns' },
  village: { fill: 'fill-emerald-500', label: 'Village', resource: 'villages' },
  geography: { fill: 'fill-stone-500', label: 'Geography', resource: 'geographies' },
  poi: { fill: 'fill-rose-500', label: 'Point of Interest', resource: 'pois' },
} as const;

type LocType = keyof typeof TYPE_STYLE;

interface Marker {
  id: number;
  name: string;
  type: LocType;
  nx: number; // normalized offset from territory centre, -1..1
  ny: number;
}

// Viewbox units per region "cell". Columns are chosen from the container
// width so each cell renders at a roughly constant on-screen size.
const CELL_W = 440;
const CELL_H = 380;

// --- Helpers ---

function truncate(name: string, max = 16) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

/**
 * Place a region's locations deterministically with a sunflower
 * (phyllotaxis) spiral so they spread evenly and don't overlap — a stand-in
 * for real coordinates.
 */
function buildMarkers(region: Region): Marker[] {
  const raw: Omit<Marker, 'nx' | 'ny'>[] = [
    ...region.cities.map((c) => ({ id: c.id, name: c.name, type: 'city' as const })),
    ...region.towns.map((t) => ({ id: t.id, name: t.name, type: 'town' as const })),
    ...region.villages.map((v) => ({ id: v.id, name: v.name, type: 'village' as const })),
    ...region.geographies.map((g) => ({ id: g.id, name: g.name, type: 'geography' as const })),
    ...region.points_of_interest.map((p) => ({ id: p.id, name: p.name, type: 'poi' as const })),
  ];
  const n = raw.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return raw.map((loc, k) => {
    const r = Math.sqrt((k + 0.5) / Math.max(n, 1));
    const angle = k * golden;
    return { ...loc, nx: Math.cos(angle) * r, ny: Math.sin(angle) * r };
  });
}

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

// --- Compass rose (decorative) ---

function CompassRose({ x, y }: { x: number; y: number }) {
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

// --- One region territory with its markers ---

function Territory({ region, ox, oy }: { region: Region; ox: number; oy: number }) {
  const navigate = useNavigate();
  const cx = ox + CELL_W / 2;
  const cy = oy + CELL_H / 2 + 12;
  const rx = CELL_W * 0.42;
  const ry = CELL_H * 0.32;
  const markers = buildMarkers(region);

  return (
    <g>
      {/* Territory landmass — click to open the region page */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        className="fill-[#e7dcc4] dark:fill-slate-800 stroke-amber-900/30 dark:stroke-slate-600 cursor-pointer transition-colors hover:stroke-amber-600 dark:hover:stroke-amber-500"
        strokeWidth={2}
        onClick={() => navigate(`/lore/regions/${region.id}`)}
      >
        <title>{region.name} (region)</title>
      </ellipse>

      {/* Region name */}
      <text
        x={cx}
        y={oy + 34}
        textAnchor="middle"
        className="fill-slate-800 dark:fill-slate-100 font-serif cursor-pointer"
        fontSize="22"
        fontWeight="700"
        onClick={() => navigate(`/lore/regions/${region.id}`)}
      >
        {region.name}
      </text>

      {/* Location markers */}
      {markers.map((m) => {
        const mx = cx + m.nx * rx * 0.82;
        const my = cy + m.ny * ry * 0.82;
        const style = TYPE_STYLE[m.type];
        return (
          <g
            key={`${m.type}-${m.id}`}
            transform={`translate(${mx} ${my})`}
            className="cursor-pointer transition-transform duration-150 hover:scale-150"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            onClick={() => navigate(`/lore/${style.resource}/${m.id}`)}
          >
            <title>{`${m.name} — ${style.label}`}</title>
            <circle
              r={7}
              className={`${style.fill} stroke-white dark:stroke-slate-900`}
              strokeWidth={2}
            />
            <text
              y={20}
              textAnchor="middle"
              className="fill-slate-700 dark:fill-slate-300 pointer-events-none"
              fontSize="11"
            >
              {truncate(m.name)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// --- The map canvas ---

function RegionMap({ regions, width }: { regions: Region[]; width: number }) {
  const columns = Math.max(1, Math.min(3, Math.floor(width / 420))) || 1;
  const rows = Math.ceil(regions.length / columns);
  const vbW = columns * CELL_W;
  const vbH = rows * CELL_H;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className="rounded-lg border border-amber-900/20 dark:border-slate-700"
      role="img"
      aria-label="Interactive map of regions and their locations"
    >
      {/* Sea / parchment background */}
      <rect x={0} y={0} width={vbW} height={vbH} className="fill-[#dbe6ea] dark:fill-slate-950" />
      {/* Decorative inner frame */}
      <rect
        x={8}
        y={8}
        width={vbW - 16}
        height={vbH - 16}
        rx={6}
        className="fill-none stroke-amber-800/30 dark:stroke-slate-700"
        strokeWidth={2}
      />

      {regions.map((region, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        return <Territory key={region.id} region={region} ox={col * CELL_W} oy={row * CELL_H} />;
      })}

      <CompassRose x={vbW - 46} y={56} />
    </svg>
  );
}

// --- Legend ---

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
      {Object.entries(TYPE_STYLE).map(([key, style]) => (
        <span key={key} className="flex items-center gap-1.5">
          <svg width="14" height="14" aria-hidden>
            <circle cx="7" cy="7" r="6" className={style.fill} />
          </svg>
          {style.label}
        </span>
      ))}
    </div>
  );
}

// --- Page ---

export const MapView = () => {
  const { data: regions, isPending, isError } = useRegions();
  const [ref, width] = useContainerWidth();

  return (
    <div className="animate-in fade-in">
      <h1 className="text-3xl font-serif font-bold mb-1">World Map</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Placeholder cartography — territories and their locations are arranged automatically until
        real maps are added. Click a marker to open it.
      </p>

      <Legend />

      <div ref={ref}>
        {isPending ? (
          <div className="h-[480px] rounded-lg bg-slate-200 dark:bg-slate-900 border border-amber-900/20 dark:border-slate-700 animate-pulse" />
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Could not load the map. Is the backend running?
          </div>
        ) : regions.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-dashed border-amber-900/30 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-center px-6">
            No regions to map yet. Add some in the Django admin and they'll appear here.
          </div>
        ) : width > 0 ? (
          <RegionMap regions={regions} width={width} />
        ) : (
          <div className="h-[480px]" />
        )}
      </div>
    </div>
  );
};
