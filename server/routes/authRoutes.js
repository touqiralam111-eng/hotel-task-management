const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ========== Register ==========
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, department } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        const user = await User.create({ name, email, password, phone, department, role: 'staff' });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name, email, role: user.role, department }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== Login ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== Get current user ==========
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== Change password ==========
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;