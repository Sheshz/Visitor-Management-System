const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/userMiddleware');

// Public routes (no authentication required)
router.get('/recent', notificationController.getRecentNotifications);

// Protected routes (require authentication)
router.get('/user', verifyToken, notificationController.getUserNotifications);
router.get('/unread', verifyToken, notificationController.getUnreadCount);
router.put('/:id', verifyToken, notificationController.markNotificationAsRead);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;