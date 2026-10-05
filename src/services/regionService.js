import api from './api';

export const regionService = {
  async geocode(query) {
    const { data } = await api.get('/admin/geocode', {
      params: { q: query },
    });
    return data;
  },

  async currentWeather(lat, lon) {
    const { data } = await api.get('/admin/weather/current', {
      params: { lat, lon },
    });
    return data;
  },

  async inspect({ q, lat, lon, sampleIndex = 0 } = {}) {
    const params = {};
    if (q) params.q = q;
    if (lat != null && lon != null) {
      params.lat = lat;
      params.lon = lon;
    }
    params.sample_index = sampleIndex;

    const { data } = await api.get('/admin/region/inspect', { params });
    return data;
  },

  async gridLookup(y, x) {
    const { data } = await api.get('/admin/grid/lookup', {
      params: { y, x },
    });
    return data;
  },

  async listInspections({ page = 1, limit = 50, userEmail } = {}) {
    const params = { page, limit };
    if (userEmail) params.user_email = userEmail;
    const { data } = await api.get('/admin/inspections', { params });
    return data;
  },

  async getPrecursors({ sampleIndex = 0, y, x }) {
    const { data } = await api.get('/admin/region/precursors', {
      params: { sample_index: sampleIndex, y, x },
    });
    return data;
  },

  async getExplanation({ sampleIndex = 0, y, x, horizon, task }) {
    const { data } = await api.get('/admin/region/explain', {
      params: { sample_index: sampleIndex, y, x, horizon, task },
    });
    return data;
  },

  async getTerrain({ lat, lon }) {
    const { data } = await api.get('/admin/region/terrain', {
      params: { lat, lon },
    });
    return data;
  },

  async getQPE({ sampleIndex = 0, y, x }) {
    const { data } = await api.get('/admin/region/qpe', {
      params: { sample_index: sampleIndex, y, x },
    });
    return data;
  },

  async getConvergence({ sampleIndex = 0, y, x }) {
    const { data } = await api.get('/admin/region/convergence', {
      params: { sample_index: sampleIndex, y, x },
    });
    return data;
  },

  async getCTT({ y = 60, x = 80 }) {
    const { data } = await api.get('/admin/region/ctt', {
      params: { y, x },
    });
    return data;
  },
};
