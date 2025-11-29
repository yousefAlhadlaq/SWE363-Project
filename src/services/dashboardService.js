import api from '../utils/api';

const dashboardService = {
  async getOverview() {
    return api.get('/dashboard/overview');
  },
  async getRecentTransactions(limit = 10) {
    const query = typeof limit === 'number' ? `?limit=${Math.min(Math.max(limit, 1), 50)}` : '';
    return api.get(`/dashboard/recent-transactions${query}`);
  }
};

export default dashboardService;
