const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/userMiddleware');

// All routes are protected with authentication
router.use(verifyToken);

// Get all notifications for a user
router.get('/', notificationController.getRecentNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Get unread notification count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark all notifications as read
router.put('/read/all', notificationController.markAllAsRead);

module.exports = router;