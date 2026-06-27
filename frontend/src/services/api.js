/**
 * frontend/src/services/api.js
 * Centralized API client for Mentora.
 *
 * - Base URL from REACT_APP_API_URL env var (falls back to same-host:8000)
 * - Automatic Authorization header injection
 * - 401 handling: clears auth and redirects to /login
 * - Consistent error format
 * - No console.log in production
 */

import { readStoredAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/apiUrl';

// ─── Config ───────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';

// ─── Storage Keys ─────────────────────────────────────────────────────────
const AUTH_STORAGE_KEY  = 'mentora_auth';
const LEGACY_TOKEN_KEY  = 'token';
const LEGACY_USER_KEY   = 'user';

// ─── Helpers ──────────────────────────────────────────────────────────────
const getToken = () => {
  const auth = readStoredAuth();
  return auth?.token ?? null;
};

const clearAuth = () => {
  [localStorage, sessionStorage].forEach(store => {
    store.removeItem(AUTH_STORAGE_KEY);
    store.removeItem(LEGACY_TOKEN_KEY);
    store.removeItem(LEGACY_USER_KEY);
  });
};

const log = isDev ? console.log.bind(console, '[API]') : () => {};

// ─── Response Handler ─────────────────────────────────────────────────────
const handleResponse = async (response, endpoint) => {
  if (response.status === 401) {
    log('401 on', endpoint, '— clearing session');
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  // Parse body (try JSON, fallback to text)
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (typeof data === 'object' && (data.detail || data.message || data.error)) ||
      `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

// ─── Core Request ─────────────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  log(options.method || 'GET', endpoint, token ? '🔑' : '🔓');

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response, endpoint);
};

// ─── Public API ───────────────────────────────────────────────────────────
export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { method: 'GET', ...options }),

  post: (endpoint, data, options = {}) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),

  put: (endpoint, data, options = {}) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  patch: (endpoint, data, options = {}) =>
    request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { method: 'DELETE', ...options }),

  /** For multipart/form-data (file uploads) — no Content-Type header */
  upload: (endpoint, formData, options = {}) =>
    request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},   // Let browser set multipart boundary
      ...options,
    }),
};

export default api;