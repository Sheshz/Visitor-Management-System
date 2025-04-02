const Notification = require("../models/Notification");

exports.getUserNotifications = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user._id;
    
    // Find notifications for this user
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('relatedTo', 'fullName purpose');
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Server error while fetching notifications" });
  }
};

exports.getRecentNotifications = async (req, res) => {
  try {
    // Find recent notifications - no authentication required
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('relatedTo', 'fullName purpose');
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    return res.status(500).json({ error: "Server error while fetching notifications" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    return res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const result = await Notification.findByIdAndDelete(notificationId);
    
    if (!result) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({ 
      recipient: userId,
      read: false
    });
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return res.status(500).json({ error: "Server error" });
  }
};