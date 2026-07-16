const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  addNote,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getTaskStats);
router.route('/').get(getTasks).post(authorize('admin'), createTask);
router.route('/:id').get(getTaskById).put(updateTask).delete(authorize('admin'), deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/notes', addNote);

module.exports = router;