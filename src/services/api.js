import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const TOKEN_KEY = 'vn:token';
export const USER_KEY = 'vn:user';

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
};

export const userCache = {
  get: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set: (u) => {
    try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {}
  },
  clear: () => {
    try { localStorage.removeItem(USER_KEY); } catch {}
  },
};

export const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: attach Bearer token ---
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: consistent errors + 401 handling ---
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail || err?.message || 'Request failed';
    const wrapped = new Error(
      typeof detail === 'string' ? detail : JSON.stringify(detail)
    );
    wrapped.status = status;
    wrapped.code =
      status === 400 ? 'BAD_REQUEST'
      : status === 401 ? 'UNAUTHORIZED'
      : status === 403 ? 'FORBIDDEN'
      : status === 404 ? 'NOT_FOUND'
      : status === 503 ? 'UNAVAILABLE'
      : !err.response ? 'NETWORK'
      : 'SERVER';

    // On 401, clear auth and notify the app via a custom event.
    if (status === 401) {
      tokenStore.clear();
      userCache.clear();
      try {
        window.dispatchEvent(new CustomEvent('vn:unauthorized'));
      } catch {}
    }

    return Promise.reject(wrapped);
  }
);

export const apiBaseURL = baseURL;
export default api;