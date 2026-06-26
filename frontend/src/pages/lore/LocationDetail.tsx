import { useParams } from 'react-router-dom';
import { Breadcrumb, type Crumb } from '../../components/Breadcrumb';
import {
  useRegion,
  useCity,
  useTown,
  useVillage,
  useGeography,
} from '../../hooks/useLore';
import { DetailLoading, DetailError, PoiList } from './detailCommon';
import type { PointOfInterest } from '../../types';

// City, Town, Village, and Geography all share this shape.
interface LocationLike {
  id: number;
  name: string;
  description: string;
  region: number;
  points_of_interest: PointOfInterest[];
}

const BASE_TRAIL: Crumb[] = [
  { label: 'Home', to: '/' },
  { label: 'Lore Archive', to: '/lore' },
];

function LocationDetail({
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
  // Fetch the parent region for the breadcrumb / context. Disabled until we
  // know the region id, so it's safe to call before `data` has loaded.
  const region = useRegion(data ? String(data.region) : undefined);

  if (isPending) return <DetailLoading trail={BASE_TRAIL} />;
  if (isError || !data) {
    return <DetailError trail={BASE_TRAIL} message={`This ${label.toLowerCase()} could not be found.`} />;
  }

  const trail: Crumb[] = [...BASE_TRAIL];
  if (region.data) {
    trail.push({ label: region.data.name, to: `/lore/regions/${region.data.id}` });
  }

  return (
    <article className="animate-in fade-in">
      <Breadcrumb items={[...trail, { label: data.name }]} />

      <p className="text-sm uppercase tracking-wide text-amber-700 dark:text-amber-500 mb-1">
        {label}
      </p>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{data.name}</h1>

      {data.description ? (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-w-3xl mb-8">
          {data.description}
        </p>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 italic mb-8">No description yet.</p>
      )}

      <PoiList items={data.points_of_interest} />
    </article>
  );
}

// Route wrappers — each calls its own hook unconditionally, then hands the
// common fields to LocationDetail.

export const CityDetail = () => {
  const q = useCity(useParams().id);
  return <LocationDetail label="City" data={q.data} isPending={q.isPending} isError={q.isError} />;
};

export const TownDetail = () => {
  const q = useTown(useParams().id);
  return <LocationDetail label="Town" data={q.data} isPending={q.isPending} isError={q.isError} />;
};

export const VillageDetail = () => {
  const q = useVillage(useParams().id);
  return <LocationDetail label="Village" data={q.data} isPending={q.isPending} isError={q.isError} />;
};

export const GeographyDetail = () => {
  const q = useGeography(useParams().id);
  return (
    <LocationDetail
      label="Geography of Interest"
      data={q.data}
      isPending={q.isPending}
      isError={q.isError}
    />
  );
};
