const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { auth } = require('../middleware/userMiddleware');

// The error is happening because 'verifyToken' doesn't exist in your middleware
// Let's replace with the 'auth' middleware that does exist

// Instead of:
// router.use(verifyToken);

// Use this approach instead (individual routes with middleware):
router.get('/visitors', auth, statisticsController.getVisitorStatistics);

// Add any other statistics routes with the auth middleware
// router.get('/dashboard', auth, statisticsController.getDashboardStats);
// router.get('/other-stats', auth, statisticsController.getOtherStats);

module.exports = router;