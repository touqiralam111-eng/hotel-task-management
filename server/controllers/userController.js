const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');
const fs = require('fs');

// Update profile with photo upload
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    let avatar = req.user.avatar;

    // If file uploaded
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      avatar = result.secure_url;
      // Delete local file
      fs.unlinkSync(req.file.path);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, department, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true, 
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.path);
    fs.unlinkSync(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      data: user,
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};