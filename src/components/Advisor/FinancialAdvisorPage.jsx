import React, { useState, useEffect } from 'react';
import FinancialSidebar from '../Shared/FinancialSidebar';

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

  // Fix white bar by setting body background directly
  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    const originalBodyBackground = document.body.style.background;
    const originalHtmlBackground = document.documentElement.style.background;

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'linear-gradient(to bottom right, #1e293b, #0f766e, #1e293b)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';

    document.documentElement.style.background = 'linear-gradient(to bottom right, #1e293b, #0f766e, #1e293b)';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      document.body.style.background = originalBodyBackground;
      document.documentElement.style.background = originalHtmlBackground;
    };
  }, []);

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
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'Accepted':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'In Progress':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'Completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border border-slate-600/30';
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

    const updatedThread = {
      ...selectedThread,
      messages: [...selectedThread.messages, newMessage]
    };

    // OPTIMISTIC UPDATE: Move request to Active if it's currently Pending
    if (selectedThread.status === 'Pending') {
      // Update status to Accepted
      updatedThread.status = 'Accepted';

      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(req => req.id !== selectedThread.id));

      // Add to active requests
      const activeRequest = {
        ...selectedThread,
        status: 'Accepted',
        messages: updatedThread.messages
      };
      setActiveRequests([...activeRequests, activeRequest]);

      // Switch to Active tab to show the request
      setActiveTab('active');

      console.log('Request moved to Active:', selectedThread.id);
    } else if (selectedThread.status === 'Accepted' || selectedThread.status === 'In Progress') {
      // If already active, just update the messages in active requests
      setActiveRequests(activeRequests.map(req =>
        req.id === selectedThread.id
          ? { ...req, messages: updatedThread.messages }
          : req
      ));
    }

    // Update the selected thread
    setSelectedThread(updatedThread);

    // Clear the response text
    setResponseText('');

    console.log('Response sent:', responseText);
    alert('Response sent successfully! Request moved to Active tab.');
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

  const handleReplyFormSubmit = (e) => {
    e.preventDefault();

    if (!replyForm.message.trim()) {
      alert('Please enter a message before sending');
      return;
    }

    // CASE 1: If there's a selected thread, add the reply to it
    if (selectedThread) {
      const newMessage = {
        sender: 'You (Advisor)',
        role: 'Advisor',
        timestamp: 'Just now',
        content: replyForm.message,
        attachments: replyForm.attachments || []
      };

      const updatedThread = {
        ...selectedThread,
        messages: [...selectedThread.messages, newMessage]
      };

      // OPTIMISTIC UPDATE: Move request to Active if it's currently Pending
      if (selectedThread.status === 'Pending') {
        // Update status to Accepted
        updatedThread.status = 'Accepted';

        // Remove from pending requests
        setPendingRequests(pendingRequests.filter(req => req.id !== selectedThread.id));

        // Add to active requests
        const activeRequest = {
          ...selectedThread,
          status: 'Accepted',
          messages: updatedThread.messages
        };
        setActiveRequests([...activeRequests, activeRequest]);

        // Switch to Active tab to show the request
        setActiveTab('active');

        console.log('Request moved to Active via modal:', selectedThread.id);
      } else if (selectedThread.status === 'Accepted' || selectedThread.status === 'In Progress') {
        // If already active, just update the messages in active requests
        setActiveRequests(activeRequests.map(req =>
          req.id === selectedThread.id
            ? { ...req, messages: updatedThread.messages }
            : req
        ));
      }

      // Update the selected thread
      setSelectedThread(updatedThread);

      console.log('Reply added to existing thread:', replyForm);
      alert('Reply sent successfully! Request moved to Active tab.');
    }
    // CASE 2: No selected thread - create a NEW request
    else {
      // Validate required fields for new request
      if (!replyForm.clientName.trim() || !replyForm.subject.trim()) {
        alert('Please enter both client name and subject for a new request');
        return;
      }

      // Generate new unique ID
      const allIds = [
        ...activeRequests.map(r => r.id),
        ...pendingRequests.map(r => r.id),
        ...completedRequests.map(r => r.id)
      ];
      const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

      // Create new request object
      const newRequest = {
        id: newId,
        status: 'Accepted',
        title: replyForm.subject,
        from: replyForm.clientName,
        timestamp: 'Just now',
        topic: 'General',
        urgency: 'Normal',
        description: replyForm.message,
        budget: 'TBD',
        messages: [{
          sender: 'You (Advisor)',
          role: 'Advisor',
          timestamp: 'Just now',
          content: replyForm.message,
          attachments: replyForm.attachments || []
        }]
      };

      // Add to active requests (at the beginning)
      setActiveRequests([newRequest, ...activeRequests]);

      // Switch to Active tab to show the new request
      setActiveTab('active');

      console.log('New request created:', newId);
      alert('New request created and added to Active tab!');
    }

    // Close modal and reset form
    setShowReplyModal(false);
    setReplyForm({
      clientName: '',
      subject: '',
      message: '',
      attachments: []
    });
  };

  // Thread View
  if (selectedThread) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
        {/* Decorative animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Sidebar */}
        <FinancialSidebar />

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
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {selectedThread.from}
                    </span>
                    <span>•</span>
                    <span className="text-gray-300">{selectedThread.topic}</span>
                    <span>•</span>
                    <span>Urgency: <span className={`font-semibold ${getUrgencyColor(selectedThread.urgency)}`}>{selectedThread.urgency}</span></span>
                    <span>•</span>
                    <span>Budget: <span className="text-green-400 font-semibold">{selectedThread.budget}</span></span>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedThread.status)}`}>
                  {selectedThread.status}
                </span>
              </div>

              {selectedThread.status === 'Pending' && (
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => handleAcceptRequest(selectedThread.id)}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 shadow-lg hover:shadow-green-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Accept Request</span>
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(selectedThread.id)}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg ring-2 ring-white/10">
                        {message.sender.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-white">{message.sender}</span>
                          <span className="px-2 py-0.5 text-xs bg-slate-700/50 text-gray-400 rounded-full">{message.role}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {message.timestamp}
                        </p>
                        <p className="text-gray-200 leading-relaxed">{message.content}</p>
                      
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-600/50 hover:border-teal-500/50 cursor-pointer transition-all group">
                                <svg className="w-4 h-4 text-teal-400 group-hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm text-gray-300 group-hover:text-white">{file}</span>
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
                <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                  <label className="block text-sm font-semibold text-gray-200 mb-3 tracking-wide">
                    Your Professional Response
                  </label>
                  <textarea
                    rows="6"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4 transition-all duration-200"
                    placeholder="Provide your professional advice, recommendations, or ask follow-up questions..."
                  />
                  <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-teal-300 flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Tip:</strong> Provide detailed, actionable advice. Include specific strategies, calculations if relevant, and explain your reasoning.</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSendResponse}
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 shadow-lg hover:shadow-teal-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Response</span>
                    </button>
                    <button className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-600/50">
                      Attach Files
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-600/50"
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client Information
                </h3>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/10">
                    {selectedThread.from.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedThread.from}</p>
                    <p className="text-sm text-gray-400">Client</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                    <span className="text-gray-400">Member since:</span>
                    <span className="text-white font-medium">Jan 2024</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                    <span className="text-gray-400">Total requests:</span>
                    <span className="text-white font-medium">8</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Average rating:</span>
                    <span className="text-yellow-400 font-medium">★★★★★ 4.9</span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Request Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Submitted</p>
                    <p className="text-white font-medium">{selectedThread.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Status</p>
                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedThread.status)}`}>
                      {selectedThread.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Expected compensation</p>
                    <p className="text-green-400 font-bold text-xl">{selectedThread.budget}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2.5 text-left bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all text-sm border border-slate-600/50 hover:border-teal-500/50 group">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Client History
                    </span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all text-sm border border-slate-600/50 hover:border-teal-500/50 group">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Meeting
                    </span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all text-sm border border-slate-600/50 hover:border-teal-500/50 group">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Request More Info
                    </span>
                  </button>
                </div>
              </div>

              {/* Private Notes */}
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Private Notes
                </h3>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm transition-all duration-200"
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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <FinancialSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">Client Requests</h2>
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
              {pendingRequests.length + activeRequests.length + completedRequests.length}
            </span>
          </div>

          {/* Stats */}
          <div className="flex space-x-6">
            <div className="text-center p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30">
              <p className="text-3xl font-bold text-yellow-400">{pendingRequests.length}</p>
              <p className="text-sm text-gray-400 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30">
              <p className="text-3xl font-bold text-blue-400">{activeRequests.length}</p>
              <p className="text-sm text-gray-400 mt-1">Active</p>
            </div>
            <div className="text-center p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30">
              <p className="text-3xl font-bold text-green-400">{completedRequests.length}</p>
              <p className="text-sm text-gray-400 mt-1">Completed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-slate-800/70 backdrop-blur-xl text-white border border-slate-700/50 shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pending ({pendingRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-slate-800/70 backdrop-blur-xl text-white border border-slate-700/50 shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Active ({activeRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-slate-800/70 backdrop-blur-xl text-white border border-slate-700/50 shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
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
            <div key={request.id} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
              <div className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-gray-300">{request.from}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">{request.title}</h3>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {request.timestamp}
                      </span>
                      <span>•</span>
                      <span className="text-gray-300">{request.topic}</span>
                      <span>•</span>
                      <span>Urgency: <span className={`font-semibold ${getUrgencyColor(request.urgency)}`}>{request.urgency}</span></span>
                      <span>•</span>
                      <span>Budget: <span className="text-green-400 font-bold">{request.budget}</span></span>
                    </div>

                    <p className="text-gray-200 leading-relaxed">{request.description}</p>
                  </div>
                
                  <div className="flex flex-col space-y-2 ml-4">
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => viewThread(request)}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/20"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => viewThread(request)}
                          className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-600/50"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Decline</span>
                        </button>
                      </>
                    ) : activeTab === 'completed' ? (
                      <>
                        <button
                          onClick={() => viewThread(request)}
                          className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-600/50"
                        >
                          View Thread
                        </button>
                        <button
                          onClick={() => handleDeleteCompleted(request.id)}
                          className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => viewThread(request)}
                        className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-600/50"
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
        <button
          onClick={() => setShowReplyModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
        >
          <svg className="w-8 h-8 text-slate-900 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Send Reply to Client</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleReplyFormSubmit} className="p-6 space-y-6">
                <p className="text-sm text-slate-400">
                  Compose your professional response to a client's financial request.
                </p>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={replyForm.clientName}
                    onChange={handleReplyFormChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={replyForm.subject}
                    onChange={handleReplyFormChange}
                    placeholder="e.g., Re: Investment Strategy for Q4"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Professional Response</label>
                  <textarea
                    name="message"
                    value={replyForm.message}
                    onChange={handleReplyFormChange}
                    rows="8"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Provide your professional advice, recommendations, analysis, and actionable steps..."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Include detailed strategies, calculations if relevant, and explain your reasoning clearly.
                  </p>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Attachments (optional)</label>
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-900/30 hover:border-slate-600 transition-colors">
                    <input type="file" className="hidden" id="reply-file-upload" multiple />
                    <label htmlFor="reply-file-upload" className="cursor-pointer">
                      <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-teal-400 hover:text-teal-300">Choose Files</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-2">PDF, Excel, or Images. Up to 10MB each.</p>
                  </div>
                </div>

                {/* Professional Tip */}
                <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                  <p className="text-xs text-teal-300 flex items-start gap-2">
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

export default FinancialAdvisorPage;
