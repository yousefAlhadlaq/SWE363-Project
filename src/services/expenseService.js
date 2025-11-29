import api from '../utils/api';

const expenseService = {
  async getExpenses(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    const query = searchParams.toString();
    const endpoint = query ? `/expenses?${query}` : '/expenses';
    return api.get(endpoint);
  },

  async getExpense(id) {
    return api.get(`/expenses/${id}`);
  },

  async createExpense(payload) {
    return api.post('/expenses', payload);
  },

  async updateExpense(id, payload) {
    return api.put(`/expenses/${id}`, payload);
  },

  async deleteExpense(id) {
    return api.delete(`/expenses/${id}`);
  }
};

export default expenseService;
