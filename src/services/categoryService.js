import api from '../utils/api';

const categoryService = {
  async getCategories() {
    return api.get('/categories');
  },

  async createCategory(payload) {
    return api.post('/categories', payload);
  },

  async updateCategory(categoryId, payload) {
    return api.put(`/categories/${categoryId}`, payload);
  },

  async deleteCategory(categoryId) {
    return api.delete(`/categories/${categoryId}`);
  }
};

export default categoryService;
