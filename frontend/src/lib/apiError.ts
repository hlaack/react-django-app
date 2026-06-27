import { ApiError } from './api';

/** Pull a readable message out of a DRF error response body. */
export function errorMessage(err: unknown): string {
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
