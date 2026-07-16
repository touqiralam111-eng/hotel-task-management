const User = require('../models/User');

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    res.json({
      success: true,
      data: user.settings || {
        theme: 'light',
        notifications: true,
        emailAlerts: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { theme, notifications, emailAlerts } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        settings: { 
          theme: theme || 'light',
          notifications: notifications !== undefined ? notifications : true,
          emailAlerts: emailAlerts !== undefined ? emailAlerts : true
        } 
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};