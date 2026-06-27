// Shared fetch wrapper for talking to the Django/DRF backend.
//
// Responsibilities:
//   - Prefix requests with the API base path (Vite proxies /api -> Django).
//   - Always send cookies (`credentials: 'include'`) for session auth.
//   - Inject the CSRF token on unsafe methods, read FRESH from the cookie on
//     every call. Django rotates the csrftoken on login, so a cached token
//     would cause post-login writes to 403.
//   - Parse JSON and surface failures as a typed ApiError.

const API_BASE = '/api';

// HTTP methods that Django's CSRF protection does not require a token for.
const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

/** Read a cookie value by name, or null if absent. */
function getCookie(name: string): string | null {
  if (!document.cookie) return null;
  for (const cookie of document.cookie.split(';')) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name + '=')) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return null;
}

/** Error thrown for any non-2xx response. Carries the status and parsed body. */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Plain object sent as a JSON body. */
  json?: unknown;
  /** Multipart body (e.g. for file uploads). Content-Type is left unset so the
   *  browser can add the multipart boundary itself. */
  form?: FormData;
}

/**
 * Perform an API request and return the parsed JSON body as T.
 * Throws ApiError on any non-2xx response.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, form, headers, method = 'GET', ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (json !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  // Note: never set Content-Type for `form` — the browser supplies the
  // multipart boundary automatically.
  if (!CSRF_SAFE_METHODS.has(method.toUpperCase())) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) finalHeaders.set('X-CSRFToken', csrfToken);
  }

  const body = json !== undefined ? JSON.stringify(json) : form;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: finalHeaders,
    body,
    ...rest,
  });

  // 204 No Content (e.g. logout) has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : undefined;
    throw new ApiError(response.status, data, detail);
  }

  return data as T;
}

/**
 * Ensure the csrftoken cookie is present before an authenticated write.
 * Safe to call repeatedly; it's a cheap GET that sets the cookie.
 */
export async function ensureCsrfToken(): Promise<void> {
  if (getCookie('csrftoken')) return;
  await apiFetch('/csrf/');
}
