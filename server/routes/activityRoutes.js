const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// Get recent activities
router.get('/', protect, async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;