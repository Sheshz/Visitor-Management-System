const MeetingChat = require("../models/MeetingChat");
const Meeting = require("../models/Meeting");
const Host = require("../models/Host");
const User = require("../models/User");

// Send a message in meeting chat
const sendMessage = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.userId;
    const hostId = req.user.hostId;
    
    // Verify meeting exists and is active
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    if (meeting.status !== "active") {
      return res.status(400).json({ message: "Meeting is not active" });
    }

    // Verify user is either host or participant
    const isHost = hostId && meeting.host.toString() === hostId;
    const isParticipant = meeting.participants.some(
      p => p.user && p.user.toString() === userId
    );
    
    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "Not authorized to send messages" });
    }

    // Rest of your message sending logic...
    
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get chat messages for a meeting
const getChatMessages = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.userId;
    const hostId = req.user.hostId;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Determine if requester is host or participant
    let isHost = false;
    let requesterId;
    
    if (hostId) {
      // Requester is a host
      const host = await Host.findOne({ hostID: hostId });
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      
      if (meeting.host.toString() !== host._id.toString()) {
        return res.status(403).json({ message: "You are not the host of this meeting" });
      }
      
      isHost = true;
      requesterId = host._id;
    } else {
      // Requester is a user/participant
      // Check if user is a participant
      const isParticipant = meeting.participants.some(
        p => p.user && p.user.toString() === userId
      );
      
      if (!isParticipant) {
        return res.status(403).json({ message: "You are not a participant in this meeting" });
      }
      
      requesterId = userId;
    }
    
    // Build query for messages
    let query = { meetingId: meeting._id }; // Changed from meetingId to meeting._id
    
    if (!isHost) {
      // For participants, only show public messages and private messages to/from them
      query.$or = [
        { isPrivate: false },
        { isPrivate: true, sender: requesterId },
        { isPrivate: true, recipient: requesterId }
      ];
    }
    
    // Get messages, sorted by timestamp
    const messages = await MeetingChat.find(query)
      .sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getChatMessages
};