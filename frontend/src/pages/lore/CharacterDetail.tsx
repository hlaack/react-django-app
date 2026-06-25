import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useCharacter } from '../../hooks/useLore';
import { DetailLoading, DetailError } from './detailCommon';

const TRAIL = [
  { label: 'Home', to: '/' },
  { label: 'Lore Archive', to: '/lore' },
];

export const CharacterDetail = () => {
  const { id } = useParams();
  const { data: character, isPending, isError } = useCharacter(id);

  if (isPending) return <DetailLoading trail={TRAIL} />;
  if (isError || !character) {
    return <DetailError trail={TRAIL} message="This character could not be found." />;
  }

  const fullName = `${character.first_name} ${character.last_name}`.trim();

  return (
    <article className="animate-in fade-in">
      <Breadcrumb items={[...TRAIL, { label: fullName }]} />

      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{fullName}</h1>

      {character.families.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {character.families.map((family) => (
            <span
              key={family.id}
              className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
            >
              {family.name}
            </span>
          ))}
        </div>
      )}

      {character.bio ? (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-w-3xl">
          {character.bio}
        </p>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 italic">No bio recorded.</p>
      )}
    </article>
  );
};
