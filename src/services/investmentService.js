import api from '../utils/api';

// Investment API Service
const investmentService = {
  // Get all investments
  getAllInvestments: async () => {
    const response = await api.get('/investments');
    return response;
  },

  // Get single investment
  getInvestmentById: async (id) => {
    const response = await api.get(`/investments/${id}`);
    return response;
  },

  // Get portfolio summary
  getPortfolioSummary: async () => {
    const response = await api.get('/investments/portfolio');
    return response;
  },

  // Create investment
  createInvestment: async (investmentData) => {
    const response = await api.post('/investments', investmentData);
    return response;
  },

  // Update investment
  updateInvestment: async (id, investmentData) => {
    const response = await api.put(`/investments/${id}`, investmentData);
    return response;
  },

  // Delete investment
  deleteInvestment: async (id) => {
    const response = await api.delete(`/investments/${id}`);
    return response;
  },
};

export default investmentService;
