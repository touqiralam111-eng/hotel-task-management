const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Add your category controller methods here
router.use(protect);

module.exports = router;