const Request = require('../models/request');
const Message = require('../models/message');
const Note = require('../models/note');
const Meeting = require('../models/meeting');
const User = require('../models/user');

// Create new advice request
exports.createRequest = async (req, res) => {
  try {
    const clientId = req.userId;
    const {
      title,
      topic,
      urgency,
      description,
      budget,
      preferredAdvisor,
      attachments
    } = req.body;

    // Validate required fields
    if (!title || !topic || !description) {
      return res.status(400).json({
        error: 'Title, topic, and description are required'
      });
    }

    // Create request
    const request = await Request.create({
      client: clientId,
      title,
      topic,
      urgency: urgency || 'Normal',
      description,
      budget,
      preferredAdvisor: preferredAdvisor || null,
      attachments: attachments || [],
      advisor: preferredAdvisor || null // Auto-assign if preferred advisor specified
    });

    await request.populate('client', 'fullName email');
    if (preferredAdvisor) {
      await request.populate('advisor', 'fullName email');
    }

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      error: error.message || 'Error creating request'
    });
  }
};

// Get all requests (filtered by user role)
exports.getAllRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const user = await User.findById(userId);

    let query = {};

    // If user is advisor, show requests assigned to them
    if (user.isAdvisor) {
      query.advisor = userId;
    } else {
      // If regular user, show their own requests
      query.client = userId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('client', 'fullName email phoneNumber')
      .populate('advisor', 'fullName email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching requests'
    });
  }
};

// Get single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const request = await Request.findById(id)
      .populate('client', 'fullName email phoneNumber address')
      .populate('advisor', 'fullName email');

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if user has access to this request
    if (request.client._id.toString() !== userId &&
        request.advisor?._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching request'
    });
  }
};

// Accept request (advisor only)
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const advisorId = req.userId;

    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can accept requests'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        error: 'Request has already been processed'
      });
    }

    request.status = 'Accepted';
    request.advisor = advisorId;
    await request.save();

    await request.populate('client', 'fullName email');
    await request.populate('advisor', 'fullName email');

    res.json({
      success: true,
      message: 'Request accepted successfully',
      request
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      error: error.message || 'Error accepting request'
    });
  }
};

// Decline request (advisor only)
exports.declineRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const advisorId = req.userId;

    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can decline requests'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Remove from advisor's queue
    if (request.advisor?.toString() === advisorId) {
      request.advisor = null;
    }

    request.status = 'Pending'; // Return to pending pool
    await request.save();

    res.json({
      success: true,
      message: 'Request declined'
    });
  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({
      error: error.message || 'Error declining request'
    });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const rawStatus = (req.body?.status || req.body?.newStatus || '').toString().trim();
    const userId = req.userId;

    console.log('🔄 Update request status payload:', req.body);

    const allowedStatuses = ['In Progress', 'Completed', 'Cancelled', 'Closed'];
    const normalizedStatus = rawStatus
      ? allowedStatuses.find(opt => opt.toLowerCase() === rawStatus.toLowerCase())
      : null;

    if (!normalizedStatus) {
      return res.status(400).json({
        error: 'Invalid status'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check permissions
    if (request.advisor?.toString() !== userId &&
        request.client.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    request.status = normalizedStatus;
    await request.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      request
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: error.message || 'Error updating status'
    });
  }
};

// Delete/Cancel request
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Only client can cancel their own request
    if (request.client.toString() !== userId) {
      return res.status(403).json({
        error: 'Only the client can cancel this request'
      });
    }

    // Can only cancel pending or accepted requests
    if (['In Progress', 'Completed'].includes(request.status)) {
      return res.status(400).json({
        error: 'Cannot cancel requests that are in progress or completed'
      });
    }

    request.status = 'Cancelled';
    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      error: error.message || 'Error cancelling request'
    });
  }
};

// Save draft response
exports.saveDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const advisorId = req.userId;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    if (request.advisor?.toString() !== advisorId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    request.draft = content;
    await request.save();

    res.json({
      success: true,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      error: error.message || 'Error saving draft'
    });
  }
};

// Get client history (for advisor viewing client's past requests)
exports.getClientHistory = async (req, res) => {
  try {
    const { clientId } = req.params;
    const advisorId = req.userId;

    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can view client history'
      });
    }

    const requests = await Request.find({
      client: clientId,
      advisor: advisorId
    }).sort('-createdAt');

    const client = await User.findById(clientId).select('fullName email createdAt');

    res.json({
      success: true,
      client: {
        ...client.toObject(),
        memberSince: client.createdAt,
        totalRequests: requests.length
      },
      requests
    });
  } catch (error) {
    console.error('Get client history error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching client history'
    });
  }
};

module.exports = exports;
