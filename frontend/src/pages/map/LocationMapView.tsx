import { useParams } from 'react-router-dom';
import { type Crumb } from '../../components/Breadcrumb';
import { useRegion, useCity, useTown, useVillage, useGeography } from '../../hooks/useLore';
import { ScopeMap } from './ScopeMap';
import { MapSkeleton, MapErrorBox, type MapMarker } from './mapShared';
import type { PointOfInterest } from '../../types';

const MAP_HOME: Crumb = { label: 'Map', to: '/map' };

// City, Town, Village, and Geography all share this shape.
interface LocationLike {
  id: number;
  name: string;
  region: number;
  points_of_interest: PointOfInterest[];
}

function LocationMapView({
  label,
  data,
  isPending,
  isError,
}: {
  label: string;
  data: LocationLike | undefined;
  isPending: boolean;
  isError: boolean;
}) {
  // Parent region, for the breadcrumb. Disabled until we know its id.
  const region = useRegion(data ? String(data.region) : undefined);

  if (isPending) return <MapSkeleton breadcrumb={[MAP_HOME]} />;
  if (isError || !data) {
    return <MapErrorBox breadcrumb={[MAP_HOME]} message={`This ${label.toLowerCase()} could not be found.`} />;
  }

  const breadcrumb: Crumb[] = [MAP_HOME];
  if (region.data) {
    breadcrumb.push({ label: region.data.name, to: `/lore/regions/${region.data.id}` });
  }
  breadcrumb.push({ label: data.name });

  const markers: MapMarker[] = data.points_of_interest.map((p) => ({
    key: `poi-${p.id}`,
    name: p.name,
    type: 'poi',
    to: `/lore/pois/${p.id}`,
    drill: false,
  }));

  return (
    <ScopeMap
      breadcrumb={breadcrumb}
      title={data.name}
      subtitle={`${label} — its points of interest. Click one to open its page.`}
      markers={markers}
    />
  );
}

// Route wrappers — each calls its own hook, then hands the common fields down.

export const CityMapView = () => {
  const q = useCity(useParams().id);
  return <LocationMapView label="City" data={q.data} isPending={q.isPending} isError={q.isError} />;
};

export const TownMapView = () => {
  const q = useTown(useParams().id);
  return <LocationMapView label="Town" data={q.data} isPending={q.isPending} isError={q.isError} />;
};

export const VillageMapView = () => {
  const q = useVillage(useParams().id);
  return <LocationMapView label="Village" data={q.data} isPending={q.isPending} isError={q.isError} />;
};

export const GeographyMapView = () => {
  const q = useGeography(useParams().id);
  return (
    <LocationMapView label="Geography" data={q.data} isPending={q.isPending} isError={q.isError} />
  );
};
