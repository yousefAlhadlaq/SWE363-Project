import api from '../utils/api';

// Request API Service
const requestService = {
  // Create new advice request
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response;
  },

  // Get all requests (filtered by user role)
  getAllRequests: async (status = null) => {
    const endpoint = status ? `/requests?status=${status}` : '/requests';
    const response = await api.get(endpoint);
    return response;
  },

  // Get request by ID
  getRequestById: async (requestId) => {
    const response = await api.get(`/requests/${requestId}`);
    return response;
  },

  // Update request status
  updateRequestStatus: async (requestId, status) => {
    const response = await api.put(`/requests/${requestId}/status`, { status });
    return response;
  },

  // Cancel/delete request
  cancelRequest: async (requestId) => {
    const response = await api.delete(`/requests/${requestId}`);
    return response;
  },

  // Accept request (advisor only)
  acceptRequest: async (requestId) => {
    const response = await api.post(`/requests/${requestId}/accept`);
    return response;
  },

  // Decline request (advisor only)
  declineRequest: async (requestId) => {
    const response = await api.post(`/requests/${requestId}/decline`);
    return response;
  },

  // Save draft response (advisor only)
  saveDraft: async (requestId, content) => {
    const response = await api.post(`/requests/${requestId}/draft`, { content });
    return response;
  },

  // Get client history (advisor only)
  getClientHistory: async (clientId) => {
    const response = await api.get(`/requests/client/${clientId}/history`);
    return response;
  },

  // Send message to request
  sendMessage: async (requestId, content, attachments = []) => {
    const response = await api.post(`/messages/request/${requestId}`, {
      content,
      attachments,
    });
    return response;
  },

  // Get all messages for a request
  getRequestMessages: async (requestId) => {
    const response = await api.get(`/messages/request/${requestId}`);
    return response;
  },

  // Mark messages as read
  markMessagesAsRead: async (requestId) => {
    const response = await api.put(`/messages/request/${requestId}/mark-read`);
    return response;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response;
  },

  // Schedule meeting for request
  scheduleMeeting: async (requestId, meetingData) => {
    const response = await api.post(`/meetings/request/${requestId}`, meetingData);
    return response;
  },

  // Get all meetings
  getAllMeetings: async (status = null) => {
    const endpoint = status ? `/meetings?status=${status}` : '/meetings';
    const response = await api.get(endpoint);
    return response;
  },

  // Get upcoming meetings
  getUpcomingMeetings: async () => {
    const response = await api.get('/meetings/upcoming');
    return response;
  },

  // Get meetings for specific request
  getRequestMeetings: async (requestId) => {
    const response = await api.get(`/meetings/request/${requestId}`);
    return response;
  },

  // Update meeting
  updateMeeting: async (meetingId, meetingData) => {
    const response = await api.put(`/meetings/${meetingId}`, meetingData);
    return response;
  },

  // Cancel meeting
  cancelMeeting: async (meetingId, cancellationReason = '') => {
    const response = await api.put(`/meetings/${meetingId}/cancel`, {
      cancellationReason,
    });
    return response;
  },

  // Complete meeting (advisor only)
  completeMeeting: async (meetingId) => {
    const response = await api.put(`/meetings/${meetingId}/complete`);
    return response;
  },

  // Create note for request (advisor only)
  createNote: async (requestId, content) => {
    const response = await api.post(`/notes/request/${requestId}`, { content });
    return response;
  },

  // Get notes for request (advisor only)
  getRequestNotes: async (requestId) => {
    const response = await api.get(`/notes/request/${requestId}`);
    return response;
  },

  // Get all advisor notes
  getAllNotes: async () => {
    const response = await api.get('/notes');
    return response;
  },

  // Search notes
  searchNotes: async (query) => {
    const response = await api.get(`/notes/search?query=${encodeURIComponent(query)}`);
    return response;
  },

  // Update note
  updateNote: async (noteId, content) => {
    const response = await api.put(`/notes/${noteId}`, { content });
    return response;
  },

  // Delete note
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response;
  },
};

export default requestService;
