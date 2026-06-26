import { useParams } from 'react-router-dom';
import { type Crumb } from '../../components/Breadcrumb';
import { useRegion } from '../../hooks/useLore';
import { ScopeMap } from './ScopeMap';
import { MapSkeleton, MapErrorBox, type MapMarker } from './mapShared';

const WORLD: Crumb = { label: 'World Map', to: '/map' };

// Region level: its cities/towns/villages/geographies drill into their own
// maps; the region's own points of interest are leaves.
export const RegionMapView = () => {
  const { id } = useParams();
  const { data: region, isPending, isError } = useRegion(id);

  if (isPending) return <MapSkeleton breadcrumb={[WORLD]} />;
  if (isError || !region) {
    return <MapErrorBox breadcrumb={[WORLD]} message="This region could not be found." />;
  }

  const markers: MapMarker[] = [
    ...region.cities.map((c) => ({ key: `city-${c.id}`, name: c.name, type: 'city' as const, to: `/map/cities/${c.id}`, drill: true, x: c.map_x, y: c.map_y })),
    ...region.towns.map((t) => ({ key: `town-${t.id}`, name: t.name, type: 'town' as const, to: `/map/towns/${t.id}`, drill: true, x: t.map_x, y: t.map_y })),
    ...region.villages.map((v) => ({ key: `village-${v.id}`, name: v.name, type: 'village' as const, to: `/map/villages/${v.id}`, drill: true, x: v.map_x, y: v.map_y })),
    ...region.geographies.map((g) => ({ key: `geo-${g.id}`, name: g.name, type: 'geography' as const, to: `/map/geographies/${g.id}`, drill: true, x: g.map_x, y: g.map_y })),
    ...region.points_of_interest.map((p) => ({ key: `poi-${p.id}`, name: p.name, type: 'poi' as const, to: `/lore/pois/${p.id}`, drill: false, x: p.map_x, y: p.map_y })),
  ];

  return (
    <ScopeMap
      breadcrumb={[WORLD, { label: region.name }]}
      title={region.name}
      subtitle="Click a place to open its map; points of interest open their page."
      markers={markers}
      backgroundImage={region.map_image}
      imageWidth={region.map_image_width}
      imageHeight={region.map_image_height}
    />
  );
};
