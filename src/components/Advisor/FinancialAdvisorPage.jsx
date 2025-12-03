import React, { useEffect, useState } from 'react';
import FinancialSidebar from '../Shared/FinancialSidebar';
import requestService from '../../services/requestService';
import Button from '../Shared/Button';
import FloatingActionButton from '../Shared/FloatingActionButton';

const avatarGradients = [
  'from-teal-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-indigo-500 to-cyan-500',
];

const getAvatarProps = (person = {}, fallbackName = 'User') => {
  const name =
    person.fullName ||
    person.name ||
    person.email ||
    person.sender ||
    fallbackName;

  const trimmed = (name || '').trim() || fallbackName;
  const initial = trimmed.charAt(0).toUpperCase() || 'U';
  const hash = Array.from(trimmed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = avatarGradients[Math.abs(hash) % avatarGradients.length];

  return { initial, gradient, name: trimmed };
};

function FinancialAdvisorPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedThread, setSelectedThread] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyForm, setReplyForm] = useState({
    clientName: '',
    subject: '',
    message: '',
    attachments: []
  });
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);

  const advisorPrimaryButtonClasses =
    'px-4 py-2.5 text-sm font-semibold rounded-2xl bg-emerald-500 text-white shadow-[0_18px_30px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300';

  const advisorGhostButtonClasses =
    'px-4 py-2.5 text-sm font-semibold rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:border-slate-600/60 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:border-teal-400/60 dark:hover:bg-slate-700/70';

  const advisorDangerButtonClasses =
    'px-4 py-2.5 text-sm font-semibold rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 shadow-[0_12px_30px_rgba(248,113,113,0.25)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-100 dark:hover:bg-red-500/25';

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200';
      case 'Accepted':
        return 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600/30';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High':
        return 'text-rose-600 dark:text-red-400';
      case 'Normal':
        return 'text-sky-600 dark:text-blue-400';
      case 'Low':
        return 'text-emerald-600 dark:text-white/60';
      default:
        return 'text-slate-500 dark:text-white/60';
    }
  };

  const normalizeRequest = (request) => ({
    id: request._id,
    status: request.status,
    title: request.title,
    from: request.client?.fullName || 'Client',
    timestamp: new Date(request.createdAt).toLocaleString(),
    topic: request.topic,
    urgency: request.urgency,
    description: request.description,
    budget: request.budget || '—',
    raw: request,
  });

  const fetchAdvisorRequests = async () => {
    setLoadingRequests(true);
    setError(null);
    try {
      const response = await requestService.getAllRequests();
      const requests = response.requests || [];
      const normalized = requests.map(normalizeRequest);

      const pending = normalized.filter((req) => req.status === 'Pending');
      const active = normalized.filter((req) =>
        ['Accepted', 'In Progress'].includes(req.status)
      );
      const completed = normalized.filter((req) => req.status === 'Completed');

      setPendingRequests(pending);
      setActiveRequests(active);
      setCompletedRequests(completed);
    } catch (err) {
      setError(err.message || 'Failed to load advisor requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadThread = async (requestId, { silent } = {}) => {
    if (!silent) {
      setThreadLoading(true);
    }
    setError(null);

    try {
      const [requestRes, messagesRes] = await Promise.all([
        requestService.getRequestById(requestId),
        requestService.getRequestMessages(requestId),
      ]);

      const requestData = requestRes.request;
      const messages = (messagesRes.messages || []).map((msg) => {
        const senderPerson = msg.sender || {};
        const senderName = senderPerson.fullName || senderPerson.name || senderPerson.email || 'User';
        return {
          id: msg._id,
          sender: senderName,
          senderUser: senderPerson,
          role: msg.senderRole || 'Participant',
          timestamp: new Date(msg.createdAt).toLocaleString(),
          content: msg.content,
          attachments: (msg.attachments || []).map(
            (file) => file.fileName || 'Attachment'
          ),
        };
      });

      setSelectedThread({
        id: requestData._id,
        status: requestData.status,
        title: requestData.title,
        from: requestData.client?.fullName || 'Client',
        topic: requestData.topic,
        urgency: requestData.urgency,
        budget: requestData.budget || '—',
        description: requestData.description,
        timestamp: new Date(requestData.createdAt).toLocaleString(),
        attachments: requestData.attachments || [],
        participants: {
          client: requestData.client,
          advisor: requestData.advisor,
        },
        messages,
      });

      requestService.markMessagesAsRead(requestId).catch(() => {});
    } catch (err) {
      setError(err.message || 'Failed to load conversation.');
    } finally {
      if (!silent) {
        setThreadLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAdvisorRequests();
  }, []);

  useEffect(() => {
    if (!selectedThread) return;
    const interval = setInterval(() => {
      loadThread(selectedThread.id, { silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedThread]);

  const getRequestsByTab = () => {
    switch (activeTab) {
      case 'pending':
        return pendingRequests;
      case 'active':
        return activeRequests;
      case 'completed':
        return completedRequests;
      default:
        return [];
    }
  };

  const viewThread = (request) => {
    loadThread(request.id);
    setResponseText('');
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await requestService.acceptRequest(requestId);
      await fetchAdvisorRequests();
      setActiveTab('active');
      if (selectedThread?.id === requestId) {
        await loadThread(requestId);
      }
    } catch (err) {
      setError(err.message || 'Failed to accept request.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    try {
      await requestService.declineRequest(requestId);
      await fetchAdvisorRequests();
      if (selectedThread?.id === requestId) {
        setSelectedThread(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to decline request.');
    }
  };

  const handleDeleteCompleted = (requestId) => {
    if (!window.confirm('Are you sure you want to remove this completed request?')) return;
    requestService.updateRequestStatus(requestId, 'Cancelled')
      .then(() => {
        fetchAdvisorRequests();
        if (selectedThread?.id === requestId) {
          loadThread(requestId);
        }
      })
      .catch((err) => setError(err.message || 'Failed to update request.'));
  };

  const handleEndConversation = async () => {
    if (!selectedThread) return;
    const confirmed = window.confirm(
      'End conversation?\n\nAre you sure you want to end this conversation? You and the client will no longer be able to send new messages on this request.'
    );
    if (!confirmed) return;

    try {
      await requestService.updateRequestStatus(selectedThread.id, 'Closed');
      await loadThread(selectedThread.id, { silent: true });
      await fetchAdvisorRequests();
      setResponseText('');
      setActiveTab('completed');
    } catch (err) {
      setError(err.message || 'Failed to end conversation.');
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      alert('Please enter a response before sending');
      return;
    }

    try {
      await requestService.sendMessage(selectedThread.id, responseText);
      await loadThread(selectedThread.id);
      await fetchAdvisorRequests();
      setActiveTab('active');
      setResponseText('');
    } catch (err) {
      setError(err.message || 'Failed to send response.');
    }
  };

  const handleSaveDraft = () => {
    if (!responseText.trim()) {
      alert('Nothing to save');
      return;
    }

    console.log('Draft saved:', responseText);
    alert('Draft saved successfully!');
  };

  const handleReplyFormChange = (e) => {
    const { name, value } = e.target;
    setReplyForm({
      ...replyForm,
      [name]: value
    });
  };

  const handleReplyFormSubmit = async (e) => {
    e.preventDefault();

    if (!replyForm.message.trim()) {
      alert('Please enter a message before sending');
      return;
    }

    if (!selectedThread) {
      alert('Open a request thread first to reply.');
      return;
    }

    try {
      await requestService.sendMessage(selectedThread.id, replyForm.message);
      await loadThread(selectedThread.id);
      await fetchAdvisorRequests();
      setActiveTab('active');
      setShowReplyModal(false);
      setReplyForm({
        clientName: '',
        subject: '',
        message: '',
        attachments: []
      });
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    }
  };

  // Thread View
  if (selectedThread) {
    const clientInfo = selectedThread.participants?.client;
    const advisorInfo = selectedThread.participants?.advisor;
    const clientAvatar = getAvatarProps(clientInfo || { fullName: selectedThread.from }, 'Client');
    const advisorAvatar = getAvatarProps(advisorInfo || {}, 'Advisor');
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
        <FinancialSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 relative ml-64 pt-24">
        <div className="max-w-7xl mx-auto">
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

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          )}

          {threadLoading && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/70 dark:text-slate-200">
              Loading conversation...
            </div>
          )}

          {/* Header Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 mb-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-300 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{selectedThread.title}</h2>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {selectedThread.from}
                    </span>
                    <span>•</span>
                    <span className="text-slate-800 dark:text-gray-300">{selectedThread.topic}</span>
                    <span>•</span>
                    <span>Urgency: <span className={`font-semibold ${getUrgencyColor(selectedThread.urgency)}`}>{selectedThread.urgency}</span></span>
                    <span>•</span>
                    <span>Budget: <span className="text-emerald-600 font-semibold dark:text-green-400">{selectedThread.budget}</span></span>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedThread.status)}`}>
                  {selectedThread.status}
                </span>
              </div>

              {selectedThread.status === 'Pending' && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleAcceptRequest(selectedThread.id)}
                    className={`${advisorPrimaryButtonClasses} flex items-center gap-2 shadow-teal-500/20`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Accept Request</span>
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(selectedThread.id)}
                    className={`${advisorDangerButtonClasses} flex items-center gap-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages */}
            <div className="lg:col-span-2 space-y-4">
              {selectedThread.messages.map((message, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-5 blur transition duration-300"></div>
                  <div className="relative bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
                    <div className="flex items-start space-x-4">
                      {(() => {
                        const senderAvatar = getAvatarProps(message.senderUser || { fullName: message.sender }, message.sender);
                        return (
                          <div className={`w-12 h-12 bg-gradient-to-br ${senderAvatar.gradient} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg ring-2 ring-white/10`}>
                            {senderAvatar.initial}
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">{message.sender}</span>
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-gray-400 rounded-full">{message.role}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {message.timestamp}
                        </p>
                        <p className="text-slate-800 dark:text-gray-200 leading-relaxed">{message.content}</p>
                      
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 dark:bg-slate-900/60 dark:border-slate-600/50 hover:border-teal-500/50 cursor-pointer transition-all group">
                                <svg className="w-4 h-4 text-teal-500 group-hover:text-teal-600 dark:text-teal-400 dark:group-hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 dark:text-gray-300 dark:group-hover:text-white">{file}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Response Box */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-5 blur transition duration-300"></div>
                <div className="relative bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
                  {conversationClosed && (
                    <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-100">
                      Conversation closed
                    </div>
                  )}
                  <label className="block text-sm font-semibold text-slate-800 dark:text-gray-200 mb-3 tracking-wide">
                    Your Professional Response
                  </label>
                  <textarea
                    rows="6"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    disabled={conversationClosed}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4 transition-all duration-200 dark:bg-slate-900/60 dark:border-slate-600 dark:text-white dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Provide your professional advice, recommendations, or ask follow-up questions..."
                  />
                  <div className="bg-teal-500/5 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-teal-700 dark:text-teal-300 flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Tip:</strong> Provide detailed, actionable advice. Include specific strategies, calculations if relevant, and explain your reasoning.</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSendResponse}
                      className={`${advisorPrimaryButtonClasses} flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={conversationClosed}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Response</span>
                    </button>
                    <button className={`${advisorGhostButtonClasses} flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`} disabled={conversationClosed}>
                      Attach Files
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className={`${advisorGhostButtonClasses} flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={conversationClosed}
                    >
                      Save Draft
                    </button>
                    <Button
                      type="button"
                      variant="danger"
                      className="!px-4 !py-2.5 rounded-2xl"
                      onClick={handleEndConversation}
                      disabled={conversationClosed}
                    >
                      End Conversation
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client Information
                </h3>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-100 rounded-lg border border-slate-200 dark:bg-slate-900/40 dark:border-slate-700/30">
                  <div className={`w-12 h-12 bg-gradient-to-br ${clientAvatar.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/10`}>
                    {clientAvatar.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{clientAvatar.name}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Client</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {clientInfo?.email && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/30">
                      <span className="text-slate-600 dark:text-gray-400">Email</span>
                      <span className="text-slate-900 dark:text-white font-medium">{clientInfo.email}</span>
                    </div>
                  )}
                  {clientInfo?.phoneNumber && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/30">
                      <span className="text-slate-600 dark:text-gray-400">Phone</span>
                      <span className="text-slate-900 dark:text-white font-medium">{clientInfo.phoneNumber}</span>
                    </div>
                  )}
                  {clientInfo?.address && (
                    <div className="flex justify-between items-start py-2">
                      <span className="text-slate-600 dark:text-gray-400">Address</span>
                      <span className="text-slate-900 dark:text-white font-medium text-right">{clientInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Request Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Submitted</p>
                    <p className="text-slate-900 dark:text-white font-medium">{selectedThread.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">Status</p>
                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedThread.status)}`}>
                      {selectedThread.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Expected compensation</p>
                    <p className="text-emerald-600 font-bold text-xl dark:text-green-400">{selectedThread.budget}</p>
                  </div>
                  {selectedThread.attachments && selectedThread.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedThread.attachments.map((file, idx) => (
                          <span
                            key={file._id || idx}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-600/50 dark:bg-white/5 dark:text-white"
                          >
                            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {file.fileName || 'Attachment'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2.5 text-left bg-white border border-slate-200 text-slate-900 rounded-lg transition-all text-sm hover-border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white dark:hover:border-teal-500/50 group">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-teal-500 dark:text-gray-400 dark:group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Client History
                    </span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left bg-white border border-slate-200 text-slate-900 rounded-lg transition-all text-sm hover-border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white dark:hover:border-teal-500/50 group">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-teal-500 dark:text-gray-400 dark:group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Meeting
                    </span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left bg-white border border-slate-200 text-slate-900 rounded-lg transition-all text-sm hover-border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white dark:hover:border-teal-500/50 group">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-teal-500 dark:text-gray-400 dark:group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Request More Info
                    </span>
                  </button>
                </div>
              </div>

              {/* Private Notes */}
              <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Private Notes
                </h3>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm transition-all duration-200 dark:bg-slate-900/60 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
                  placeholder="Add private notes about this request (not visible to client)..."
                />
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
      <FinancialSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 relative ml-64 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-500 font-semibold mb-3">Portfolio</p>
            <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Client Requests</h2>
            <p className="text-slate-500 mt-3 max-w-2xl">
              Stay on top of new client outreach, prioritize urgent asks, and keep conversations moving in one clean workspace.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-semibold shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {pendingRequests.length} pending
              </span>
              <span className="text-xs text-slate-500">Auto-refreshes every few minutes</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Pending</p>
              <p className="text-3xl font-bold text-amber-700 mt-2">{pendingRequests.length}</p>
              <p className="text-xs text-amber-600/80 mt-1">Awaiting review</p>
            </div>
            <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Active</p>
              <p className="text-3xl font-bold text-sky-700 mt-2">{activeRequests.length}</p>
              <p className="text-xs text-sky-600/80 mt-1">In conversation</p>
            </div>
            <div className="p-4 rounded-2xl border border-violet-100 bg-violet-50 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Completed</p>
              <p className="text-3xl font-bold text-violet-700 mt-2">{completedRequests.length}</p>
              <p className="text-xs text-violet-600/80 mt-1">Wrapped up</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-4 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-white shadow-xl text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700/50'
                : 'text-slate-500 border border-transparent hover:border-slate-200 hover:bg-white/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30'
            }`}
          >
            <span className={`w-9 h-9 rounded-2xl flex items-center justify-center ${activeTab === 'pending' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-gray-300'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="text-left">
              <p>Pending</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{pendingRequests.length} requests</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
              {pendingRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-4 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-white shadow-xl text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700/50'
                : 'text-slate-500 border border-transparent hover:border-slate-200 hover:bg-white/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30'
            }`}
          >
            <span className={`w-9 h-9 rounded-2xl flex items-center justify-center ${activeTab === 'active' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-gray-300'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
            <div className="text-left">
              <p>Active</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{activeRequests.length} requests</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600">
              {activeRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-4 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-white shadow-xl text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700/50'
                : 'text-slate-500 border border-transparent hover:border-slate-200 hover:bg-white/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30'
            }`}
          >
            <span className={`w-9 h-9 rounded-2xl flex items-center justify-center ${activeTab === 'completed' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-gray-300'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="text-left">
              <p>Completed</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{completedRequests.length} requests</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
              {completedRequests.length}
            </span>
          </button>
        </div>

        {/* Request Cards */}
        <div className="space-y-5">
          {loadingRequests && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200">
              Loading requests...
            </div>
          )}
          {!loadingRequests && getRequestsByTab().length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200">
              No requests in this view yet.
            </div>
          )}
          {getRequestsByTab().map((request) => (
            <div key={request.id} className="relative group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-200 via-blue-200 to-purple-200 opacity-0 group-hover:opacity-70 blur-3xl transition duration-500 pointer-events-none"></div>
              <div className="relative bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_35px_90px_rgba(15,23,42,0.08)] dark:bg-slate-800/70 dark:border-slate-700/50">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-semibold text-slate-700 dark:text-gray-300">{request.from}</span>
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">{request.title}</h3>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {request.timestamp}
                      </span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-gray-300">{request.topic}</span>
                      <span>•</span>
                      <span>Urgency: <span className={`font-semibold ${getUrgencyColor(request.urgency)}`}>{request.urgency}</span></span>
                      <span>•</span>
                      <span>Budget: <span className="text-emerald-600 font-bold dark:text-green-400">{request.budget}</span></span>
                    </div>

                    <p className="text-slate-600 dark:text-gray-200 leading-relaxed">{request.description}</p>
                  </div>
                
                  <div className="flex flex-col space-y-2 lg:ml-6">
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className={`${advisorPrimaryButtonClasses} w-full flex items-center justify-center gap-2`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => viewThread(request)}
                          className={`${advisorGhostButtonClasses} w-full`}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className={`${advisorDangerButtonClasses} w-full flex items-center justify-center gap-2`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Decline</span>
                        </button>
                      </>
                    ) : activeTab === 'completed' ? (
                      <>
                        <button
                          onClick={() => viewThread(request)}
                          className={`${advisorGhostButtonClasses} w-full`}
                        >
                          View Thread
                        </button>
                        <button
                          onClick={() => handleDeleteCompleted(request.id)}
                          className={`${advisorDangerButtonClasses} w-full flex items-center justify-center gap-2`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => viewThread(request)}
                        className={`${advisorGhostButtonClasses} w-full`}
                      >
                        View Thread
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setShowReplyModal(true)} />

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-slate-800 dark:border-slate-700">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Send Reply to Client</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleReplyFormSubmit} className="p-6 space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Compose your professional response to a client's financial request.
                </p>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={replyForm.clientName}
                    onChange={handleReplyFormChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={replyForm.subject}
                    onChange={handleReplyFormChange}
                    placeholder="e.g., Re: Investment Strategy for Q4"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Professional Response</label>
                  <textarea
                    name="message"
                    value={replyForm.message}
                    onChange={handleReplyFormChange}
                    rows="8"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none dark:bg-slate-900/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    placeholder="Provide your professional advice, recommendations, analysis, and actionable steps..."
                    required
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-2">
                    Include detailed strategies, calculations if relevant, and explain your reasoning clearly.
                  </p>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Attachments (optional)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:border-teal-400 transition-colors dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-slate-600">
                    <input type="file" className="hidden" id="reply-file-upload" multiple />
                    <label htmlFor="reply-file-upload" className="cursor-pointer">
                      <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">Choose Files</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-2">PDF, Excel, or Images. Up to 10MB each.</p>
                  </div>
                </div>

                {/* Professional Tip */}
                <div className="bg-teal-500/5 border border-teal-200 rounded-lg p-4 dark:bg-teal-500/10 dark:border-teal-500/30">
                  <p className="text-xs text-teal-700 flex items-start gap-2 dark:text-teal-300">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Professional Tip:</strong> Ensure your response is clear, actionable, and tailored to the client's specific situation. Include relevant data, strategies, and next steps.</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-teal-500/20"
                  >
                    Send Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReplyModal(false)}
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

export default FinancialAdvisorPage;
