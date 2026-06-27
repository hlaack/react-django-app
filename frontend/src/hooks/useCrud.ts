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

export function useResourceMutations(resource: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries();

  const create = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await ensureCsrfToken();
      return apiFetch(`/${resource}/`, { method: 'POST', json: data });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      await ensureCsrfToken();
      return apiFetch(`/${resource}/${id}/`, { method: 'PATCH', json: data });
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
