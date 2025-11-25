const User = require('../models/user');
const AdvisorRequest = require('../models/advisorRequest');

// Get all available advisors
exports.getAllAdvisors = async (req, res) => {
  try {
    const advisors = await User.find({
      isAdvisor: true,
      'advisorProfile.availability': 'available'
    }).select('-password');

    res.json({
      success: true,
      count: advisors.length,
      advisors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get advisor by ID
exports.getAdvisorById = async (req, res) => {
  try {
    const advisor = await User.findById(req.params.id).select('-password');

    if (!advisor || !advisor.isAdvisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    res.json({
      success: true,
      advisor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Become an advisor (upgrade user to advisor)
exports.becomeAdvisor = async (req, res) => {
  try {
    const userId = req.userId;
    const { bio, credentials, specializations, yearsOfExperience, hourlyRate } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdvisor) {
      return res.status(400).json({ error: 'User is already an advisor' });
    }

    user.isAdvisor = true;
    user.role = 'advisor';
    user.advisorProfile = {
      bio,
      credentials: credentials || [],
      specializations: specializations || [],
      yearsOfExperience: yearsOfExperience || 0,
      hourlyRate: hourlyRate || 0,
      availability: 'available'
    };

    await user.save();

    res.json({
      success: true,
      message: 'Successfully registered as advisor',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update advisor profile
exports.updateAdvisorProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const user = await User.findById(userId);

    if (!user || !user.isAdvisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    // Update advisor profile fields
    if (updates.bio) user.advisorProfile.bio = updates.bio;
    if (updates.credentials) user.advisorProfile.credentials = updates.credentials;
    if (updates.specializations) user.advisorProfile.specializations = updates.specializations;
    if (updates.yearsOfExperience) user.advisorProfile.yearsOfExperience = updates.yearsOfExperience;
    if (updates.hourlyRate) user.advisorProfile.hourlyRate = updates.hourlyRate;
    if (updates.availability) user.advisorProfile.availability = updates.availability;

    await user.save();

    res.json({
      success: true,
      message: 'Advisor profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send connection request to advisor
exports.sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { advisorId, message } = req.body;

    // Check if advisor exists
    const advisor = await User.findById(advisorId);
    if (!advisor || !advisor.isAdvisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    // Check if request already exists
    const existingRequest = await AdvisorRequest.findOne({
      user: userId,
      advisor: advisorId
    });

    if (existingRequest) {
      return res.status(400).json({
        error: 'Connection request already sent',
        status: existingRequest.status
      });
    }

    // Create new request
    const request = await AdvisorRequest.create({
      user: userId,
      advisor: advisorId,
      message: message || ''
    });

    await request.populate('user', 'fullName email');
    await request.populate('advisor', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's connection requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await AdvisorRequest.find({ user: userId })
      .populate('advisor', 'fullName email advisorProfile')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get advisor's received requests
exports.getAdvisorRequests = async (req, res) => {
  try {
    const advisorId = req.userId;

    const user = await User.findById(advisorId);
    if (!user || !user.isAdvisor) {
      return res.status(403).json({ error: 'Access denied. Advisor only.' });
    }

    const requests = await AdvisorRequest.find({ advisor: advisorId })
      .populate('user', 'fullName email phoneNumber')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept/Reject connection request (advisor only)
exports.respondToRequest = async (req, res) => {
  try {
    const advisorId = req.userId;
    const { requestId } = req.params;
    const { status, responseMessage } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await AdvisorRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.advisor.toString() !== advisorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    request.status = status;
    request.responseMessage = responseMessage || '';
    await request.save();

    // If accepted, connect user to advisor
    if (status === 'accepted') {
      await User.findByIdAndUpdate(request.user, {
        connectedAdvisor: advisorId
      });
    }

    await request.populate('user', 'fullName email');

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's connected advisor
exports.getMyAdvisor = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate('connectedAdvisor', '-password');

    if (!user.connectedAdvisor) {
      return res.status(404).json({ error: 'No advisor connected' });
    }

    res.json({
      success: true,
      advisor: user.connectedAdvisor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Disconnect from advisor
exports.disconnectAdvisor = async (req, res) => {
  try {
    const userId = req.userId;

    await User.findByIdAndUpdate(userId, {
      connectedAdvisor: null
    });

    res.json({
      success: true,
      message: 'Disconnected from advisor successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update advisor availability status
exports.updateAvailability = async (req, res) => {
  try {
    const advisorId = req.userId;
    const { availability } = req.body;

    // Validate availability
    if (!['available', 'busy', 'unavailable'].includes(availability)) {
      return res.status(400).json({
        error: 'Invalid availability status. Must be: available, busy, or unavailable'
      });
    }

    const user = await User.findById(advisorId);

    if (!user || !user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can update availability'
      });
    }

    user.advisorProfile.availability = availability;
    await user.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: user.advisorProfile.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      error: error.message || 'Error updating availability'
    });
  }
};

// Get advisor availability
exports.getAvailability = async (req, res) => {
  try {
    const { advisorId } = req.params;

    const advisor = await User.findById(advisorId).select('advisorProfile.availability fullName');

    if (!advisor || !advisor.isAdvisor) {
      return res.status(404).json({
        error: 'Advisor not found'
      });
    }

    res.json({
      success: true,
      advisorId: advisor._id,
      advisorName: advisor.fullName,
      availability: advisor.advisorProfile.availability
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching availability'
    });
  }
};

// Get advisor statistics
exports.getAdvisorStats = async (req, res) => {
  try {
    const advisorId = req.userId;

    const user = await User.findById(advisorId);
    if (!user || !user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can view statistics'
      });
    }

    // Count requests
    const Request = require('../models/request');
    const totalRequests = await Request.countDocuments({ advisor: advisorId });
    const pendingRequests = await Request.countDocuments({
      advisor: advisorId,
      status: 'Pending'
    });
    const activeRequests = await Request.countDocuments({
      advisor: advisorId,
      status: { $in: ['Accepted', 'In Progress'] }
    });
    const completedRequests = await Request.countDocuments({
      advisor: advisorId,
      status: 'Completed'
    });

    // Count meetings
    const Meeting = require('../models/meeting');
    const totalMeetings = await Meeting.countDocuments({ advisor: advisorId });
    const upcomingMeetings = await Meeting.countDocuments({
      advisor: advisorId,
      status: 'Scheduled',
      dateTime: { $gte: new Date() }
    });

    // Count connected clients
    const connectedClients = await User.countDocuments({ connectedAdvisor: advisorId });

    res.json({
      success: true,
      stats: {
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          active: activeRequests,
          completed: completedRequests
        },
        meetings: {
          total: totalMeetings,
          upcoming: upcomingMeetings
        },
        clients: {
          connected: connectedClients
        },
        profile: {
          rating: user.advisorProfile.rating,
          totalReviews: user.advisorProfile.totalReviews,
          availability: user.advisorProfile.availability
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching statistics'
    });
  }
};

module.exports = exports;
