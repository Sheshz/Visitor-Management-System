const Notification = require('../models/Notification');

exports.getRecentNotifications = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;
    
    // Get recent notifications for this user (limit to 10)
    const notifications = await Notification.find({
      $or: [
        { userId },
        { userId: null } // System notifications for all users
      ]
    })
    .sort({ timestamp: -1 })
    .limit(10);
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ error: 'Server error while retrieving notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({
      $or: [
        { userId, read: false },
        { userId: null, read: false } // System notifications
      ]
    });
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      {
        $or: [
          { userId },
          { userId: null } // System notifications
        ],
        read: false
      },
      { read: true }
    );
    
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};