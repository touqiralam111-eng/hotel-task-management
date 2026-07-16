const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, category, priority, dueDate, notes } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      category,
      priority,
      dueDate,
      notes: notes ? [{ text: notes, createdBy: req.user.id }] : [],
    });

    // Create activity log
    await ActivityLog.create({
      user: req.user.id,
      action: 'task_created',
      details: `Created task "${title}"`,
      target: task._id,
      targetModel: 'Task',
    });

    // Create notification for assigned staff
    const assignedUser = await User.findById(assignedTo);
    if (assignedUser) {
      await Notification.create({
        user: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${title}"`,
        type: 'task_assigned',
        link: `/tasks/${task._id}`,
      });

      // Emit socket event
      const io = req.app.get('io');
      io.to(assignedUser._id.toString()).emit('newNotification', {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${title}"`,
        taskId: task._id,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('category', 'name color')
      .populate('notes.createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all tasks with filters
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      dueDate,
      search,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { isArchived: false };

    // Role-based filtering
    if (req.user.role === 'staff') {
      query.assignedTo = req.user.id;
    }

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;

    // Due date filter
    if (dueDate) {
      if (dueDate === 'today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        query.dueDate = { $gte: start, $lte: end };
      } else if (dueDate === 'week') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() + 7);
        query.dueDate = { $gte: start, $lte: end };
      } else if (dueDate === 'overdue') {
        query.dueDate = { $lt: new Date() };
        query.status = { $ne: 'completed' };
      }
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'dueDate':
          sortOptions = { dueDate: 1 };
          break;
        case 'priority':
          sortOptions = { priority: -1 };
          break;
        case 'status':
          sortOptions = { status: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    } else {
      sortOptions = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('category', 'name color')
      .populate('notes.createdBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar phone department')
      .populate('assignedBy', 'name email avatar')
      .populate('category', 'name color icon')
      .populate('notes.createdBy', 'name avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check authorization
    if (req.user.role === 'staff' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check authorization
    if (req.user.role === 'staff' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('category', 'name color')
      .populate('notes.createdBy', 'name');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'task_updated',
      details: `Updated task "${task.title}"`,
      target: task._id,
      targetModel: 'Task',
      metadata: { changes: req.body },
    });

    // Notify assigned user if changed
    if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo.toString()) {
      await Notification.create({
        user: req.body.assignedTo,
        title: 'Task Reassigned',
        message: `Task "${task.title}" has been reassigned to you`,
        type: 'task_updated',
        link: `/tasks/${task._id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check authorization
    if (req.user.role === 'staff' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const oldStatus = task.status;
    task.status = status;

    // Update timestamps
    if (status === 'in-progress' && !task.startedAt) {
      task.startedAt = new Date();
    }
    if (status === 'completed') {
      task.completedAt = new Date();
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('category', 'name color');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'task_status_changed',
      details: `Changed task "${task.title}" status from ${oldStatus} to ${status}`,
      target: task._id,
      targetModel: 'Task',
      metadata: { oldStatus, newStatus: status },
    });

    // Notify if completed
    if (status === 'completed') {
      await Notification.create({
        user: task.assignedBy,
        title: 'Task Completed',
        message: `Task "${task.title}" has been completed by ${req.user.name}`,
        type: 'task_completed',
        link: `/tasks/${task._id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Add note to task
// @route   POST /api/tasks/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check authorization
    if (req.user.role === 'staff' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this task',
      });
    }

    task.notes.push({
      text,
      createdBy: req.user.id,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('notes.createdBy', 'name avatar');

    await ActivityLog.create({
      user: req.user.id,
      action: 'note_added',
      details: `Added note to task "${task.title}"`,
      target: task._id,
      targetModel: 'Task',
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.remove();

    await ActivityLog.create({
      user: req.user.id,
      action: 'task_deleted',
      details: `Deleted task "${task.title}"`,
      target: task._id,
      targetModel: 'Task',
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Archive task
// @route   PUT /api/tasks/:id/archive
// @access  Private (Admin only)
exports.archiveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.isArchived = !task.isArchived;
    await task.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'task_archived',
      details: `${task.isArchived ? 'Archived' : 'Unarchived'} task "${task.title}"`,
      target: task._id,
      targetModel: 'Task',
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    let query = { isArchived: false };

    if (req.user.role === 'staff') {
      query.assignedTo = req.user.id;
    }

    const total = await Task.countDocuments(query);
    const completed = await Task.countDocuments({ ...query, status: 'completed' });
    const pending = await Task.countDocuments({ ...query, status: { $in: ['todo', 'in-progress', 'on-hold'] } });
    const inProgress = await Task.countDocuments({ ...query, status: 'in-progress' });
    const highPriority = await Task.countDocuments({ ...query, priority: 'high' });
    const overdue = await Task.countDocuments({
      ...query,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    });

    // Tasks by status
    const statusStats = await Task.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Tasks by category
    const categoryStats = await Task.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          category: '$category.name',
          count: 1,
          color: '$category.color',
        }
      },
    ]);

    // Monthly completed tasks (last 6 months)
    const monthlyCompleted = await Task.aggregate([
      { $match: { ...query, status: 'completed', completedAt: { $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    const totalStaff = await User.countDocuments({ role: 'staff', isActive: true });

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        inProgress,
        highPriority,
        overdue,
        totalStaff,
        statusStats,
        categoryStats,
        monthlyCompleted: monthlyCompleted.reverse(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};