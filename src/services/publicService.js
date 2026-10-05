import api from './api';

export const publicService = {
  /** GET /api/public/me */
  async me() {
    const { data } = await api.get('/public/me');
    return data;
  },

  /** GET /api/public/alerts — DISPATCHED alerts for the caller's region */
  async myAlerts() {
    const { data } = await api.get('/public/alerts');
    return data; // { alerts: [], total, region }
  },
};