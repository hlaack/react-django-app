import { useRegions } from '../hooks/useLore';
import { ScopeMap } from './map/ScopeMap';
import { MapSkeleton, MapErrorBox, type MapMarker } from './map/mapShared';

// World level: every region as a drillable pin. Clicking one opens its map.
export const MapView = () => {
  const { data: regions, isPending, isError } = useRegions();

  if (isPending) return <MapSkeleton />;
  if (isError) return <MapErrorBox message="Could not load the map. Is the backend running?" />;

  const markers: MapMarker[] = regions.map((region) => ({
    key: `region-${region.id}`,
    name: region.name,
    type: 'region',
    to: `/map/regions/${region.id}`,
    drill: true,
  }));

  return (
    <ScopeMap
      title="World Map"
      subtitle="Placeholder cartography — click a region to explore its cities, towns, villages, and landmarks."
      markers={markers}
    />
  );
};
