const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload, deleteOldImage } = require('../middleware/upload');
const fs = require('fs');

// ========== GET all users (Admin only) ==========
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Get single user ==========
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Update own profile ==========
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    let avatar = req.user.avatar;

    if (req.file) {
      // delete old avatar logic if needed
      avatar = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, department, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Upload profile photo ==========
router.post('/upload-photo', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: imageUrl },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: user, message: 'Photo uploaded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Get user settings ==========
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = user.settings || { theme: 'light', notifications: true, emailAlerts: true };
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Update user settings ==========
router.put('/settings', protect, async (req, res) => {
  try {
    const { theme, notifications, emailAlerts } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings: { theme, notifications, emailAlerts } },
      { new: true }
    );
    res.json({ success: true, data: user.settings, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Admin: Update any user ==========
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;