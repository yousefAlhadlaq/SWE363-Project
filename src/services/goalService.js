import api from '../utils/api';

const goalService = {
  async getGoals() {
    return api.get('/goals');
  },
  async createGoal(payload) {
    return api.post('/goals', payload);
  },
  async updateGoal(goalId, payload) {
    return api.put(`/goals/${goalId}`, payload);
  },
  async deleteGoal(goalId) {
    return api.delete(`/goals/${goalId}`);
  },
  async contribute(goalId, amount) {
    return api.patch(`/goals/${goalId}/progress`, { amount });
  }
};

export default goalService;
