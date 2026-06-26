import { Link } from 'react-router-dom';
import { Building2, Home, Tent, Mountain, MapPin, AlertCircle } from 'lucide-react';
import { useRegions } from '../hooks/useLore';

// The top-level map is now a hierarchical directory: each region with its
// cities/towns/villages/geographies grouped beneath it. Each entry links to
// that place's individual map; region headers link to the region's lore page.

interface LocationLite {
  id: number;
  name: string;
  points_of_interest: { id: number }[];
}

function LocationCard({ resource, item }: { resource: string; item: LocationLite }) {
  const count = item.points_of_interest.length;
  return (
    <Link
      to={`/map/${resource}/${item.id}`}
      className="flex flex-col gap-0.5 px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-amber-900/10 dark:border-slate-800 hover:border-amber-600 dark:hover:border-amber-500 transition-colors min-w-[140px]"
    >
      <span className="font-medium text-sm">{item.name}</span>
      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <MapPin className="h-3 w-3" />
        {count} {count === 1 ? 'point of interest' : 'points of interest'}
      </span>
    </Link>
  );
}

function LocationGroup({
  title,
  icon: Icon,
  resource,
  items,
}: {
  title: string;
  icon: typeof Building2;
  resource: string;
  items: LocationLite[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
        <Icon className="h-4 w-4 text-amber-700 dark:text-amber-500" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <LocationCard key={item.id} resource={resource} item={item} />
        ))}
      </div>
    </div>
  );
}

export const MapView = () => {
  const { data: regions, isPending, isError } = useRegions();

  return (
    <div className="animate-in fade-in">
      <h1 className="text-3xl font-serif font-bold mb-1">Interactive Map</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Browse the world by region, then open a place to view its map.
      </p>

      {isPending ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-slate-200 dark:bg-slate-900 border border-amber-900/20 dark:border-slate-700 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Could not load the map. Is the backend running?
        </div>
      ) : regions.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-dashed border-amber-900/30 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-center px-6">
          No regions yet. Add some in the Django admin and they'll appear here.
        </div>
      ) : (
        <div className="space-y-8">
          {regions.map((region) => {
            const hasLocations =
              region.cities.length +
                region.towns.length +
                region.villages.length +
                region.geographies.length >
              0;
            return (
              <section
                key={region.id}
                className="border-t border-amber-900/15 dark:border-slate-800 pt-4"
              >
                <h2 className="text-2xl font-serif font-bold mb-3">
                  <Link
                    to={`/lore/regions/${region.id}`}
                    className="hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                  >
                    {region.name}
                  </Link>
                </h2>
                {hasLocations ? (
                  <div className="space-y-4">
                    <LocationGroup title="Cities" icon={Building2} resource="cities" items={region.cities} />
                    <LocationGroup title="Towns" icon={Home} resource="towns" items={region.towns} />
                    <LocationGroup title="Villages" icon={Tent} resource="villages" items={region.villages} />
                    <LocationGroup
                      title="Geographies of Interest"
                      icon={Mountain}
                      resource="geographies"
                      items={region.geographies}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                    No mapped locations in this region yet.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
