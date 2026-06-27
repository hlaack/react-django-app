// TypeScript interfaces mirroring the Django REST Framework serializers in
// backend/api/serializers.py. Keep these in sync with the backend: if a
// serializer's `fields` change, update the matching interface here.

// --- Geography & Locations ---

/** Fractional (0-1) position on the parent's map; null = auto-placed. */
export interface MapPlaceable {
  map_x: number | null;
  map_y: number | null;
}

/** An entity that can carry its own uploaded map image. */
export interface MapImaged {
  map_image: string | null; // relative media URL, or null
  map_image_width: number | null;
  map_image_height: number | null;
}

/** A named feature attached to a region (mountain range, forest, etc.). */
export interface GeographyOfInterest extends MapPlaceable, MapImaged {
  id: number;
  name: string;
  description: string;
  region: number; // Region id
  points_of_interest: PointOfInterest[];
}

export interface City extends MapPlaceable, MapImaged {
  id: number;
  name: string;
  description: string;
  region: number; // Region id
  points_of_interest: PointOfInterest[];
}

export interface Town extends MapPlaceable, MapImaged {
  id: number;
  name: string;
  description: string;
  region: number; // Region id
  points_of_interest: PointOfInterest[];
}

export interface Village extends MapPlaceable, MapImaged {
  id: number;
  name: string;
  description: string;
  region: number; // Region id
  points_of_interest: PointOfInterest[];
}

/**
 * A region with its child locations nested. A single GET /api/regions/<id>/
 * returns everything needed to plot the map for that region.
 */
export interface Region extends MapImaged {
  id: number;
  name: string;
  description: string;
  cities: City[];
  towns: Town[];
  villages: Village[];
  geographies: GeographyOfInterest[];
  points_of_interest: PointOfInterest[];
}

/**
 * A point of interest. On the backend it attaches to exactly one location via a
 * generic foreign key; the serializer flattens that into the parent's type, id,
 * and display name so the UI can render and link back to it.
 */
export interface PointOfInterest extends MapPlaceable {
  id: number;
  name: string;
  description: string;
  location_type: string; // model name: "region" | "city" | "town" | "village" | "geographyofinterest"
  location_id: number;
  location_name: string | null;
}

// --- Characters & Lore ---

export interface Family {
  id: number;
  name: string;
  description: string;
}

export interface Character {
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  families: Family[]; // full objects, not just ids
  parents: number[]; // Character ids
  children: number[]; // Character ids
  spouses: number[]; // Character ids (symmetrical)
}

// --- Auth & User features ---

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserNote {
  id: number;
  user: string; // username (read-only on the backend)
  content: string;
  page_url: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
