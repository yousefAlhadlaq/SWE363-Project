import api, { saveToken, saveUser, removeToken, removeUser } from '../utils/api';

// Authentication API Service
const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);

    if (response.success && response.token) {
      saveToken(response.token);
      saveUser(response.user);
    }

    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);

    if (response.success && response.token) {
      saveToken(response.token);
      saveUser(response.user);
    }

    return response;
  },

  // Verify email with code
  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response;
  },

  // Resend verification code
  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/resend-code', { email });
    return response;
  },

  // Forgot password - request reset code
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },

  // Reset password with code
  resetPassword: async (email, verificationCode, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      verificationCode,
      newPassword,
    });
    return response;
  },

  // Resend password reset code
  resendResetCode: async (email) => {
    const response = await api.post('/auth/resend-reset-code', { email });
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');

    if (response.success && response.user) {
      saveUser(response.user);
    }

    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);

    if (response.success && response.user) {
      saveUser(response.user);
    }

    return response;
  },

  // Logout user
  logout: () => {
    removeToken();
    removeUser();
  },
};

export default authService;
