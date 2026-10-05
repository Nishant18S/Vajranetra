import api from './api';

export const alertService = {
  /** GET /api/alerts — paginated, filters available */
  async list(params = {}) {
    const { data } = await api.get('/alerts', { params });
    return data;
  },

  /** GET /api/alerts/active — ACTIVE + ACKNOWLEDGED (authority scope) */
  async active() {
    const { data } = await api.get('/alerts/active');
    return data;
  },

  /** GET /api/alerts/{id} */
  async byId(id) {
    const { data } = await api.get(`/alerts/${id}`);
    return data;
  },

  /** POST /api/alerts/{id}/acknowledge */
  async acknowledge(id, { acknowledged_by, notes }) {
    const { data } = await api.post(`/alerts/${id}/acknowledge`, {
      acknowledged_by,
      notes: notes || null,
    });
    return data;
  },

  /** POST /api/alerts/{id}/dispatch */
  async dispatch(id, payload) {
    const { data } = await api.post(`/alerts/${id}/dispatch`, payload);
    return data;
  },

  /** POST /api/alerts/{id}/resolve */
  async resolve(id, { resolved_by, notes }) {
    const { data } = await api.post(`/alerts/${id}/resolve`, {
      resolved_by,
      notes: notes || null,
    });
    return data;
  },
};