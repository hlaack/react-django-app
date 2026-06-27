import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ensureCsrfToken } from '../lib/api';

// Generic list + CRUD over a DRF resource (e.g. "cities"). Used by the staff
// management page. Entities cross-reference each other (a city appears nested
// in its region), so mutations invalidate everything for simplicity.

export function useResourceList<T>(resource: string) {
  return useQuery({
    queryKey: [resource],
    queryFn: () => apiFetch<T[]>(`/${resource}/`),
  });
}

export function useResourceDetail<T>(resource: string, id: number | string | null | undefined) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => apiFetch<T>(`/${resource}/${id}/`),
    enabled: id != null && id !== '',
  });
}

// A payload that contains a File must go out as multipart/form-data; anything
// else is sent as JSON. Returns the apiFetch options for whichever applies.
function bodyOptions(data: Record<string, unknown>): { json: unknown } | { form: FormData } {
  const hasFile = Object.values(data).some((v) => v instanceof File);
  if (!hasFile) return { json: data };

  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue; // omit; clearing goes via JSON null
    if (value instanceof File) form.append(key, value);
    else if (Array.isArray(value)) value.forEach((v) => form.append(key, String(v)));
    else form.append(key, String(value));
  }
  return { form };
}

export function useResourceMutations(resource: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries();

  const create = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await ensureCsrfToken();
      return apiFetch(`/${resource}/`, { method: 'POST', ...bodyOptions(data) });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      await ensureCsrfToken();
      return apiFetch(`/${resource}/${id}/`, { method: 'PATCH', ...bodyOptions(data) });
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await ensureCsrfToken();
      await apiFetch<void>(`/${resource}/${id}/`, { method: 'DELETE' });
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
