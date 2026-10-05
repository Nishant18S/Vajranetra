import api from './api';

export const systemService = {
  async health() {
    const { data } = await api.get('/health');
    return data;
  },
  async modelInfo() {
    const { data } = await api.get('/model');
    return data;
  },
  async status() {
    const { data } = await api.get('/system/status');
    return data;
  },
};