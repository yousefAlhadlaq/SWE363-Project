import api from '../utils/api';

// Advisor API Service
const advisorService = {
  // Get all available advisors
  getAllAdvisors: async () => {
    const response = await api.get('/advisors');
    return response;
  },

  // Get advisor by ID
  getAdvisorById: async (advisorId) => {
    const response = await api.get(`/advisors/${advisorId}`);
    return response;
  },

  // Become an advisor (upgrade account)
  becomeAdvisor: async (advisorData) => {
    const response = await api.post('/advisors/become-advisor', advisorData);
    return response;
  },

  // Update advisor profile
  updateAdvisorProfile: async (profileData) => {
    const response = await api.put('/advisors/profile', profileData);
    return response;
  },

  // Send connection request to advisor
  sendConnectionRequest: async (advisorId, message) => {
    const response = await api.post('/advisors/connect', {
      advisorId,
      message,
    });
    return response;
  },

  // Get my connection requests (as a user)
  getMyRequests: async () => {
    const response = await api.get('/advisors/my/requests');
    return response;
  },

  // Get my connected advisor
  getMyAdvisor: async () => {
    const response = await api.get('/advisors/my/advisor');
    return response;
  },

  // Disconnect from advisor
  disconnectFromAdvisor: async () => {
    const response = await api.delete('/advisors/disconnect');
    return response;
  },

  // Get received connection requests (advisor only)
  getReceivedRequests: async () => {
    const response = await api.get('/advisors/requests/received');
    return response;
  },

  // Respond to connection request (advisor only)
  respondToRequest: async (requestId, status, responseMessage = '') => {
    const response = await api.put(`/advisors/requests/${requestId}/respond`, {
      status,
      responseMessage,
    });
    return response;
  },

  // Update advisor availability
  updateAvailability: async (availability) => {
    const response = await api.put('/advisors/availability', { availability });
    return response;
  },

  // Get advisor availability
  getAvailability: async (advisorId) => {
    const response = await api.get(`/advisors/${advisorId}/availability`);
    return response;
  },

  // Get advisor statistics
  getAdvisorStats: async () => {
    const response = await api.get('/advisors/stats/me');
    return response;
  },
};

export default advisorService;
