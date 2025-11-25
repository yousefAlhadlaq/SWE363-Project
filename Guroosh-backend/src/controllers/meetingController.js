const Meeting = require('../models/meeting');
const Request = require('../models/request');
const User = require('../models/user');

// Schedule a new meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { dateTime, duration, location, meetingType, notes } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!dateTime) {
      return res.status(400).json({
        error: 'Meeting date and time are required'
      });
    }

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if user has access to this request
    if (request.client.toString() !== userId &&
        request.advisor?.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Ensure request has an advisor assigned
    if (!request.advisor) {
      return res.status(400).json({
        error: 'Cannot schedule meeting - no advisor assigned to this request'
      });
    }

    // Validate date is in the future
    if (new Date(dateTime) <= new Date()) {
      return res.status(400).json({
        error: 'Meeting date must be in the future'
      });
    }

    // Create meeting
    const meeting = await Meeting.create({
      request: requestId,
      client: request.client,
      advisor: request.advisor,
      dateTime: new Date(dateTime),
      duration: duration || 60,
      location: location || '',
      meetingType: meetingType || 'Video Call',
      notes: notes || '',
      scheduledBy: userId
    });

    await meeting.populate([
      { path: 'client', select: 'fullName email phoneNumber' },
      { path: 'advisor', select: 'fullName email' },
      { path: 'request', select: 'title topic' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      meeting
    });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({
      error: error.message || 'Error scheduling meeting'
    });
  }
};

// Get all meetings for a user
exports.getUserMeetings = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let query = {
      $or: [
        { client: userId },
        { advisor: userId }
      ]
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('client', 'fullName email phoneNumber')
      .populate('advisor', 'fullName email')
      .populate('request', 'title topic')
      .sort('dateTime');

    res.json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching meetings'
    });
  }
};

// Get meetings for a specific request
exports.getRequestMeetings = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if user has access to this request
    if (request.client.toString() !== userId &&
        request.advisor?.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const meetings = await Meeting.find({ request: requestId })
      .populate('client', 'fullName email phoneNumber')
      .populate('advisor', 'fullName email')
      .sort('dateTime');

    res.json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.error('Get request meetings error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching meetings'
    });
  }
};

// Get single meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const meeting = await Meeting.findById(id)
      .populate('client', 'fullName email phoneNumber')
      .populate('advisor', 'fullName email')
      .populate('request', 'title topic description');

    if (!meeting) {
      return res.status(404).json({
        error: 'Meeting not found'
      });
    }

    // Check if user has access to this meeting
    if (meeting.client._id.toString() !== userId &&
        meeting.advisor._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching meeting'
    });
  }
};

// Update meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateTime, duration, location, meetingType, notes } = req.body;
    const userId = req.userId;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        error: 'Meeting not found'
      });
    }

    // Check if user has access to this meeting
    if (meeting.client.toString() !== userId &&
        meeting.advisor.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Cannot update completed or cancelled meetings
    if (meeting.status !== 'Scheduled') {
      return res.status(400).json({
        error: 'Cannot update meetings that are completed or cancelled'
      });
    }

    // Validate new date is in the future if provided
    if (dateTime && new Date(dateTime) <= new Date()) {
      return res.status(400).json({
        error: 'Meeting date must be in the future'
      });
    }

    // Update fields
    if (dateTime) meeting.dateTime = new Date(dateTime);
    if (duration) meeting.duration = duration;
    if (location !== undefined) meeting.location = location;
    if (meetingType) meeting.meetingType = meetingType;
    if (notes !== undefined) meeting.notes = notes;

    await meeting.save();

    await meeting.populate([
      { path: 'client', select: 'fullName email phoneNumber' },
      { path: 'advisor', select: 'fullName email' },
      { path: 'request', select: 'title topic' }
    ]);

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      error: error.message || 'Error updating meeting'
    });
  }
};

// Cancel meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.userId;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        error: 'Meeting not found'
      });
    }

    // Check if user has access to this meeting
    if (meeting.client.toString() !== userId &&
        meeting.advisor.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Cannot cancel already completed or cancelled meetings
    if (meeting.status === 'Completed') {
      return res.status(400).json({
        error: 'Cannot cancel completed meetings'
      });
    }

    if (meeting.status === 'Cancelled') {
      return res.status(400).json({
        error: 'Meeting is already cancelled'
      });
    }

    meeting.status = 'Cancelled';
    meeting.cancellationReason = cancellationReason || '';
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel meeting error:', error);
    res.status(500).json({
      error: error.message || 'Error cancelling meeting'
    });
  }
};

// Mark meeting as completed
exports.completeMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        error: 'Meeting not found'
      });
    }

    // Only advisor can mark as completed
    if (meeting.advisor.toString() !== userId) {
      return res.status(403).json({
        error: 'Only the advisor can mark meetings as completed'
      });
    }

    if (meeting.status === 'Completed') {
      return res.status(400).json({
        error: 'Meeting is already completed'
      });
    }

    if (meeting.status === 'Cancelled') {
      return res.status(400).json({
        error: 'Cannot complete a cancelled meeting'
      });
    }

    meeting.status = 'Completed';
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting marked as completed'
    });
  } catch (error) {
    console.error('Complete meeting error:', error);
    res.status(500).json({
      error: error.message || 'Error completing meeting'
    });
  }
};

// Get upcoming meetings (next 7 days)
exports.getUpcomingMeetings = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const meetings = await Meeting.find({
      $or: [
        { client: userId },
        { advisor: userId }
      ],
      status: 'Scheduled',
      dateTime: {
        $gte: now,
        $lte: nextWeek
      }
    })
      .populate('client', 'fullName email')
      .populate('advisor', 'fullName email')
      .populate('request', 'title topic')
      .sort('dateTime');

    res.json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching upcoming meetings'
    });
  }
};

module.exports = exports;
