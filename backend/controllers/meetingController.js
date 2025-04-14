const Meeting = require("../models/Meeting");
const Host = require("../models/Host");
const User = require("../models/User");
const { sendMeetingInvitation, sendMeetingReminder } = require("../utils/emailService");

// Create a new meeting
const createMeeting = async (req, res) => {
  try {
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Check if host is active
    if (!host.isActive) {
      return res.status(403).json({ message: "Your host account is currently inactive" });
    }
    
    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      participants, 
      password, 
      recordingEnabled 
    } = req.body;
    
    // Calculate duration in minutes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / (1000 * 60)); // Convert ms to minutes
    
    if (duration <= 0) {
      return res.status(400).json({ message: "End time must be after start time" });
    }
    
    // Create a new meeting
    const newMeeting = new Meeting({
      title,
      description,
      host: host._id,
      startTime: start,
      endTime: end,
      duration,
      password: password || "",
      recordingEnabled: recordingEnabled || false,
      participants: []
    });
    
    // Save the meeting first to get a valid _id
    await newMeeting.save();
    
    // Add participants if provided
    if (participants && participants.length > 0) {
      for (const participant of participants) {
        // Check if participant exists as a user
        const user = await User.findOne({ email: participant.email });
        
        // Generate 6-digit access code for this participant
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Add participant to meeting
        newMeeting.participants.push({
          user: user ? user._id : null,
          email: participant.email,
          name: participant.name || participant.email.split('@')[0],
          status: "pending",
          accessCode: accessCode
        });
        
        // Send invitation email with QR code
        try {
          await sendMeetingInvitation(
            participant.email,
            participant.name || participant.email.split('@')[0],
            host.name,
            {
              ...newMeeting.toObject(),
              meetingId: newMeeting._id.toString() // Ensure meetingId is available as string
            },
            accessCode // Pass the generated access code
          );
        } catch (emailError) {
          console.error(`Failed to send invitation to ${participant.email}:`, emailError);
          // Continue with the rest of the participants even if one email fails
        }
      }
      
      // Save the meeting again with the participants added
      await newMeeting.save();
    }
    
    res.status(201).json({
      message: "Meeting created successfully",
      meeting: newMeeting
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all meetings for a host
const getHostMeetings = async (req, res) => {
  try {
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Get filter parameters
    const { status, startDate, endDate } = req.query;
    
    // Build query
    const query = { host: host._id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    // Get meetings
    const meetings = await Meeting.find(query)
      .sort({ startTime: 1 })
      .populate("participants.user", "firstName lastName email");
    
    res.json(meetings);
  } catch (error) {
    console.error("Error getting host meetings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all meetings for a user
const getUserMeetings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get meetings where user is a participant
    const meetings = await Meeting.find({
      "participants.user": userId,
      "participants.status": { $ne: "declined" }
    })
    .sort({ startTime: 1 })
    .populate("host", "name email");
    
    res.json(meetings);
  } catch (error) {
    console.error("Error getting user meetings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get meeting by ID
const getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ _id: meetingId })
      .populate("host", "name email avatar")
      .populate("participants.user", "firstName lastName email");
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error("Error getting meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update meeting details
const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ 
      _id: meetingId,
      host: host._id
    });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found or not authorized" });
    }
    
    // Don't allow updating completed or cancelled meetings
    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return res.status(400).json({ 
        message: `Cannot update a ${meeting.status} meeting` 
      });
    }
    
    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      password, 
      recordingEnabled,
      status 
    } = req.body;
    
    // Update fields if provided
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (password !== undefined) meeting.password = password;
    if (recordingEnabled !== undefined) meeting.recordingEnabled = recordingEnabled;
    if (status) meeting.status = status;
    
    // Update times and duration if provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.round((end - start) / (1000 * 60)); // Convert ms to minutes
      
      if (duration <= 0) {
        return res.status(400).json({ message: "End time must be after start time" });
      }
      
      meeting.startTime = start;
      meeting.endTime = end;
      meeting.duration = duration;
    }
    
    // Save changes
    await meeting.save();
    
    // If meeting details changed significantly, notify participants
    if (title || startTime || endTime) {
      for (const participant of meeting.participants) {
        if (participant.status !== "declined") {
          try {
            // Send updated meeting details with existing access code
            await sendMeetingReminder(
              participant.email,
              participant.name,
              host.name,
              {
                ...meeting.toObject(),
                meetingId: meeting._id.toString()
              },
              "Meeting details have been updated",
              participant.accessCode // Use the stored access code
            );
          } catch (emailError) {
            console.error(`Failed to send update to ${participant.email}:`, emailError);
            // Continue with the rest of the participants even if one email fails
          }
        }
      }
    }
    
    res.json({
      message: "Meeting updated successfully",
      meeting
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add participants to meeting
const addParticipants = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.user.hostId;
    const { participants } = req.body;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ 
      _id: meetingId,
      host: host._id 
    });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found or not authorized" });
    }
    
    // Don't allow adding participants to completed or cancelled meetings
    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return res.status(400).json({ 
        message: `Cannot add participants to a ${meeting.status} meeting` 
      });
    }
    
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: "Participants list is required" });
    }
    
    // Keep track of added participants for email notifications
    const newParticipants = [];
    
    // Process each participant
    for (const participant of participants) {
      // Check if participant already exists
      const existingParticipant = meeting.participants.find(
        p => p.email.toLowerCase() === participant.email.toLowerCase()
      );
      
      if (existingParticipant) {
        continue; // Skip existing participants
      }
      
      // Check if participant exists as a user
      const user = await User.findOne({ email: participant.email });
      
      // Generate access code for new participant
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Add new participant
      const newParticipant = {
        user: user ? user._id : null,
        email: participant.email,
        name: participant.name || participant.email.split('@')[0],
        status: "pending",
        accessCode: accessCode
      };
      
      meeting.participants.push(newParticipant);
      newParticipants.push({...newParticipant, accessCode});
    }
    
    // Save changes
    await meeting.save();
    
    // Send invitations to new participants
    for (const participant of newParticipants) {
      try {
        await sendMeetingInvitation(
          participant.email,
          participant.name,
          host.name,
          {
            ...meeting.toObject(),
            meetingId: meeting._id.toString()
          },
          participant.accessCode // Pass the stored access code
        );
      } catch (emailError) {
        console.error(`Failed to send invitation to ${participant.email}:`, emailError);
        // Continue with the rest of the participants even if one email fails
      }
    }
    
    res.json({
      message: `${newParticipants.length} participants added successfully`,
      meeting
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove participant from meeting
const removeParticipant = async (req, res) => {
  try {
    const { meetingId, email } = req.params;
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ 
      _id: meetingId,
      host: host._id 
    });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found or not authorized" });
    }
    
    // Don't allow removing participants from completed meetings
    if (meeting.status === "completed") {
      return res.status(400).json({ 
        message: "Cannot remove participants from a completed meeting" 
      });
    }
    
    // Remove participant
    meeting.participants = meeting.participants.filter(
      p => p.email.toLowerCase() !== email.toLowerCase()
    );
    
    // Save changes
    await meeting.save();
    
    res.json({
      message: "Participant removed successfully",
      meeting
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Start a meeting
const startMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ 
      _id: meetingId,
      host: host._id 
    });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found or not authorized" });
    }
    
    // Check if meeting is already active or completed
    if (meeting.status === "active") {
      return res.status(400).json({ message: "Meeting is already active" });
    }
    
    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return res.status(400).json({ 
        message: `Cannot start a ${meeting.status} meeting` 
      });
    }
    
    // Update meeting status
    meeting.status = "active";
    await meeting.save();
    
    // Notify participants that meeting has started
    for (const participant of meeting.participants) {
      if (participant.status !== "declined") {
        try {
          await sendMeetingReminder(
            participant.email,
            participant.name,
            host.name,
            {
              ...meeting.toObject(),
              meetingId: meeting._id.toString()
            },
            "The meeting has started",
            participant.accessCode // Pass the stored access code
          );
        } catch (emailError) {
          console.error(`Failed to send start notification to ${participant.email}:`, emailError);
          // Continue with the rest of the participants even if one email fails
        }
      }
    }
    
    res.json({
      message: "Meeting started successfully",
      meeting,
      roomUrl: `/meeting-room/${meeting._id}`
    });
  } catch (error) {
    console.error("Error starting meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// End a meeting
const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ 
      _id: meetingId,
      host: host._id 
    });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found or not authorized" });
    }
    
    // Check if meeting is active
    if (meeting.status !== "active") {
      return res.status(400).json({ 
        message: `Cannot end a meeting that is not active. Current status: ${meeting.status}` 
      });
    }
    
    // Update meeting status
    meeting.status = "completed";
    
    // Update actual end time
    meeting.endTime = new Date();
    
    // Save changes
    await meeting.save();
    
    res.json({
      message: "Meeting ended successfully",
      meeting
    });
  } catch (error) {
    console.error("Error ending meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel a meeting
const cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.user.hostId;
    
    // Verify the user is a host
    const host = await Host.findOne({ hostID: hostId });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ 
      _id: meetingId,
      host: host._id 
    });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found or not authorized" });
    }
    
    // Check if meeting can be cancelled
    if (meeting.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed meeting" });
    }
    
    if (meeting.status === "cancelled") {
      return res.status(400).json({ message: "Meeting is already cancelled" });
    }
    
    // Update meeting status
    meeting.status = "cancelled";
    await meeting.save();
    
    // Notify participants of cancellation
    for (const participant of meeting.participants) {
      if (participant.status !== "declined") {
        try {
          await sendMeetingReminder(
            participant.email,
            participant.name,
            host.name,
            {
              ...meeting.toObject(),
              meetingId: meeting._id.toString()
            },
            "The meeting has been cancelled",
            participant.accessCode // Pass the stored access code
          );
        } catch (emailError) {
          console.error(`Failed to send cancellation to ${participant.email}:`, emailError);
          // Continue with the rest of the participants even if one email fails
        }
      }
    }
    
    res.json({
      message: "Meeting cancelled successfully",
      meeting
    });
  } catch (error) {
    console.error("Error cancelling meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User responds to meeting invitation (accept/decline)
const respondToInvitation = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.userId;
    const { response } = req.body; // 'accepted' or 'declined'
    
    if (response !== "accepted" && response !== "declined") {
      return res.status(400).json({ 
        message: "Response must be either 'accepted' or 'declined'" 
      });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ _id: meetingId });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Find the participant
    const participantIndex = meeting.participants.findIndex(
      p => p.user && p.user.toString() === userId
    );
    
    if (participantIndex === -1) {
      return res.status(404).json({ message: "You are not invited to this meeting" });
    }
    
    // Update participant status
    meeting.participants[participantIndex].status = response === "accepted" ? "accepted" : "declined";
    
    // Save changes
    await meeting.save();
    
    res.json({
      message: `Meeting invitation ${response} successfully`,
      meeting
    });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Join a meeting with access code
const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { accessCode, email } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findOne({ _id: meetingId })
      .populate("host", "name email avatar");
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Check if meeting is active
    if (meeting.status !== "active") {
      return res.status(400).json({ 
        message: `Cannot join a meeting that is not active. Current status: ${meeting.status}` 
      });
    }
    
    // Determine if user is joining as host or participant
    let isHost = false;
    let participantIndex = -1;
    
    // Handle authenticated users
    if (req.user) {
      const userId = req.user.userId;
      
      // Check if user is a host
      if (req.user.hostId) {
        const host = await Host.findOne({ hostID: req.user.hostId });
        if (host && host._id.toString() === meeting.host._id.toString()) {
          isHost = true;
        }
      }
      
      // If not host, check if user is a participant
      if (!isHost) {
        participantIndex = meeting.participants.findIndex(
          p => p.user && p.user.toString() === userId
        );
      }
    }
    
    // If not found as authenticated user, check by email and access code
    if (!isHost && participantIndex === -1 && email && accessCode) {
      participantIndex = meeting.participants.findIndex(
        p => p.email.toLowerCase() === email.toLowerCase() && p.accessCode === accessCode
      );
    }
    
    // Handle case where participant not found or declined
    if (!isHost && participantIndex === -1) {
      return res.status(403).json({ message: "Invalid access code or email" });
    } else if (!isHost && meeting.participants[participantIndex].status === "declined") {
      return res.status(403).json({ message: "You have declined this meeting invitation" });
    }
    
    // Update participant status and join time
    if (!isHost && participantIndex !== -1) {
      meeting.participants[participantIndex].status = "attended";
      meeting.participants[participantIndex].joinedAt = new Date();
      await meeting.save();
    }
    
    res.json({
      message: "Joined meeting successfully",
      meeting,
      isHost,
      participant: !isHost ? meeting.participants[participantIndex] : null
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Leave a meeting
const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { email, accessCode } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findOne({ _id: meetingId });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    let participantIndex = -1;
    
    // Find participant by user ID if authenticated
    if (req.user && req.user.userId) {
      participantIndex = meeting.participants.findIndex(
        p => p.user && p.user.toString() === req.user.userId
      );
    }
    
    // If not found by user ID, try with email and access code
    if (participantIndex === -1 && email && accessCode) {
      participantIndex = meeting.participants.findIndex(
        p => p.email.toLowerCase() === email.toLowerCase() && p.accessCode === accessCode
      );
    }
    
    if (participantIndex === -1) {
      return res.status(404).json({ message: "You are not a participant in this meeting" });
    }
    
    // Update leave time
    meeting.participants[participantIndex].leftAt = new Date();
    await meeting.save();
    
    res.json({
      message: "Left meeting successfully"
    });
  } catch (error) {
    console.error("Error leaving meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify access code for a meeting
const verifyAccessCode = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { email, accessCode } = req.body;
    
    if (!email || !accessCode) {
      return res.status(400).json({ message: "Email and access code are required" });
    }
    
    // Find the meeting
    const meeting = await Meeting.findOne({ _id: meetingId });
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Find participant
    const participant = meeting.participants.find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.accessCode === accessCode
    );
    
    if (!participant) {
      return res.status(403).json({ message: "Invalid access code" });
    }
    
    res.json({
      message: "Access code verified successfully",
      participant: {
        name: participant.name,
        email: participant.email,
        status: participant.status
      }
    });
  } catch (error) {
    console.error("Error verifying access code:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createMeeting,
  getHostMeetings,
  getUserMeetings,
  getMeetingById,
  updateMeeting,
  addParticipants,
  removeParticipant,
  startMeeting,
  endMeeting,
  cancelMeeting,
  respondToInvitation,
  joinMeeting,
  leaveMeeting,
  verifyAccessCode
};