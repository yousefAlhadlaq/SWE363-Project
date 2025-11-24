const Note = require('../models/note');
const Request = require('../models/request');
const User = require('../models/user');

// Create a new note (advisor only)
exports.createNote = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { content } = req.body;
    const advisorId = req.userId;

    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Note content is required'
      });
    }

    // Check if user is advisor
    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can create notes'
      });
    }

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if advisor has access to this request
    if (request.advisor?.toString() !== advisorId) {
      return res.status(403).json({
        error: 'You can only create notes for your own requests'
      });
    }

    // Create note
    const note = await Note.create({
      request: requestId,
      advisor: advisorId,
      content: content.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: error.message || 'Error creating note'
    });
  }
};

// Get all notes for a request (advisor only)
exports.getRequestNotes = async (req, res) => {
  try {
    const { requestId } = req.params;
    const advisorId = req.userId;

    // Check if user is advisor
    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can view notes'
      });
    }

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if advisor has access to this request
    if (request.advisor?.toString() !== advisorId) {
      return res.status(403).json({
        error: 'You can only view notes for your own requests'
      });
    }

    // Get all notes for this request
    const notes = await Note.find({
      request: requestId,
      advisor: advisorId
    }).sort('-createdAt');

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching notes'
    });
  }
};

// Get all notes by advisor (across all requests)
exports.getAllAdvisorNotes = async (req, res) => {
  try {
    const advisorId = req.userId;

    // Check if user is advisor
    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can view notes'
      });
    }

    const notes = await Note.find({ advisor: advisorId })
      .populate('request', 'title topic status client')
      .populate({
        path: 'request',
        populate: {
          path: 'client',
          select: 'fullName email'
        }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching notes'
    });
  }
};

// Get single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const advisorId = req.userId;

    const note = await Note.findById(id)
      .populate('request', 'title topic status');

    if (!note) {
      return res.status(404).json({
        error: 'Note not found'
      });
    }

    // Check if advisor owns this note
    if (note.advisor.toString() !== advisorId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching note'
    });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const advisorId = req.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Note content is required'
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        error: 'Note not found'
      });
    }

    // Check if advisor owns this note
    if (note.advisor.toString() !== advisorId) {
      return res.status(403).json({
        error: 'You can only update your own notes'
      });
    }

    note.content = content.trim();
    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: error.message || 'Error updating note'
    });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const advisorId = req.userId;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        error: 'Note not found'
      });
    }

    // Check if advisor owns this note
    if (note.advisor.toString() !== advisorId) {
      return res.status(403).json({
        error: 'You can only delete your own notes'
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: error.message || 'Error deleting note'
    });
  }
};

// Search notes by content
exports.searchNotes = async (req, res) => {
  try {
    const advisorId = req.userId;
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    // Check if user is advisor
    const user = await User.findById(advisorId);
    if (!user.isAdvisor) {
      return res.status(403).json({
        error: 'Only advisors can search notes'
      });
    }

    // Search notes by content (case-insensitive)
    const notes = await Note.find({
      advisor: advisorId,
      content: { $regex: query, $options: 'i' }
    })
      .populate('request', 'title topic status client')
      .populate({
        path: 'request',
        populate: {
          path: 'client',
          select: 'fullName email'
        }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: notes.length,
      query: query,
      notes
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({
      error: error.message || 'Error searching notes'
    });
  }
};

module.exports = exports;
