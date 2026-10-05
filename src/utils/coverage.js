import api from '../services/api';

const MIRROR_KEY = 'vajranetra.coverage.mirror.v1';

export const coverageApi = {
  async get() {
    const { data } = await api.get('/settings/coverage');
    return data;
  },

  async set({ label, bounds, shape, source }) {
    const [southWest, northEast] = bounds;
    const { data } = await api.put('/settings/coverage', {
      label: label || 'Model coverage area',
      bounds: {
        south: southWest[0],
        west: southWest[1],
        north: northEast[0],
        east: northEast[1],
      },
      shape,
      source,
    });
    return data;
  },

  async clear() {
    const { data } = await api.delete('/settings/coverage');
    return data;
  },
};

export function saveMirror(cfg) {
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(cfg));
  } catch {}
}

export function loadMirror() {
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.bounds) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMirror() {
  try {
    localStorage.removeItem(MIRROR_KEY);
  } catch {}
}

// Backwards-compat aliases
export const loadCoverage = loadMirror;
export const saveCoverage = saveMirror;
export const clearCoverage = clearMirror;