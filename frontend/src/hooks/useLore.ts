import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { Region, Character, Family } from '../types';

// Centralized query keys so reads and future cache invalidations stay in sync.
// DRF list endpoints return plain arrays (no pagination configured), so the
// fetched type is e.g. Region[], not a paginated envelope.
export const loreKeys = {
  regions: ['regions'] as const,
  region: (id: number) => ['regions', id] as const,
  characters: ['characters'] as const,
  families: ['families'] as const,
};

/** All regions, each with its nested cities/towns/villages/geographies. */
export function useRegions() {
  return useQuery({
    queryKey: loreKeys.regions,
    queryFn: () => apiFetch<Region[]>('/regions/'),
  });
}

/** A single region by id, with its nested locations. */
export function useRegion(id: number | undefined) {
  return useQuery({
    queryKey: loreKeys.region(id as number),
    queryFn: () => apiFetch<Region>(`/regions/${id}/`),
    enabled: id !== undefined,
  });
}

/** All characters, each with their full family objects. */
export function useCharacters() {
  return useQuery({
    queryKey: loreKeys.characters,
    queryFn: () => apiFetch<Character[]>('/characters/'),
  });
}

/** All families. */
export function useFamilies() {
  return useQuery({
    queryKey: loreKeys.families,
    queryFn: () => apiFetch<Family[]>('/families/'),
  });
}
