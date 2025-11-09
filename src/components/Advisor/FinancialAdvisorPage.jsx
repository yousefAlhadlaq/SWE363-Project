import React, { useState } from 'react';
import FinancialSidebar from '../Shared/FinancialSidebar';

function FinancialAdvisorPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedThread, setSelectedThread] = useState(null);
  const [responseText, setResponseText] = useState('');

  // Mock data - Changed to allow state updates
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      status: 'Pending',
      title: 'Retirement portfolio rebalancing',
      from: 'Sarah Johnson',
      timestamp: '1h ago',
      topic: 'Portfolio',
      urgency: 'High',
      description: 'Need help rebalancing my retirement portfolio with focus on risk reduction...',
      budget: '$300.00'
    },
    {
      id: 2,
      status: 'Pending',
      title: 'Estate planning for large inheritance',
      from: 'Michael Chen',
      timestamp: '3h ago',
      topic: 'Planning',
      urgency: 'Normal',
      description: 'Recently inherited $500k and need guidance on tax-efficient strategies...',
      budget: '$450.00'
    }
  ]);

  const [activeRequests, setActiveRequests] = useState([
    {
      id: 3,
      status: 'Accepted',
      title: 'Investment strategy for Q4',
      from: 'John Doe',
      timestamp: '2h ago',
      topic: 'Portfolio',
      urgency: 'Normal',
      description: 'Looking for a conservative approach balancing ETFs and cash equivalents...',
      budget: '$250.00'
    }
  ]);

  const [completedRequests, setCompletedRequests] = useState([
    {
      id: 4,
      status: 'Completed',
      title: 'College savings plan',
      from: 'David Kim',
      timestamp: 'Sep 18',
      topic: 'Planning',
      urgency: 'Normal',
      description: 'Evaluate 529 vs. brokerage for 10-12 year horizon...',
      budget: '$150.00'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'Accepted':
        return 'bg-blue-900/30 text-blue-400';
      case 'In Progress':
        return 'bg-purple-900/30 text-purple-400';
      case 'Completed':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-white/10/30 text-white/60';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High':
        return 'text-red-400';
      case 'Normal':
        return 'text-blue-400';
      case 'Low':
        return 'text-white/60';
      default:
        return 'text-white/60';
    }
  };

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
    setSelectedThread({
      ...request,
      messages: [
        {
          sender: request.from,
          role: 'Client',
          timestamp: 'Submitted • 2 hours ago',
          content: request.description,
          attachments: ['financial_statement.pdf', 'current_portfolio.xlsx']
        }
      ]
    });
    setResponseText('');
  };

  const handleAcceptRequest = (requestId) => {
    // Find the request in pending
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      // Update status and move to active
      const acceptedRequest = { ...request, status: 'Accepted' };
      setActiveRequests([...activeRequests, acceptedRequest]);
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      
      // Update selected thread if it's open
      if (selectedThread && selectedThread.id === requestId) {
        setSelectedThread({ ...selectedThread, status: 'Accepted' });
      }
      
      console.log('Request accepted:', requestId);
      alert('Request accepted successfully!');
    }
  };

  const handleDeclineRequest = (requestId) => {
    if (window.confirm('Are you sure you want to decline this request?')) {
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      
      // Close thread if it's open
      if (selectedThread && selectedThread.id === requestId) {
        setSelectedThread(null);
      }
      
      console.log('Request declined:', requestId);
      alert('Request declined');
    }
  };

  const handleDeleteCompleted = (requestId) => {
    if (window.confirm('Are you sure you want to delete this completed request? This action cannot be undone.')) {
      // Remove from completed requests
      setCompletedRequests(completedRequests.filter(req => req.id !== requestId));
      
      // Close thread if it's open
      if (selectedThread && selectedThread.id === requestId) {
        setSelectedThread(null);
      }
      
      console.log('Completed request deleted:', requestId);
      alert('Request deleted successfully');
    }
  };

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      alert('Please enter a response before sending');
      return;
    }

    // Add the response to the thread
    const newMessage = {
      sender: 'You (Advisor)',
      role: 'Advisor',
      timestamp: 'Just now',
      content: responseText,
      attachments: []
    };

    setSelectedThread({
      ...selectedThread,
      messages: [...selectedThread.messages, newMessage]
    });

    // Clear the response text
    setResponseText('');
    
    console.log('Response sent:', responseText);
    alert('Response sent successfully!');
  };

  const handleSaveDraft = () => {
    if (!responseText.trim()) {
      alert('Nothing to save');
      return;
    }
    
    console.log('Draft saved:', responseText);
    alert('Draft saved successfully!');
  };

  // Thread View
  if (selectedThread) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-brand-midnight via-brand-deep to-brand-midnight">
        {/* Sidebar */}
        <FinancialSidebar />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedThread(null)}
            className="text-teal-400 hover:text-teal-300 mb-6 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Requests</span>
          </button>

          {/* Header Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedThread.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>Client: {selectedThread.from}</span>
                  <span>•</span>
                  <span>Topic: {selectedThread.topic}</span>
                  <span>•</span>
                  <span>Urgency: <span className={getUrgencyColor(selectedThread.urgency)}>{selectedThread.urgency}</span></span>
                  <span>•</span>
                  <span>Budget: <span className="text-green-400 font-semibold">{selectedThread.budget}</span></span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedThread.status)}`}>
                {selectedThread.status}
              </span>
            </div>

            {selectedThread.status === 'Pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAcceptRequest(selectedThread.id)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Accept Request</span>
                </button>
                <button
                  onClick={() => handleDeclineRequest(selectedThread.id)}
                  className="px-6 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Decline</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages */}
            <div className="lg:col-span-2 space-y-4">
              {selectedThread.messages.map((message, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {message.sender.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-semibold text-white">{message.sender}</span>
                        <span className="text-sm text-white/60">{message.role}</span>
                      </div>
                      <p className="text-sm text-white/60 mb-3">{message.timestamp}</p>
                      <p className="text-white/90 leading-relaxed">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-brand-deep/60 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-all">
                              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-white/80">{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Response Box */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Your Professional Response
                </label>
                <textarea
                  rows="6"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-deep/60 border border-white/10 rounded-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-brand-aqua focus:border-transparent resize-none mb-3"
                  placeholder="Provide your professional advice, recommendations, or ask follow-up questions..."
                />
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-purple-300">
                    💡 <strong>Tip:</strong> Provide detailed, actionable advice. Include specific strategies, calculations if relevant, and explain your reasoning.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleSendResponse}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Response</span>
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all">
                    Attach Files
                  </button>
                  <button 
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-brand-deep/40 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedThread.from.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedThread.from}</p>
                    <p className="text-sm text-white/60">Client</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Member since:</span>
                    <span className="text-white">Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total requests:</span>
                    <span className="text-white">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Average rating:</span>
                    <span className="text-yellow-400">★★★★★ 4.9</span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Request Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/60">Submitted</p>
                    <p className="text-white">{selectedThread.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(selectedThread.status)}`}>
                      {selectedThread.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Expected compensation</p>
                    <p className="text-green-400 font-semibold text-lg">{selectedThread.budget}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all text-sm">
                    View Client History
                  </button>
                  <button className="w-full px-4 py-2 text-left bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all text-sm">
                    Schedule Meeting
                  </button>
                  <button className="w-full px-4 py-2 text-left bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all text-sm">
                    Request More Info
                  </button>
                </div>
              </div>

              {/* Private Notes */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Private Notes</h3>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 bg-brand-deep/60 border border-white/10 rounded-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-brand-aqua focus:border-transparent resize-none text-sm"
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
    <div className="flex h-screen bg-gradient-to-br from-brand-midnight via-brand-deep to-brand-midnight">
      {/* Sidebar */}
      <FinancialSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold text-white">Client Requests</h2>
            <span className="bg-brand-accent text-brand-midnight text-sm font-bold px-3 py-1.5 rounded-full">
              {pendingRequests.length + activeRequests.length + completedRequests.length}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{pendingRequests.length}</p>
              <p className="text-sm text-white/60">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{activeRequests.length}</p>
              <p className="text-sm text-white/60">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{completedRequests.length}</p>
              <p className="text-sm text-white/60">Completed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pending ({pendingRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Active ({activeRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'completed'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Completed ({completedRequests.length})</span>
          </button>
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {getRequestsByTab().map((request) => (
            <div key={request.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-sm text-white/60">
                      From: <span className="font-medium text-white/80">{request.from}</span>
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{request.title}</h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-white/60 mb-3">
                    <span>{request.timestamp}</span>
                    <span>•</span>
                    <span>Topic: <span className="text-white/80">{request.topic}</span></span>
                    <span>•</span>
                    <span>Urgency: <span className={getUrgencyColor(request.urgency)}>{request.urgency}</span></span>
                    <span>•</span>
                    <span>Budget: <span className="text-green-400 font-semibold">{request.budget}</span></span>
                  </div>
                  
                  <p className="text-white/80">{request.description}</p>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        onClick={() => viewThread(request)}
                        className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Accept</span>
                      </button>
                      <button 
                        onClick={() => viewThread(request)}
                        className="px-5 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="px-5 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all flex items-center space-x-2"
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
                        className="px-5 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all"
                      >
                        View Thread
                      </button>
                      <button
                        onClick={() => handleDeleteCompleted(request.id)}
                        className="px-5 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all flex items-center space-x-2"
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
                      className="px-5 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-all"
                    >
                      View Thread
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

export default FinancialAdvisorPage;
