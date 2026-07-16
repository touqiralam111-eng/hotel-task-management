const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['task_created', 'task_updated', 'task_status_changed', 'task_completed', 'task_reopened', 'task_archived', 'task_deleted', 'task_assigned', 'note_added', 'user_created', 'user_updated', 'category_created', 'category_updated'], required: true },
  details: { type: String, required: true },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
  targetModel: { type: String, enum: ['Task', 'User', 'Category'] },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);