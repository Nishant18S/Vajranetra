import api from './api';

export const incidentService = {
  /** GET /api/admin/incidents */
  async list({ status, severity, page = 1, limit = 50 } = {}) {
    const { data } = await api.get('/admin/incidents', {
      params: { status, severity, page, limit },
    });
    return data;
  },

  /** GET /api/admin/incidents/counts */
  async counts() {
    const { data } = await api.get('/admin/incidents/counts');
    return data;
  },

  /** POST /api/admin/incidents */
  async create(payload) {
    const { data } = await api.post('/admin/incidents', payload);
    return data;
  },

  /** PATCH /api/admin/incidents/{id} */
  async update(id, payload) {
    const { data } = await api.patch(`/admin/incidents/${id}`, payload);
    return data;
  },

  /** GET /api/admin/incidents/{id} — convenience */
  async byId(id) {
    const { data } = await api.get(`/admin/incidents/${id}`);
    return data;
  },
};