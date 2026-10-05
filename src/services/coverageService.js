import api from './api';

export const coverageService = {
  async get() {
    const { data } = await api.get('/settings/coverage');
    return data;
  },
  async set(payload) {
    const { data } = await api.put('/settings/coverage', payload);
    return data;
  },
  async clear() {
    const { data } = await api.delete('/settings/coverage');
    return data;
  },
};