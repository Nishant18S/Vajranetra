import api from './api';

export const adminService = {
  /** GET /api/admin/dashboard */
  async dashboard() {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  /** POST /api/admin/alerts */
  async createAlert(payload) {
    const { data } = await api.post('/admin/alerts', payload);
    return data;
  },

  /** GET /api/admin/users */
  async listUsers({ role, is_active, page = 1, limit = 50 } = {}) {
    const { data } = await api.get('/admin/users', {
      params: { role, is_active, page, limit },
    });
    return data;
  },

  /** PATCH /api/admin/users/{id} */
  async updateUser(userId, payload) {
    const { data } = await api.patch(`/admin/users/${userId}`, payload);
    return data;
  },

  /** GET /api/admin/analytics/summary */
  async analyticsSummary(days = 30) {
    const { data } = await api.get('/admin/analytics/summary', {
      params: { days },
    });
    return data;
  },

  /** GET /api/admin/analytics/citizens-by-region */
  async citizensByRegion() {
    const { data } = await api.get('/admin/analytics/citizens-by-region');
    return data;
  },

  /** GET /api/admin/analytics/distributions */
  async analyticsDistributions() {
    const { data } = await api.get('/admin/analytics/distributions');
    return data;
  },

  /** GET /api/admin/analytics/grid-heatmap */
  async analyticsGridHeatmap(limit = 200) {
    const { data } = await api.get('/admin/analytics/grid-heatmap', {
      params: { limit },
    });
    return data;
  },

  /** GET /api/admin/audit */
  async auditLog({ page = 1, limit = 50, action, actor_id, target_id } = {}) {
    const { data } = await api.get('/admin/audit', {
      params: { page, limit, action, actor_id, target_id },
    });
    return data;
  },

  /** GET /api/admin/incidents */
  async listIncidents({ status, severity, page = 1, limit = 50 } = {}) {
    const { data } = await api.get('/admin/incidents', {
      params: { status, severity, page, limit },
    });
    return data;
  },

  /** GET /api/admin/incidents/counts */
  async incidentCounts() {
    const { data } = await api.get('/admin/incidents/counts');
    return data;
  },

  /** POST /api/admin/incidents */
  async createIncident(payload) {
    const { data } = await api.post('/admin/incidents', payload);
    return data;
  },

  /** PATCH /api/admin/incidents/{id} */
  async updateIncident(id, payload) {
    const { data } = await api.patch(`/admin/incidents/${id}`, payload);
    return data;
  },
};