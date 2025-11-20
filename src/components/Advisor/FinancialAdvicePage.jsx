import React, { useState, useEffect } from 'react';
import Button from '../Shared/Button';
import InputField from '../Shared/InputField';
import Sidebar from '../Shared/Sidebar';

function FinancialAdvicePage() {
  const [activeTab, setActiveTab] = useState('sent');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Fix white bar by setting body background directly
  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    const originalBodyBackground = document.body.style.background;
    const originalHtmlBackground = document.documentElement.style.background;

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'linear-gradient(to bottom right, #0f172a, rgba(15, 23, 42, 0.7), #0f172a)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';

    document.documentElement.style.background = 'linear-gradient(to bottom right, #0f172a, rgba(15, 23, 42, 0.7), #0f172a)';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      document.body.style.background = originalBodyBackground;
      document.documentElement.style.background = originalHtmlBackground;
    };
  }, []);
  
  const [request, setRequest] = useState({
    topic: '',
    urgency: '',
    subject: '',
    description: '',
    budget: '',
    preferredAdvisor: '',
    consent: false
  });

  // Mock data
  const [sentRequests, setSentRequests] = useState([
    {
      id: 1,
      status: 'Pending',
      title: 'Investment strategy for Q4',
      timestamp: '2h ago',
      topic: 'Portfolio',
      description: 'Looking for a conservative approach balancing ETFs and cash equivalents...',
      budget: '$250.00'
    },
    {
      id: 2,
      status: 'Answered',
      title: 'College savings plan',
      timestamp: 'Sep 18',
      topic: 'Planning',
      description: 'Evaluate 529 vs. brokerage for 10-12 year horizon...',
      budget: '$150.00'
    }
  ]);

  const [receivedRequests] = useState([
    {
      id: 3,
      status: 'Accepted',
      title: 'Tax planning for bonuses',
      timestamp: 'Yesterday',
      topic: 'Tax',
      description: 'Need guidance on RSU liquidation and withholding impacts...',
      from: 'Alex Morgan'
    }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRequest({
      ...request,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new request object with current timestamp and status
    const newRequest = {
      id: Date.now(), // Generate a unique ID
      status: 'Pending',
      title: request.subject,
      timestamp: 'Just now',
      topic: request.topic,
      description: request.description,
      budget: request.budget ? `$${request.budget}` : 'Not specified',
      urgency: request.urgency,
      preferredAdvisor: request.preferredAdvisor
    };

    // Add the new request to sent requests
    setSentRequests(prevRequests => [newRequest, ...prevRequests]);

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
  };
  const handleCancelRequest = (requestId) => {
    // First, show a confirmation dialog
    const confirmCancel = window.confirm('Are you sure you want to cancel this request?');
    
    if (confirmCancel) {
      // In a real application, you would make an API call here
      // For now, we'll update the local state
      setSentRequests(prevRequests => 
        prevRequests.filter(request => request.id !== requestId)
      );

      // Show a success message
      alert('Request cancelled successfully');
    }
  }

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    // Create new message object
    const newMessage = {
      sender: 'You',
      role: 'Requester',
      timestamp: 'Just now',
      content: replyMessage,
      attachments: []
    };

    // Update the thread with the new message
    setSelectedThread(prevThread => ({
      ...prevThread,
      messages: [...prevThread.messages, newMessage]
    }));

    // Clear the reply input
    setReplyMessage('');
  }

  const viewThread = (requestItem) => {
    setSelectedThread({
      ...requestItem,
      messages: [
        {
          sender: 'You',
          role: 'Requester',
          timestamp: 'Submitted • 2 hours ago',
          content: requestItem.description,
          attachments: ['cashflow_Q3.csv', 'notes.pdf']
        },
        {
          sender: 'Alex Morgan',
          role: 'Advisor',
          timestamp: 'Accepted • 1 hour ago',
          content: "Accepted. I'll share an allocation with a cash ladder and short-duration bond sleeve. Expect a draft shortly.",
          attachments: []
        }
      ]
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'Accepted':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/30';
      case 'Answered':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border border-slate-600/30';
    }
  };

  // Thread View
  if (selectedThread) {
    return (
      <div className="flex min-h-full bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-900">
        {/* Decorative animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 relative">
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

          {/* Header Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
            <div className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6 hover:border-slate-600/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">{selectedThread.title}</h2>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
                    <span className="text-gray-300">{selectedThread.topic}</span>
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
              {selectedThread.messages.map((message, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {message.sender.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-semibold text-white">{message.sender}</span>
                        <span className="text-sm text-slate-400">{message.role}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{message.timestamp}</p>
                      <p className="text-slate-200 leading-relaxed">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700">
                              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-slate-300">{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply Box */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Add a reply
                </label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4"
                  placeholder="Type your message or follow-up question..."
                />
                <button 
                  onClick={handleSendReply}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors"
                >
                  Send Reply
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      Y
                    </div>
                    <div>
                      <p className="text-white font-medium">You</p>
                      <p className="text-sm text-slate-400">Requester</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <p className="text-white font-medium">Alex Morgan</p>
                      <p className="text-sm text-slate-400">Advisor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Created</p>
                    <p className="text-white">Today • 09:12</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Last activity</p>
                    <p className="text-white">30 minutes ago</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
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
    <div className="flex min-h-full bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-900">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">Financial Advice</h2>
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
              {sentRequests.length + receivedRequests.length}
            </span>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              activeTab === 'sent'
                ? 'bg-slate-800/70 backdrop-blur-xl text-white border border-slate-700/50 shadow-lg'
                : 'bg-slate-800/30 border border-slate-700/30 text-gray-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-600/50'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              activeTab === 'received'
                ? 'bg-slate-800/70 backdrop-blur-xl text-white border border-slate-700/50 shadow-lg'
                : 'bg-slate-800/30 border border-slate-700/30 text-gray-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-600/50'
            }`}
          >
            Received
          </button>
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {activeTab === 'sent' ? (
            sentRequests.map((req) => (
                <div key={req.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
                  <div className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <h3 className="text-lg font-bold text-white">{req.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                          <span>Submitted • {req.timestamp} • Topic: <span className="text-gray-300">{req.topic}</span></span>
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed">{req.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => viewThread(req)}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-all text-sm border border-slate-600/50"
                      >
                        View
                      </button>
                      {req.status === 'Pending' && (
                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium rounded-lg transition-all text-sm" onClick={() => handleCancelRequest(req.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              receivedRequests.map((req) => (
                <div key={req.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
                  <div className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <h3 className="text-lg font-bold text-white">{req.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          Updated • {req.timestamp} • Topic: <span className="text-gray-300">{req.topic}</span>
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed">{req.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => viewThread(req)}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-all text-sm mt-4 border border-slate-600/50"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowRequestModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-yellow-500 hover:bg-yellow-400 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        >
          <svg className="w-7 h-7 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Request Financial Advice</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <p className="text-sm text-slate-400">
                  Fill in the details below and submit your request.
                </p>

                {/* Topic and Urgency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                    <select
                      name="topic"
                      value={request.topic}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Urgency</label>
                    <select
                      name="urgency"
                      value={request.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={request.subject}
                    onChange={handleChange}
                    placeholder="Short summary (e.g., 'Diversify ETF portfolio')"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Details</label>
                  <textarea
                    name="description"
                    value={request.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Provide context, timeframe, constraints, and goals..."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Avoid sharing sensitive personal data. Attach documents below if needed.
                  </p>
                </div>

                {/* Budget and Preferred Advisor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Budget (optional)</label>
                    <input
                      type="text"
                      name="budget"
                      value={request.budget}
                      onChange={handleChange}
                      placeholder="e.g., $50.00"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Advisor (optional)</label>
                    <input
                      type="text"
                      name="preferredAdvisor"
                      value={request.preferredAdvisor}
                      onChange={handleChange}
                      placeholder="Name or leave blank"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Attachments (optional)</label>
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-900/30 hover:border-slate-600 transition-colors">
                    <input type="file" className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-teal-400 hover:text-teal-300">Choose File</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-2">PDF, CSV, or Images. Up to 10MB each.</p>
                  </div>
                </div>

                {/* Consent */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={request.consent}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 bg-slate-900/50 border-slate-700 rounded focus:ring-teal-500"
                    required
                  />
                  <label className="text-sm text-slate-300">
                    I consent to sharing this information for financial advice purposes.
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold rounded-lg transition-all"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all"
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