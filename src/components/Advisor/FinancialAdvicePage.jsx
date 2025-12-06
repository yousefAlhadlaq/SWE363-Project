import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../Shared/Button';
import InputField from '../Shared/InputField';
import Sidebar from '../Shared/Sidebar';
import requestService from '../../services/requestService';
import advisorService from '../../services/advisorService';
import { useAuth } from '../../context/AuthContext';
import FloatingActionButton from '../Shared/FloatingActionButton';

const avatarGradients = [
  'from-teal-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-indigo-500 to-cyan-500',
];

const getAvatarProps = (person) => {
  const name =
    person?.fullName ||
    person?.name ||
    person?.email ||
    person?.senderName ||
    'Unknown';

  const trimmed = (name || '').trim();
  const initial = trimmed.charAt(0).toUpperCase() || 'A';
  const hash = Array.from(trimmed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = avatarGradients[Math.abs(hash) % avatarGradients.length];

  return { initial, gradient, name: trimmed || 'Unknown' };
};

function FinancialAdvicePage() {
  const { isAdvisor, user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeRequests, setActiveRequests] = useState([]);
  const [pastRequests, setPastRequests] = useState([]);
  const [availableAdvisors, setAvailableAdvisors] = useState([]);

  const [request, setRequest] = useState({
    topic: '',
    urgency: '',
    subject: '',
    description: '',
    budget: '',
    preferredAdvisor: '',
    consent: false
  });

  // Load requests and advisors from backend on component mount
  useEffect(() => {
    loadRequests();
    loadAdvisors();

    // Auto-refresh every 15 seconds to catch status updates
    const pollInterval = setInterval(() => {
      loadRequests();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  // Re-fetch when tab changes
  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  // Re-fetch when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadRequests();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Function to load all requests from backend
  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestService.getAllRequests();

      if (response.success && response.requests) {
        const requests = response.requests || [];
        const visible = isAdvisor()
          ? requests.filter(req => !req.deletedByAdvisor)
          : requests.filter(req => !req.deletedByClient);

        const activeStatuses = ['Pending', 'Accepted', 'In Progress'];
        const pastStatuses = ['Closed', 'Completed', 'Cancelled', 'Declined'];

        setActiveRequests(visible.filter(req => activeStatuses.includes(req.status)));
        setPastRequests(visible.filter(req => pastStatuses.includes(req.status)));
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Function to load available advisors
  const loadAdvisors = async () => {
    try {
      const response = await advisorService.getAllAdvisors();
      if (response.success && response.advisors) {
        setAvailableAdvisors(response.advisors);
      }
    } catch (err) {
      console.error('Error loading advisors:', err);
      // Don't show error for advisor loading, it's optional
    }
  };

  // Function to load single request details with messages
  const loadRequestDetails = async (requestId) => {
    setLoading(true);
    setError(null);
    try {
      // Load request details
      const requestResponse = await requestService.getRequestById(requestId);

      if (!requestResponse.success || !requestResponse.request) {
        throw new Error(requestResponse.error || 'Failed to load request details');
      }

      // Load messages for this request
      const messagesResponse = await requestService.getRequestMessages(requestId);

      if (!messagesResponse.success) {
        console.warn('Failed to load messages:', messagesResponse.error);
        // Still show the request even if messages fail
      }

      // Combine request details with messages
      const threadData = {
        ...requestResponse.request,
        messages: messagesResponse.messages || []
      };
      setSelectedThread(threadData);

      // Mark messages as read (don't block on this)
      requestService.markMessagesAsRead(requestId).catch(err => {
        console.warn('Failed to mark messages as read:', err);
      });

    } catch (err) {
      console.error('Error loading request details:', err);
      setError(err.message || 'Failed to load request details');
      alert('Error loading request: ' + (err.message || 'Failed to load request details'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRequest({
      ...request,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // Create request via backend API
      // Only include preferredAdvisor if one was selected
      const requestData = {
        topic: request.topic,
        urgency: request.urgency,
        title: request.subject,
        description: request.description,
        budget: request.budget,
      };

      // Only add preferredAdvisor if it's not empty
      if (request.preferredAdvisor) {
        requestData.preferredAdvisor = request.preferredAdvisor;
      }

      const response = await requestService.createRequest(requestData);

      if (response.success) {
        // Reload requests from backend to get fresh data
        await loadRequests();

        // Show success message
        alert('Request submitted successfully!');

        // Close modal and reset form
        setShowRequestModal(false);
        setRequest({
          topic: '',
          urgency: '',
          subject: '',
          description: '',
          budget: '',
          preferredAdvisor: '',
          consent: false
        });
      } else {
        setError(response.error || 'Failed to create request');
        alert('Error: ' + (response.error || 'Failed to create request'));
      }
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.message || 'Failed to submit request');
      alert('Error: ' + (err.message || 'Failed to submit request'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this request?');

    if (confirmCancel) {
      setLoading(true);
      setError(null);

      try {
        const response = await requestService.cancelRequest(requestId);

        if (response.success) {
          // Reload requests from backend
          await loadRequests();
          alert('Request cancelled successfully');
        } else {
          setError(response.error || 'Failed to cancel request');
          alert('Error: ' + (response.error || 'Failed to cancel request'));
        }
      } catch (err) {
        console.error('Error cancelling request:', err);
        setError(err.message || 'Failed to cancel request');
        alert('Error: ' + (err.message || 'Failed to cancel request'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteConversation = async (requestId) => {
    const confirmed = window.confirm('Delete this conversation from your view? It will remain visible to the advisor.');
    if (!confirmed) return;
    try {
      await requestService.cancelRequest(requestId);
      await loadRequests();
      if (selectedThread?._id === requestId) {
        setSelectedThread(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove conversation');
      alert(err.message || 'Failed to remove conversation');
    }
  };

  const handleSendReply = async () => {
    if (selectedThread?.status && ['Closed', 'Completed'].includes(selectedThread.status)) {
      alert('This conversation is closed. You cannot send new messages.');
      return;
    }

    if (!replyMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!selectedThread || !selectedThread._id) {
      alert('No request selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send message via backend API
      const response = await requestService.sendMessage(
        selectedThread._id,
        replyMessage,
        [] // attachments - can be added later
      );

      if (response.success) {
        // Reload request details to get updated messages from backend
        await loadRequestDetails(selectedThread._id);

        // Clear the reply input
        setReplyMessage('');
      } else {
        setError(response.error || 'Failed to send message');
        alert('Error: ' + (response.error || 'Failed to send message'));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      alert('Error: ' + (err.message || 'Failed to send message'));
    } finally {
      setLoading(false);
    }
  };

  const handleEndConversation = async () => {
    if (!selectedThread?._id) return;
    const confirmed = window.confirm('Are you sure you want to end this conversation? You and the advisor will no longer be able to send new messages on this request.');
    if (!confirmed) return;
    try {
      await requestService.updateRequestStatus(selectedThread._id, 'Closed');
      await loadRequests();
      await loadRequestDetails(selectedThread._id);
      setActiveTab('past');
    } catch (err) {
      setError(err.message || 'Failed to end conversation.');
      alert(err.message || 'Failed to end conversation.');
    }
  };

  const viewThread = async (requestItem) => {
    if (!requestItem || !requestItem._id) {
      console.error('Invalid request item:', requestItem);
      alert('Error: Invalid request selected');
      return;
    }

    // Load request details with messages from backend
    await loadRequestDetails(requestItem._id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'Accepted':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/30';
      case 'Answered':
      case 'Completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'Closed':
        return 'bg-slate-700/30 text-slate-200 border border-slate-500/40';
      case 'Declined':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border border-slate-600/30';
    }
  };

  // Thread View
  if (selectedThread) {
    const conversationClosed = selectedThread.status === 'Closed' || selectedThread.status === 'Completed';

    return (
      <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100">
        {/* Decorative animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 relative lg:ml-64 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => setSelectedThread(null)}
            className="text-teal-400 hover:text-teal-300 mb-6 flex items-center space-x-2 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Requests</span>
          </button>

          {/* Header Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 mb-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-300 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedThread.title}</h2>
                  {selectedThread.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl mb-2">
                      {selectedThread.description}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-gray-400">
                    <span className="text-slate-800 dark:text-gray-300">{selectedThread.topic}</span>
                    <span>•</span>
                    <span>Budget: <span className="text-green-400 font-semibold">{selectedThread.budget}</span></span>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedThread.status)}`}>
                  {selectedThread.status}
                </span>
              </div>
            </div>
          </div>

          {/* Messages and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages */}
            <div className="lg:col-span-2 space-y-4">
              {selectedThread.messages && selectedThread.messages.length > 0 ? (
                selectedThread.messages.map((message, index) => (
                  <div key={index} className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="flex items-start space-x-4">
                      {(() => {
                        const avatar = getAvatarProps(message.sender || { senderName: message.senderName });
                        return (
                          <div className={`w-10 h-10 bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                            {avatar.initial}
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {message.sender?.fullName || message.sender?.email || message.senderName || 'Unknown'}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{message.role || message.senderRole || ''}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3 dark:text-slate-400">{message.timestamp || new Date(message.createdAt).toLocaleString()}</p>
                        <p className="text-slate-800 leading-relaxed dark:text-slate-200">{message.content || message.message}</p>

                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
                                <svg className="w-4 h-4 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{file}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                  No messages yet. Start the conversation below.
                </div>
              )}

              {/* Reply Box */}
              <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm dark:shadow-none">
                {conversationClosed && (
                  <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-100">
                    This conversation is closed. You can no longer send new messages.
                  </div>
                )}
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-3">
                  Add a reply
                </label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                  placeholder="Type your message or follow-up question..."
                  disabled={loading || conversationClosed}
                />
                <button
                  onClick={handleSendReply}
                  disabled={loading || conversationClosed}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={handleEndConversation}
                  disabled={conversationClosed}
                  className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-lg border border-red-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  End Conversation
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Participants</h3>
                <div className="space-y-3">
                  {(() => {
                    const youAvatar = getAvatarProps(user || { fullName: 'You' });
                    return (
                  <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${youAvatar.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                        {youAvatar.initial}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{youAvatar.name || 'You'}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Requester</p>
                    </div>
                  </div>
                    );
                  })()}
                  {selectedThread.advisor && (
                    (() => {
                      const advisorAvatar = getAvatarProps(selectedThread.advisor);
                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${advisorAvatar.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                            {advisorAvatar.initial}
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {selectedThread.advisor.fullName || selectedThread.advisor.email || 'Unknown Advisor'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Advisor</p>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
                    <p className="text-slate-900 dark:text-white">{new Date(selectedThread.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last activity</p>
                    <p className="text-slate-900 dark:text-white">{new Date(selectedThread.updatedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(selectedThread.status)}`}>
                      {selectedThread.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 relative lg:ml-64 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">Financial Advice</h2>
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
              {activeRequests.length}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && !selectedThread && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-center">
            Loading...
          </div>
        )}

        {/* Toggle Tabs */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white shadow-sm text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700/50'
                : 'bg-white/70 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-teal-300 hover:bg-white dark:bg-slate-800/30 dark:border-slate-700/30 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50 dark:hover:border-slate-600/50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              activeTab === 'past'
                ? 'bg-white shadow-sm text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700/50'
                : 'bg-white/70 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-teal-300 hover:bg-white dark:bg-slate-800/30 dark:border-slate-700/30 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/50 dark:hover:border-slate-600/50'
            }`}
          >
            Past
          </button>
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {activeTab === 'active' ? (
            activeRequests.length > 0 ? (
              activeRequests.map((req) => (
                <div key={req._id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
                  <div className="relative bg-white/95 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-300 shadow-sm dark:shadow-none">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{req.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 flex items-center gap-2 dark:text-gray-400">
                          <span>Submitted • {new Date(req.createdAt).toLocaleDateString()} • Topic: <span className="text-slate-800 dark:text-gray-300">{req.topic}</span></span>
                        </p>
                        <p className="text-slate-700 text-sm leading-relaxed dark:text-gray-200">{req.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => viewThread(req)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all text-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white"
                      >
                        View
                      </button>
                      {req.status === 'Pending' && (
                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium rounded-lg transition-all text-sm" onClick={() => handleCancelRequest(req._id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/95 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">No active requests yet. Click the + button to create a new request.</p>
              </div>
            )
          ) : (
            pastRequests.length > 0 ? (
              pastRequests.map((req) => (
                <div key={req._id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
                  <div className="relative bg-white/95 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-300 shadow-sm dark:shadow-none">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{req.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 dark:text-gray-400">
                          Updated • {new Date(req.updatedAt).toLocaleDateString()} • Topic: <span className="text-slate-800 dark:text-gray-300">{req.topic}</span>
                        </p>
                        <p className="text-slate-700 text-sm leading-relaxed dark:text-gray-200">{req.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => viewThread(req)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all text-sm mt-4 hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(req._id)}
                      className="ml-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-lg border border-red-500/30 transition-all text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/95 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">No past requests yet.</p>
              </div>
            )
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setShowRequestModal(true)} className={loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} />

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-slate-800 dark:border-slate-700">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Request Financial Advice</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fill in the details below and submit your request.
                </p>

                {/* Topic and Urgency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Topic</label>
                    <select
                      name="topic"
                      value={request.topic}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white"
                      required
                    >
                      <option value="">Select topic</option>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Planning">Planning</option>
                      <option value="Tax">Tax</option>
                      <option value="Retirement">Retirement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Urgency</label>
                    <select
                      name="urgency"
                      value={request.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white"
                      required
                    >
                      <option value="">Choose</option>
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={request.subject}
                    onChange={handleChange}
                    placeholder="Short summary (e.g., 'Diversify ETF portfolio')"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Details</label>
                  <textarea
                    name="description"
                    value={request.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    placeholder="Provide context, timeframe, constraints, and goals..."
                    required
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-2">
                    Avoid sharing sensitive personal data. Attach documents below if needed.
                  </p>
                </div>

                {/* Budget and Preferred Advisor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget (optional)</label>
                    <input
                      type="text"
                      name="budget"
                      value={request.budget}
                      onChange={handleChange}
                      placeholder="e.g., $50.00"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Advisor (optional)</label>
                    <select
                      name="preferredAdvisor"
                      value={request.preferredAdvisor}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white"
                    >
                      <option value="">Any available advisor</option>
                      {availableAdvisors.map((advisor) => (
                        <option key={advisor._id} value={advisor._id}>
                          {advisor.fullName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-600 dark:text-slate-500 mt-2">
                      Leave as "Any available" to let any advisor respond
                    </p>
                  </div>
                </div>

                {/* Consent */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={request.consent}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 bg-white border-slate-300 rounded focus:ring-teal-500 dark:bg-slate-900/50 dark:border-slate-700"
                    required
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-300">
                    I consent to sharing this information for financial advice purposes.
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-all border border-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-white dark:border-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default FinancialAdvicePage;
