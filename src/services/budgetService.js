import api from '../utils/api';

const budgetService = {
  async getBudgets() {
    return api.get('/budgets');
  },
  async getBudgetAlerts() {
    return api.get('/budgets/alerts');
  },
  async createBudget(payload) {
    return api.post('/budgets', payload);
  },
  async updateBudget(budgetId, payload) {
    return api.put(`/budgets/${budgetId}`, payload);
  },
  async deleteBudget(budgetId) {
    return api.delete(`/budgets/${budgetId}`);
  }
};

export default budgetService;
