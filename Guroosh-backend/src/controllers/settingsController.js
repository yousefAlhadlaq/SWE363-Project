const Settings = require('../models/settings');

// Get user settings
exports.getSettings = async (req, res) => {
  try {
    const userId = req.userId;

    let settings = await Settings.findOne({ user: userId });

    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({ user: userId });
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    let settings = await Settings.findOne({ user: userId });

    if (!settings) {
      settings = await Settings.create({
        user: userId,
        ...updates
      });
    } else {
      // Update preferences
      if (updates.preferences) {
        settings.preferences = {
          ...settings.preferences,
          ...updates.preferences
        };
      }

      // Update notifications
      if (updates.notifications) {
        settings.notifications = {
          ...settings.notifications,
          ...updates.notifications
        };
      }

      // Update privacy
      if (updates.privacy) {
        settings.privacy = {
          ...settings.privacy,
          ...updates.privacy
        };
      }

      await settings.save();
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset settings to default
exports.resetSettings = async (req, res) => {
  try {
    const userId = req.userId;

    await Settings.findOneAndDelete({ user: userId });

    const settings = await Settings.create({ user: userId });

    res.json({
      success: true,
      message: 'Settings reset to default',
      settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
