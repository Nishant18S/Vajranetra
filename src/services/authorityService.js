import api from './api';

export const authorityService = {
  async dashboard() {
    const { data } = await api.get('/authority/dashboard');
    return data;
  },
};