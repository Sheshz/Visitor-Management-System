const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { verifyToken } = require('../middleware/userMiddleware');

// All routes are protected with authentication
router.use(verifyToken);

// Get visitor statistics
router.get('/visitors', statisticsController.getVisitorStatistics);

module.exports = router;