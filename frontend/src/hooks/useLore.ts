import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type {
  Region,
  Character,
  Family,
  City,
  Town,
  Village,
  GeographyOfInterest,
  PointOfInterest,
} from '../types';

// Centralized query keys for list endpoints. DRF returns plain arrays (no
// pagination configured), so the fetched type is e.g. Region[].
export const loreKeys = {
  regions: ['regions'] as const,
  characters: ['characters'] as const,
  families: ['families'] as const,
};

// --- List hooks (Lore Archive) ---

/** All regions, each with its nested cities/towns/villages/geographies. */
export function useRegions() {
  return useQuery({
    queryKey: loreKeys.regions,
    queryFn: () => apiFetch<Region[]>('/regions/'),
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

// --- Detail hooks (individual entity pages) ---

// Single-resource retrieve. `id` comes from the route as a string and the
// query stays disabled until it's present. The DRF router exposes a retrieve
// endpoint for every registered viewset, so no backend work is needed.
function useDetail<T>(resource: string, id: string | undefined) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => apiFetch<T>(`/${resource}/${id}/`),
    enabled: id !== undefined,
  });
}

export const useCharacter = (id?: string) => useDetail<Character>('characters', id);
export const useRegion = (id?: string) => useDetail<Region>('regions', id);
export const useCity = (id?: string) => useDetail<City>('cities', id);
export const useTown = (id?: string) => useDetail<Town>('towns', id);
export const useVillage = (id?: string) => useDetail<Village>('villages', id);
export const useGeography = (id?: string) =>
  useDetail<GeographyOfInterest>('geographies', id);
export const usePointOfInterest = (id?: string) =>
  useDetail<PointOfInterest>('pois', id);

// Maps a POI's parent `location_type` (the backend model name) to the frontend
// route segment, so the UI can link from a POI back to its parent location.
export const POI_PARENT_RESOURCE: Record<string, string> = {
  region: 'regions',
  city: 'cities',
  town: 'towns',
  village: 'villages',
  geographyofinterest: 'geographies',
};
