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
    const { message, isPrivate, recipientId } = req.body;
    
    // Validate message
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Check if meeting is active
    if (meeting.status !== "active") {
      return res.status(400).json({ 
        message: "Cannot send messages to inactive meetings" 
      });
    }
    
    // Determine if sender is host or participant
    let sender, senderModel, senderName;
    
    if (hostId) {
      // Sender is a host
      const host = await Host.findOne({ hostID: hostId });
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      
      if (meeting.host.toString() !== host._id.toString()) {
        return res.status(403).json({ message: "You are not the host of this meeting" });
      }
      
      sender = host._id;
      senderModel = "Host";
      senderName = host.name;
    } else {
      // Sender is a user/participant
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a participant
      const isParticipant = meeting.participants.some(
        p => p.user && p.user.toString() === userId && p.status === "attended"
      );
      
      if (!isParticipant) {
        return res.status(403).json({ message: "You must join the meeting to send messages" });
      }
      
      sender = user._id;
      senderModel = "User";
      senderName = `${user.firstName} ${user.lastName}`.trim();
    }
    
    // Handle private messages
    let recipient = null;
    let recipientModel = null;
    
    if (isPrivate && recipientId) {
      // Check if recipient is the host
      if (meeting.host.toString() === recipientId) {
        recipient = meeting.host;
        recipientModel = "Host";
      } else {
        // Check if recipient is a participant
        const participantIndex = meeting.participants.findIndex(
          p => p.user && p.user.toString() === recipientId
        );
        
        if (participantIndex === -1) {
          return res.status(404).json({ message: "Recipient not found in meeting" });
        }
        
        recipient = meeting.participants[participantIndex].user;
        recipientModel = "User";
      }
    }
    
    // Create chat message
    const newMessage = new MeetingChat({
      meetingId: meeting._id, // Changed from meetingId to meeting._id
      sender,
      senderModel,
      senderName,
      message,
      isPrivate: isPrivate || false,
      recipient,
      recipientModel: recipient ? recipientModel : null
    });
    
    await newMessage.save();
    
    // Emit through socket.io
    const io = req.app.get('io');
    if (io) {
      const messageData = {
        ...newMessage.toObject(),
        senderModel,
        senderName
      };
      
      // If private message, only send to sender and recipient
      if (isPrivate && recipient) {
        // Create room IDs for both sender and recipient
        const senderRoom = `user-${sender.toString()}`;
        const recipientRoom = `user-${recipient.toString()}`;
        
        io.to(senderRoom).to(recipientRoom).emit('newPrivateMessage', messageData);
      } else {
        // Public message goes to the meeting room
        io.to(`meeting-${meeting._id}`).emit('newMessage', messageData);
      }
    }
    
    res.status(201).json({
      message: "Message sent successfully",
      chatMessage: newMessage
    });
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