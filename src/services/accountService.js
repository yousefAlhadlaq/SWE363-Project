import api from '../utils/api';

const accountService = {
  async getAccounts() {
    return api.get('/accounts');
  },
  async createAccount(payload) {
    return api.post('/accounts', payload);
  },
  async updateAccount(accountId, payload) {
    return api.put(`/accounts/${accountId}`, payload);
  },
  async toggleAccountStatus(accountId, action) {
    return api.patch(`/accounts/${accountId}/status`, { action });
  },
  async setPrimaryAccount(accountId) {
    return api.post(`/accounts/${accountId}/default`, {});
  }
};

export default accountService;
