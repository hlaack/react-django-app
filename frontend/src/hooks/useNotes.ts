import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ensureCsrfToken } from '../lib/api';
import type { UserNote } from '../types';

// Notes are scoped per page via the `page_url` query param. Keys include the
// page so each page's note list caches and invalidates independently.
export const noteKeys = {
  all: ['notes'] as const,
  byPage: (pageUrl: string) => ['notes', pageUrl] as const,
};

/**
 * The current user's notes for a single page. `enabled` should reflect auth
 * state — there's no point querying /user-notes/ while logged out (it 403s).
 */
export function useNotes(pageUrl: string, enabled: boolean) {
  return useQuery({
    queryKey: noteKeys.byPage(pageUrl),
    queryFn: () =>
      apiFetch<UserNote[]>(`/user-notes/?page_url=${encodeURIComponent(pageUrl)}`),
    enabled,
  });
}

/** Create a note on the given page. The backend attaches the logged-in user. */
export function useCreateNote(pageUrl: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      await ensureCsrfToken();
      return apiFetch<UserNote>('/user-notes/', {
        method: 'POST',
        json: { content, page_url: pageUrl },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byPage(pageUrl) });
    },
  });
}

/** Edit the content of an existing note. */
export function useUpdateNote(pageUrl: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      await ensureCsrfToken();
      return apiFetch<UserNote>(`/user-notes/${id}/`, {
        method: 'PATCH',
        json: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byPage(pageUrl) });
    },
  });
}

/** Delete a note. */
export function useDeleteNote(pageUrl: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await ensureCsrfToken();
      await apiFetch<void>(`/user-notes/${id}/`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byPage(pageUrl) });
    },
  });
}
