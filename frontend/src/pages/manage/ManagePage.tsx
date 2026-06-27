import { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/api';
import { useResourceList, useResourceDetail, useResourceMutations } from '../../hooks/useCrud';
import { CoordinatePicker } from './CoordinatePicker';

// --- Config ---

type FieldType = 'text' | 'textarea' | 'region' | 'poi-parent';
interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
}
interface EntityConfig {
  resource: string;
  label: string;
  labelPlural: string;
  placeable: boolean;
  fields: FieldDef[];
}

const POI_PARENT_TYPES = [
  { value: 'region', label: 'Region', resource: 'regions' },
  { value: 'city', label: 'City', resource: 'cities' },
  { value: 'town', label: 'Town', resource: 'towns' },
  { value: 'village', label: 'Village', resource: 'villages' },
  { value: 'geographyofinterest', label: 'Geography', resource: 'geographies' },
];

const NAME_DESC: FieldDef[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
];
const REGION_FIELD: FieldDef = { name: 'region', label: 'Region', type: 'region' };

const CONFIGS: EntityConfig[] = [
  { resource: 'regions', label: 'Region', labelPlural: 'Regions', placeable: false, fields: NAME_DESC },
  { resource: 'cities', label: 'City', labelPlural: 'Cities', placeable: true, fields: [...NAME_DESC, REGION_FIELD] },
  { resource: 'towns', label: 'Town', labelPlural: 'Towns', placeable: true, fields: [...NAME_DESC, REGION_FIELD] },
  { resource: 'villages', label: 'Village', labelPlural: 'Villages', placeable: true, fields: [...NAME_DESC, REGION_FIELD] },
  { resource: 'geographies', label: 'Geography', labelPlural: 'Geographies', placeable: true, fields: [...NAME_DESC, REGION_FIELD] },
  {
    resource: 'pois',
    label: 'Point of Interest',
    labelPlural: 'Points of Interest',
    placeable: true,
    fields: [...NAME_DESC, { name: 'parent', label: 'Attached to', type: 'poi-parent' }],
  },
];

interface AnyEntity {
  id: number;
  name: string;
  description?: string;
  region?: number;
  location_type?: string;
  location_id?: number;
  location_name?: string | null;
  map_x?: number | null;
  map_y?: number | null;
}

interface ParentImage {
  map_image: string | null;
  map_image_width: number | null;
  map_image_height: number | null;
}

const inputClass =
  'w-full rounded-md border border-amber-900/20 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-600 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-600/40';

// Pull a readable message out of a DRF error response.
function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === 'object') {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(err.data as Record<string, unknown>)) {
      const text = Array.isArray(value) ? value.join(' ') : String(value);
      parts.push(key === 'non_field_errors' || key === 'detail' ? text : `${key}: ${text}`);
    }
    if (parts.length) return parts.join(' · ');
  }
  return 'Something went wrong. Please try again.';
}

// --- Create/edit form ---

