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

// Reference width for an image-backed map. The viewBox height matches the
// image's aspect ratio so the picture isn't distorted, while keeping marker
// sizes in a consistent ~1000-unit space.
const REF_W = 1000;

// Renders one scope (the whole world, a region, or a location). With a
// background image it draws that image and places markers by their stored
// coordinates; otherwise it falls back to a procedural territory with markers
// auto-placed in a phyllotaxis spiral.
export function ScopeMap({
  breadcrumb,
  title,
  subtitle,
  markers,
  backgroundImage,
  imageWidth,
  imageHeight,
}: {
  breadcrumb?: Crumb[];
  title: string;
  subtitle?: string;
  markers: MapMarker[];
  backgroundImage?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
}) {
  const navigate = useNavigate();

  const hasImage = Boolean(backgroundImage && imageWidth && imageHeight);
  const vbW = hasImage ? REF_W : VB_W;
  const vbH = hasImage ? Math.round(REF_W * (imageHeight! / imageWidth!)) : VB_H;

  const cx = vbW / 2;
  const cy = hasImage ? vbH / 2 : VB_H / 2 + 6;
  const rx = VB_W * 0.44; // procedural territory ellipse
  const ry = VB_H * 0.4;
  const spreadX = hasImage ? vbW * 0.4 : rx * 0.8; // fallback spread
  const spreadY = hasImage ? vbH * 0.4 : ry * 0.8;

  const placed = phyllotaxis(markers.length);
  const positionOf = (marker: MapMarker, i: number) => {
    if (marker.x != null && marker.y != null) {
      return { mx: marker.x * vbW, my: marker.y * vbH };
    }
    return { mx: cx + placed[i].nx * spreadX, my: cy + placed[i].ny * spreadY };
  };

  const typesPresent = [...new Set(markers.map((m) => m.type))] as MarkerType[];
  const anyDrill = markers.some((m) => m.drill);

  return (
    <div className="animate-in fade-in">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <h1 className="text-3xl font-serif font-bold mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{subtitle}</p>}

      {markers.length > 0 && <MapLegend types={typesPresent} drillable={anyDrill} />}

      <MapCanvas ariaLabel={`Map of ${title}`} vbW={vbW} vbH={vbH}>
        {hasImage ? (
          <image href={backgroundImage!} x={0} y={0} width={vbW} height={vbH} preserveAspectRatio="none" />
        ) : (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            className="fill-[#e7dcc4] dark:fill-slate-800 stroke-amber-900/30 dark:stroke-slate-600"
            strokeWidth={2}
          />
        )}

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
            const { mx, my } = positionOf(marker, i);
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
