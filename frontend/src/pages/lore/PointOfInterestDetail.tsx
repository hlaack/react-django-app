import { useParams } from 'react-router-dom';
import { Breadcrumb, type Crumb } from '../../components/Breadcrumb';
import { usePointOfInterest, POI_PARENT_RESOURCE } from '../../hooks/useLore';
import { DetailLoading, DetailError } from './detailCommon';

const BASE_TRAIL: Crumb[] = [
  { label: 'Home', to: '/' },
  { label: 'Lore Archive', to: '/lore' },
];

export const PointOfInterestDetail = () => {
  const { id } = useParams();
  const { data: poi, isPending, isError } = usePointOfInterest(id);

  if (isPending) return <DetailLoading trail={BASE_TRAIL} />;
  if (isError || !poi) {
    return <DetailError trail={BASE_TRAIL} message="This point of interest could not be found." />;
  }

  // Link back to the parent location (region/city/town/village/geography).
  const parentResource = POI_PARENT_RESOURCE[poi.location_type];
  const trail: Crumb[] = [...BASE_TRAIL];
  if (parentResource && poi.location_name) {
    trail.push({ label: poi.location_name, to: `/lore/${parentResource}/${poi.location_id}` });
  }

  return (
    <article className="animate-in fade-in">
      <Breadcrumb items={[...trail, { label: poi.name }]} />

      <p className="text-sm uppercase tracking-wide text-amber-700 dark:text-amber-500 mb-1">
        Point of Interest
      </p>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{poi.name}</h1>

      {poi.description ? (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-w-3xl">
          {poi.description}
        </p>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 italic">No description yet.</p>
      )}
    </article>
  );
};
