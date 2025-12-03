import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token
const getToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const notificationService = {
  // Get all notifications
  getAllNotifications: async (limit = 50, skip = 0, unreadOnly = false) => {
    try {
      const response = await api.get('/notifications', {
        params: { limit, skip, unreadOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  },

  // Get alert settings
  getAlertSettings: async () => {
    try {
      const response = await api.get('/notifications/alert-settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      throw error;
    }
  },

  // Update alert settings
  updateAlertSettings: async (settings) => {
    try {
      const response = await api.patch('/notifications/alert-settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating alert settings:', error);
      throw error;
    }
  }
};

export default notificationService;
