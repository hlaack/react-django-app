import { Link, useParams } from 'react-router-dom';
import { Building2, Home, Tent, Mountain } from 'lucide-react';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useRegion } from '../../hooks/useLore';
import { DetailLoading, DetailError } from './detailCommon';

const TRAIL = [
  { label: 'Home', to: '/' },
  { label: 'Lore Archive', to: '/lore' },
];

interface LocationLite {
  id: number;
  name: string;
}

// One labeled group of child locations, each linking to its own page.
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
    <section>
      <h2 className="flex items-center gap-2 text-xl font-serif font-bold mb-3">
        <Icon className="h-5 w-5 text-amber-700 dark:text-amber-500" />
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={`/lore/${resource}/${item.id}`}
              className="inline-block px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-amber-900/10 dark:border-slate-800 text-sm hover:border-amber-600 dark:hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const RegionDetail = () => {
  const { id } = useParams();
  const { data: region, isPending, isError } = useRegion(id);

  if (isPending) return <DetailLoading trail={TRAIL} />;
  if (isError || !region) {
    return <DetailError trail={TRAIL} message="This region could not be found." />;
  }

  const hasLocations =
    region.cities.length +
      region.towns.length +
      region.villages.length +
      region.geographies.length >
    0;

  return (
    <article className="animate-in fade-in">
      <Breadcrumb items={[...TRAIL, { label: region.name }]} />

      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{region.name}</h1>

      {region.description ? (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-w-3xl mb-8">
          {region.description}
        </p>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 italic mb-8">No description yet.</p>
      )}

      {hasLocations ? (
        <div className="space-y-6">
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
          No locations mapped in this region yet.
        </p>
      )}
    </article>
  );
};
