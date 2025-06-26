import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute('content') || '';
}

type FetchOptions = RequestInit & {
  skipCsrf?: boolean;
};

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipCsrf = false, headers = {}, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  };

  // Merge provided headers
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      defaultHeaders[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      defaultHeaders[key] = value;
    });
  } else {
    Object.assign(defaultHeaders, headers);
  }

  // Add CSRF token for non-GET requests or if explicitly required
  if (!skipCsrf && restOptions.method && restOptions.method !== 'GET') {
    defaultHeaders['X-CSRF-TOKEN'] = getCsrfToken();
  }

  // Add Content-Type for JSON payloads
  if (restOptions.body && typeof restOptions.body === 'string' && !defaultHeaders['Content-Type']) {
    try {
      JSON.parse(restOptions.body);
      defaultHeaders['Content-Type'] = 'application/json';
    } catch {
      // Not JSON, let browser set Content-Type
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: defaultHeaders,
  });

  // Handle CSRF token mismatch errors
  if (response.status === 419) {
    // CSRF token expired, reload the page to get a fresh token
    window.location.reload();
    throw new Error('CSRF token mismatch. Page will reload.');
  }

  return response;
}
