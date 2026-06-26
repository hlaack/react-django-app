import { useNavigate } from 'react-router-dom';
import { Breadcrumb, type Crumb } from '../../components/Breadcrumb';
import {
  MapCanvas,
  MapLegend,
  MarkerPin,
  phyllotaxis,
  VB_W,
  VB_H,
  type MapMarker,
  type MarkerType,
} from './mapShared';

// Renders one scope (the whole world, a region, or a location) as a backdrop
// territory with its children plotted as pins. Clicking a pin either drills
// into a sub-map or opens a leaf detail page (decided by the marker's `to`).
export function ScopeMap({
  breadcrumb,
  title,
  subtitle,
  markers,
}: {
  breadcrumb?: Crumb[];
  title: string;
  subtitle?: string;
  markers: MapMarker[];
}) {
  const navigate = useNavigate();

  const cx = VB_W / 2;
  const cy = VB_H / 2 + 6;
  const rx = VB_W * 0.44;
  const ry = VB_H * 0.4;
  const placed = phyllotaxis(markers.length);

  const typesPresent = [...new Set(markers.map((m) => m.type))] as MarkerType[];
  const anyDrill = markers.some((m) => m.drill);

  return (
    <div className="animate-in fade-in">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <h1 className="text-3xl font-serif font-bold mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{subtitle}</p>}

      {markers.length > 0 && <MapLegend types={typesPresent} drillable={anyDrill} />}

      <MapCanvas ariaLabel={`Map of ${title}`}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          className="fill-[#e7dcc4] dark:fill-slate-800 stroke-amber-900/30 dark:stroke-slate-600"
          strokeWidth={2}
        />

        {markers.length === 0 ? (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 italic"
            fontSize="16"
          >
            Nothing has been mapped here yet.
          </text>
        ) : (
          markers.map((marker, i) => {
            const mx = cx + placed[i].nx * rx * 0.8;
            const my = cy + placed[i].ny * ry * 0.8;
            return (
              <MarkerPin
                key={marker.key}
                x={mx}
                y={my}
                marker={marker}
                onClick={() => navigate(marker.to)}
              />
            );
          })
        )}
      </MapCanvas>
    </div>
  );
}
