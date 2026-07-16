const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, trim: true },
  department: { type: String, enum: ['Housekeeping', 'Reception', 'Maintenance', 'Kitchen', 'Laundry', 'Security'] },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  avatar: { type: String, default: 'default-avatar.png' },
  isActive: { type: Boolean, default: true },
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);