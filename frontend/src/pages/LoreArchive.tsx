import { Users, BookOpen, AlertCircle } from 'lucide-react';
import { useCharacters, useRegions } from '../hooks/useLore';
import type { Character, Region } from '../types';

// --- Shared presentational helpers ---

const cardClass =
  'p-5 rounded-lg bg-white dark:bg-slate-900 border border-amber-900/10 dark:border-slate-800 shadow-sm';

function SectionHeading({ icon: Icon, title }: { icon: typeof Users; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-2xl font-serif font-bold mb-4">
      <Icon className="h-6 w-6 text-amber-700 dark:text-amber-500" />
      {title}
    </h2>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className={cardClass}>
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-3" />
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
          <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-slate-500 dark:text-slate-400 italic">{message}</p>
  );
}

// --- Cards ---

function CharacterCard({ character }: { character: Character }) {
  const fullName = `${character.first_name} ${character.last_name}`.trim();
  return (
    <article className={cardClass}>
      <h3 className="font-serif font-bold text-lg mb-1">{fullName}</h3>
      {character.families.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {character.families.map((family) => (
            <span
              key={family.id}
              className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
            >
              {family.name}
            </span>
          ))}
        </div>
      )}
      {character.bio ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">{character.bio}</p>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No bio recorded.</p>
      )}
    </article>
  );
}

function RegionCard({ region }: { region: Region }) {
  const locationCount =
    region.cities.length + region.towns.length + region.villages.length;
  return (
    <article className={cardClass}>
      <h3 className="font-serif font-bold text-lg mb-1">{region.name}</h3>
      {locationCount > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {region.cities.length} cities · {region.towns.length} towns ·{' '}
          {region.villages.length} villages
        </p>
      )}
      {region.description ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">{region.description}</p>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No description yet.</p>
      )}
    </article>
  );
}

// --- Page ---

export const LoreArchive = () => {
  const characters = useCharacters();
  const regions = useRegions();

  return (
    <div className="animate-in fade-in space-y-12">
      <h1 className="text-3xl font-serif font-bold">Lore Archive</h1>

      <section>
        <SectionHeading icon={Users} title="Characters" />
        {characters.isPending ? (
          <LoadingSkeleton />
        ) : characters.isError ? (
          <ErrorState message="Could not load characters. Is the backend running?" />
        ) : characters.data.length === 0 ? (
          <EmptyState message="No characters have been recorded yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.data.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading icon={BookOpen} title="Regions & World Lore" />
        {regions.isPending ? (
          <LoadingSkeleton />
        ) : regions.isError ? (
          <ErrorState message="Could not load regions. Is the backend running?" />
        ) : regions.data.length === 0 ? (
          <EmptyState message="No regions have been mapped yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.data.map((region) => (
              <RegionCard key={region.id} region={region} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
