const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload, deleteOldImage } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Upload profile photo - MANUAL UPLOAD
router.post('/upload-photo', protect, upload.single('avatar'), async (req, res) => {
  try {
    console.log('📸 Manual photo upload request received');
    console.log('👤 User ID:', req.user.id);
    console.log('👤 User Email:', req.user.email);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select an image file to upload' 
      });
    }

    console.log('📁 File uploaded:', req.file.filename);
    console.log('📁 File path:', req.file.path);
    console.log('📁 File size:', req.file.size);

    // Get the current user to check for old avatar
    const currentUser = await User.findById(req.user.id);
    
    // Delete old profile image if exists
    if (currentUser && currentUser.avatar) {
      await deleteOldImage(currentUser.avatar);
    }

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user with new avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        avatar: imageUrl,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile photo updated successfully:', imageUrl);
    res.json({ 
      success: true, 
      data: user,
      message: 'Profile photo uploaded successfully!'
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    // Delete uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Cleaned up file:', req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload photo' 
    });
  }
});

// Update profile (with optional photo upload)
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    console.log('📝 Manual profile update request received');
    const { name, email, phone, department } = req.body;
    let avatar = req.user.avatar;

    // If a new file was uploaded
    if (req.file) {
      console.log('📁 New profile image uploaded:', req.file.filename);
      
      // Delete old profile image
      if (req.user.avatar) {
        await deleteOldImage(req.user.avatar);
      }
      
      avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, department, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile updated successfully');
    res.json({ 
      success: true, 
      data: user,
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user settings
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const settings = user.settings || {
      theme: 'light',
      notifications: true,
      emailAlerts: true
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user settings
router.put('/settings', protect, async (req, res) => {
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

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin only routes
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;