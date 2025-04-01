// controllers/visitorController.js
const Visitor = require("../models/Visitor");
const Notification = require("../models/Notification");
const Host = require("../models/Host");

// Add these missing functions that are referenced in your routes
exports.createVisitor = async (req, res) => {
  try {
    const { fullName, email, purpose, host, appointmentDate, appointmentTime, type } = req.body;
    
    // Create new visitor
    const newVisitor = new Visitor({
      fullName,
      email,
      purpose,
      host,
      appointmentDate,
      appointmentTime,
      type,
      status: 'scheduled'
    });
    
    const savedVisitor = await newVisitor.save();
    
    // Create notification for host
    const notification = new Notification({
      recipient: host,
      type: 'new_visitor',
      content: `New visitor ${fullName} scheduled for ${appointmentDate} at ${appointmentTime}`,
      relatedTo: savedVisitor._id
    });
    
    await notification.save();
    
    return res.status(201).json(savedVisitor);
  } catch (error) {
    console.error("Error creating visitor:", error);
    return res.status(500).json({ error: "Server error while creating visitor" });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .populate("host", "name department")
      .sort({ createdAt: -1 });
      
    return res.status(200).json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return res.status(500).json({ error: "Server error while fetching visitors" });
  }
};

exports.getVisitorById = async (req, res) => {
  try {
    const visitorId = req.params.id;
    
    const visitor = await Visitor.findById(visitorId)
      .populate("host", "name department");
      
    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
    return res.status(200).json(visitor);
  } catch (error) {
    console.error("Error fetching visitor:", error);
    return res.status(500).json({ error: "Server error while fetching visitor" });
  }
};

exports.updateVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;
    const updates = req.body;
    
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      updates,
      { new: true }
    ).populate("host", "name department");
    
    if (!updatedVisitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
    return res.status(200).json(updatedVisitor);
  } catch (error) {
    console.error("Error updating visitor:", error);
    return res.status(500).json({ error: "Server error while updating visitor" });
  }
};

exports.deleteVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;
    
    const deletedVisitor = await Visitor.findByIdAndDelete(visitorId);
    
    if (!deletedVisitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
    // Also delete related notifications
    await Notification.deleteMany({ relatedTo: visitorId });
    
    return res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (error) {
    console.error("Error deleting visitor:", error);
    return res.status(500).json({ error: "Server error while deleting visitor" });
  }
};

// Keep the existing functions
exports.getRecentVisitors = async (req, res) => {
  try {
    // Get recent visitors (last 5)
    const recentVisitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("host", "name department");

    return res.status(200).json(recentVisitors);
  } catch (error) {
    console.error("Error getting recent visitors:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving visitors" });
  }
};

exports.getCurrentVisitor = async (req, res) => {
  try {
    // You can fetch the current visitor based on the authenticated user
    const visitorId = req.user._id;

    const visitor = await Visitor.findById(visitorId).populate(
      "host",
      "name department"
    );

    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    // Format visitor data for frontend
    const visitorData = {
      id: visitor._id,
      fullName: visitor.fullName,
      email: visitor.email,
      date: visitor.appointmentDate
        ? new Date(visitor.appointmentDate).toLocaleDateString()
        : new Date(visitor.checkInTime).toLocaleDateString(),
      time:
        visitor.appointmentTime ||
        new Date(visitor.checkInTime).toLocaleTimeString(),
      host: visitor.host ? visitor.host.name : "N/A",
      type: visitor.type,
      status: visitor.status,
    };

    return res.status(200).json(visitorData);
  } catch (error) {
    console.error("Error getting current visitor:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving visitor" });
  }
};

// Add this public function referenced in your routes
exports.getPublicVisitorData = async (req, res) => {
  try {
    // This would return data that doesn't require authentication
    const publicData = await Visitor.find({ status: 'checked-in' })
      .select('fullName checkInTime purpose -_id')
      .limit(10);
      
    return res.status(200).json(publicData);
  } catch (error) {
    console.error("Error getting public visitor data:", error);
    return res.status(500).json({ error: "Server error" });
  }
};