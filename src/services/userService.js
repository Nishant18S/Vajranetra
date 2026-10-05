import api from './api';

export const userService = {
  /** PATCH /api/admin/users/{id} — self-update fields that are safe for citizens */
  async updateProfile(userId, payload) {
    const { data } = await api.patch(`/admin/users/${userId}`, payload);
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
};