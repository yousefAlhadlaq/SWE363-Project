import api from '../utils/api';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const adminService = {
  async getUsers(params) {
    const query = buildQueryString(params);
    return api.get(`/admin/users${query}`);
  },
  async getUserProfile(userId) {
    return api.get(`/admin/users/${userId}`);
  },
  async toggleUserStatus(userId, action) {
    return api.patch(`/admin/users/${userId}/status`, { action });
  },
  async resetUserPassword(userId) {
    return api.post(`/admin/users/${userId}/reset-password`, {});
  }
};

export default adminService;
