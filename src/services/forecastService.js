import api from './api';

export const forecastService = {
  async bySample(sampleIndex = 0) {
    const { data } = await api.get('/forecast', { params: { sample_index: sampleIndex } });
    return data;
  },
  async byHorizon(horizon, sampleIndex = 0) {
    const { data } = await api.get(`/forecast/${horizon}`, { params: { sample_index: sampleIndex } });
    return data;
  },
  async latest() {
    const { data } = await api.get('/forecast/latest');
    return data;
  },
  async history({ page = 1, limit = 20 } = {}) {
    const { data } = await api.get('/forecast/history', { params: { page, limit } });
    return data;
  },
  async byId(id) {
    const { data } = await api.get(`/forecast/${id}`);
    return data;
  },
  async spatial(forecastId, horizon, downsample = 1) {
    const { data } = await api.get(`/forecast/${forecastId}/spatial`, {
      params: { horizon, downsample },
    });
    return data;
  },
};