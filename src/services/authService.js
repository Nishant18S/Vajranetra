import api, { tokenStore, userCache } from './api';

export const authService = {
  /** POST /api/auth/register */
  async register({ name, email, password, phone, state, district }) {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      phone: phone || null,
      state: state || null,
      district: district || null,
    });
    return data;
  },

  /** POST /api/auth/login */
  async login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data?.access_token) {
      tokenStore.set(data.access_token);
      if (data.user) userCache.set(data.user);
    }
    return data;
  },

  /** GET /api/auth/me */
  async me() {
    const { data } = await api.get('/auth/me');
    userCache.set(data);
    return data;
  },

  /** POST /api/auth/change-password */
  async changePassword({ current_password, new_password }) {
    const { data } = await api.post('/auth/change-password', {
      current_password,
      new_password,
    });
    return data;
  },

  /** POST /api/auth/logout — best-effort; always clears locally */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — token might already be expired
    } finally {
      tokenStore.clear();
      userCache.clear();
    }
  },

  /** Local-only helpers (used by AuthContext) */
  getToken: () => tokenStore.get(),
  getCachedUser: () => userCache.get(),
  clearLocal: () => {
    tokenStore.clear();
    userCache.clear();
  },
};