function EntityForm({
  config,
  entity,
  onClose,
}: {
  config: EntityConfig;
  entity: AnyEntity | null;
  onClose: () => void;
}) {
  const isEdit = entity !== null;
  const isPoi = config.resource === 'pois';
  const hasRegion = config.fields.some((f) => f.type === 'region');

  const { create, update } = useResourceMutations(config.resource);

  const [name, setName] = useState(entity?.name ?? '');
  const [description, setDescription] = useState(entity?.description ?? '');
  const [regionId, setRegionId] = useState(entity?.region != null ? String(entity.region) : '');
  const [parentType, setParentType] = useState(entity?.location_type ?? 'region');
  const [parentId, setParentId] = useState(entity?.location_id != null ? String(entity.location_id) : '');
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(
    entity?.map_x != null && entity?.map_y != null ? { x: entity.map_x, y: entity.map_y } : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regions = useResourceList<AnyEntity>('regions');
  const parentResource = isPoi
    ? POI_PARENT_TYPES.find((t) => t.value === parentType)?.resource ?? 'regions'
    : 'regions';
  const parentInstances = useResourceList<AnyEntity>(parentResource);

  // The parent whose map image the picker uses.
  const mapParentId = isPoi ? parentId : regionId;
  const parentImage = useResourceDetail<ParentImage>(
    parentResource,
    config.placeable ? mapParentId : undefined,
  );

  const submitting = create.isPending || update.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Name is required.');

    const data: Record<string, unknown> = { name: name.trim(), description };
    if (hasRegion) {
      if (!regionId) return setError('Please choose a region.');
      data.region = Number(regionId);
    }
    if (isPoi) {
      if (!parentId) return setError('Please choose what this is attached to.');
      data.parent_type = parentType;
      data.parent_id = Number(parentId);
    }
    if (config.placeable) {
      data.map_x = coords?.x ?? null;
      data.map_y = coords?.y ?? null;
    }

    const handlers = { onSuccess: onClose, onError: (err: unknown) => setError(errorMessage(err)) };
    if (isEdit) update.mutate({ id: entity.id, data }, handlers);
    else create.mutate(data, handlers);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h2 className="text-xl font-serif font-bold">
        {isEdit ? `Edit ${config.label}` : `New ${config.label}`}
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-y`} />
      </div>

      {hasRegion && (
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className={inputClass}>
            <option value="">— choose a region —</option>
            {regions.data?.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      {isPoi && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Attached to</label>
            <select
              value={parentType}
              onChange={(e) => { setParentType(e.target.value); setParentId(''); }}
              className={inputClass}
            >
              {POI_PARENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Which one</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
              <option value="">— choose —</option>
              {parentInstances.data?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {config.placeable && (
        <div>
          <label className="block text-sm font-medium mb-1">Map position</label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {coords ? `x ${coords.x.toFixed(3)}, y ${coords.y.toFixed(3)}` : 'Not placed'}
            </span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={!mapParentId}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-amber-900/20 dark:border-slate-700 hover:border-amber-600 dark:hover:border-amber-500 disabled:opacity-50 transition-colors"
            >
              <MapPin className="h-4 w-4" /> Place on map
            </button>
            {coords && (
              <button type="button" onClick={() => setCoords(null)} className="text-sm text-slate-500 hover:text-red-600">
                clear
              </button>
            )}
          </div>
          {!mapParentId && (
            <p className="text-xs text-slate-400 mt-1">Choose a {isPoi ? 'parent' : 'region'} first.</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-sm font-medium transition-colors"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          Cancel
        </button>
      </div>

      {pickerOpen && (
        <CoordinatePicker
          imageUrl={parentImage.data?.map_image ?? null}
          imageWidth={parentImage.data?.map_image_width ?? null}
          imageHeight={parentImage.data?.map_image_height ?? null}
          value={coords}
          onPick={(x, y) => setCoords({ x, y })}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </form>
  );
}

// --- List ---

function EntityList({ config, onEdit }: { config: EntityConfig; onEdit: (e: AnyEntity) => void }) {
  const list = useResourceList<AnyEntity>(config.resource);
  const { remove } = useResourceMutations(config.resource);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (list.isPending) return <p className="text-sm text-slate-400">Loading…</p>;
  if (list.isError) return <p className="text-sm text-red-600 dark:text-red-400">Could not load. Is the backend running?</p>;
  if (list.data.length === 0) return <p className="text-sm text-slate-400 italic">None yet.</p>;

  return (
    <ul className="divide-y divide-amber-900/10 dark:divide-slate-800 border border-amber-900/10 dark:border-slate-800 rounded-lg">
      {list.data.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2">
          <span className="text-sm">
            {item.name}
            {item.location_name && (
              <span className="text-slate-400"> — {item.location_name}</span>
            )}
            {(item.map_x != null && item.map_y != null) && (
              <MapPin className="inline h-3 w-3 ml-1.5 text-amber-600" />
            )}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(item)} aria-label="Edit" className="p-1.5 rounded text-slate-500 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Pencil className="h-4 w-4" />
            </button>
            {confirmId === item.id ? (
              <>
                <button onClick={() => remove.mutate(item.id, { onSuccess: () => setConfirmId(null) })} className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
                <button onClick={() => setConfirmId(null)} className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
              </>
            ) : (
              <button onClick={() => setConfirmId(item.id)} aria-label="Delete" className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- Page ---

export const ManagePage = () => {
  const { isStaff, isLoading } = useAuth();
  const [configIdx, setConfigIdx] = useState(0);
  const [editing, setEditing] = useState<AnyEntity | 'new' | null>(null);
  const config = CONFIGS[configIdx];

  if (isLoading) return <div className="py-20 text-center text-slate-400">Loading…</div>;
  if (!isStaff) {
    return (
      <div className="py-20 flex flex-col items-center text-center gap-3">
        <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-500" />
        <h1 className="text-xl font-serif font-bold">Staff only</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">This page is restricted to staff accounts.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in">
      <h1 className="text-3xl font-serif font-bold mb-1">Manage</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Create, edit, and place world entities. Staff only.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-48 shrink-0">
          <ul className="flex flex-wrap md:flex-col gap-1">
            {CONFIGS.map((c, i) => (
              <li key={c.resource}>
                <button
                  onClick={() => { setConfigIdx(i); setEditing(null); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    i === configIdx
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.labelPlural}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 min-w-0">
          {editing ? (
            <EntityForm config={config} entity={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-serif font-bold">{config.labelPlural}</h2>
                <button
                  onClick={() => setEditing('new')}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" /> New {config.label}
                </button>
              </div>
              <EntityList config={config} onEdit={(e) => setEditing(e)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
