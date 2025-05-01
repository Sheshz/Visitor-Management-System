const Meeting = require("../models/Meeting");
const Host = require("../models/Host");
const User = require("../models/User");
const emailService = require("../utils/emailMeetingService");
const { v4: uuidv4 } = require('uuid');

// Create a new meeting
const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      recordingEnabled,
      password,
      participants
    } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Meeting title, start time, and end time are required"
      });
    }

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    // Generate unique meeting ID
    const meetingId = `meet-${uuidv4().substring(0, 8)}`;

    // Create the meeting
    const newMeeting = new Meeting({
      meetingId,
      title,
      description: description || "",
      host: req.user.id, // From auth middleware
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      recordingEnabled: recordingEnabled || false,
      password: password || "",
      status: "scheduled",
      createdAt: new Date()
    });

    // Add participants if provided
    if (participants && participants.length > 0) {
      // Check if participants exist in the database
      const participantEmails = participants.map(p => p.email);
      const existingUsers = await User.find({ email: { $in: participantEmails } }).select('_id email');
      
      const existingEmailMap = {};
      existingUsers.forEach(user => {
        existingEmailMap[user.email] = user._id;
      });

      // Process participants
      for (const participant of participants) {
        const participantObj = {
          email: participant.email,
          name: participant.name,
          status: "pending"
        };

        // If user exists in our system, add their user ID
        if (existingEmailMap[participant.email]) {
          participantObj.userId = existingEmailMap[participant.email];
        }

        newMeeting.participants.push(participantObj);
      }
    }

    // Save the meeting
    await newMeeting.save();

    // Send invitation emails to participants
    if (participants && participants.length > 0) {
      for (const participant of participants) {
        try {
          // Generate meeting join URL (you may need to adjust this based on your frontend setup)
          const joinUrl = `${process.env.FRONTEND_URL}/meeting/join/${meetingId}`;
          
          await emailService.sendInvitationEmail(
            participant.email,
            participant.name,
            req.user.name, // Host name
            title,
            description || "",
            new Date(startTime),
            new Date(endTime),
            meetingId,
            password || "",
            joinUrl
          );
        } catch (emailError) {
          console.error(`Failed to send invitation to ${participant.email}:`, emailError);
          // Continue with other invitations even if one fails
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting: {
        meetingId: newMeeting.meetingId,
        title: newMeeting.title,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        status: newMeeting.status
      }
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all meetings for a host
const getHostMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ host: req.user.id })
      .sort({ startTime: 1 })
      .select("meetingId title startTime endTime status participants");

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.error("Error fetching host meetings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching meetings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all meetings for a user
const getUserMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      "participants.userId": req.user.id,
      status: { $ne: "cancelled" } // Don't show cancelled meetings
    })
      .sort({ startTime: 1 })
      .select("meetingId title host startTime endTime status");

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.error("Error fetching user meetings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching meetings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get meeting by ID
const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId })
      .populate("host", "name email")
      .select("-__v");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    // Check if user is authorized to view this meeting
    const isHost = meeting.host._id.toString() === req.user.id;
    const isParticipant = meeting.participants.some(
      p => p.userId && p.userId.toString() === req.user.id
    );

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this meeting"
      });
    }

    res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Update meeting details
const updateMeeting = async (req, res) => {
  try {
    const { title, description, startTime, endTime, recordingEnabled, password } = req.body;

    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    // Update fields if provided
    if (title) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (startTime) meeting.startTime = new Date(startTime);
    if (endTime) meeting.endTime = new Date(endTime);
    if (recordingEnabled !== undefined) meeting.recordingEnabled = recordingEnabled;
    if (password) meeting.password = password;

    // Validate that end time is after start time
    if (new Date(meeting.endTime) <= new Date(meeting.startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    // Save the updated meeting
    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      meeting: {
        meetingId: meeting.meetingId,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        status: meeting.status
      }
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Add participants to meeting
const addParticipants = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participants array is required"
      });
    }

    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    // Get existing participant emails
    const existingEmails = meeting.participants.map(p => p.email);

    // Check if new participants exist in the database
    const newParticipantEmails = participants
      .map(p => p.email)
      .filter(email => !existingEmails.includes(email));

    const existingUsers = await User.find({ email: { $in: newParticipantEmails } }).select(
      "_id email"
    );

    const existingEmailMap = {};
    existingUsers.forEach(user => {
      existingEmailMap[user.email] = user._id;
    });

    // Add new participants
    let addedParticipants = 0;
    for (const participant of participants) {
      // Skip if already in the meeting
      if (existingEmails.includes(participant.email)) {
        continue;
      }

      const participantObj = {
        email: participant.email,
        name: participant.name,
        status: "pending"
      };

      // If user exists in our system, add their user ID
      if (existingEmailMap[participant.email]) {
        participantObj.userId = existingEmailMap[participant.email];
      }

      meeting.participants.push(participantObj);
      addedParticipants++;

      // Send invitation email
      try {
        // Generate meeting join URL
        const joinUrl = `${process.env.FRONTEND_URL}/meeting/join/${meeting.meetingId}`;
        
        await emailService.sendInvitationEmail(
          participant.email,
          participant.name,
          req.user.name,
          meeting.title,
          meeting.description,
          meeting.startTime,
          meeting.endTime,
          meeting.meetingId,
          meeting.password,
          joinUrl
        );
      } catch (emailError) {
        console.error(`Failed to send invitation to ${participant.email}:`, emailError);
        // Continue with other invitations even if one fails
      }
    }

    // Save the updated meeting
    await meeting.save();

    res.status(200).json({
      success: true,
      message: `${addedParticipants} participant(s) added successfully`,
      addedCount: addedParticipants
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding participants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Remove participant from meeting
const removeParticipant = async (req, res) => {
  try {
    const { meetingId, email } = req.params;

    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    // Find the participant index
    const participantIndex = meeting.participants.findIndex(p => p.email === email);

    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Participant not found in this meeting"
      });
    }

    // Remove the participant
    meeting.participants.splice(participantIndex, 1);

    // Save the updated meeting
    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Participant removed successfully"
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing participant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Start a meeting
const startMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    if (meeting.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot start a cancelled meeting"
      });
    }

    if (meeting.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Meeting is already completed"
      });
    }

    meeting.status = "active";
    meeting.actualStartTime = new Date();

    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Meeting started successfully",
      meeting: {
        meetingId: meeting.meetingId,
        status: meeting.status,
        actualStartTime: meeting.actualStartTime
      }
    });
  } catch (error) {
    console.error("Error starting meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while starting meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// End a meeting
const endMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    if (meeting.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active meetings can be ended"
      });
    }

    meeting.status = "completed";
    meeting.actualEndTime = new Date();

    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
      meeting: {
        meetingId: meeting.meetingId,
        status: meeting.status,
        actualEndTime: meeting.actualEndTime
      }
    });
  } catch (error) {
    console.error("Error ending meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while ending meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Cancel a meeting
const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a meeting that is already ${meeting.status}`
      });
    }

    meeting.status = "cancelled";
    meeting.cancelledAt = new Date();

    await meeting.save();

    // Notify participants about cancellation
    for (const participant of meeting.participants) {
      try {
        await emailService.sendCancellationEmail(
          participant.email,
          participant.name,
          req.user.name,
          meeting.title,
          meeting.startTime,
          meeting.meetingId
        );
      } catch (notifyError) {
        console.error(`Failed to notify ${participant.email} about cancellation:`, notifyError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Meeting cancelled successfully",
      meeting: {
        meetingId: meeting.meetingId,
        status: meeting.status
      }
    });
  } catch (error) {
    console.error("Error cancelling meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// User responds to meeting invitation (accept/decline)
const respondToInvitation = async (req, res) => {
  try {
    const { response } = req.body;

    if (!["accepted", "declined", "tentative"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Invalid response status. Must be 'accepted', 'declined', or 'tentative'"
      });
    }

    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    // Find the participant
    const participantIndex = meeting.participants.findIndex(
      p => p.userId && p.userId.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "You are not a participant in this meeting"
      });
    }

    // Update participant status
    meeting.participants[participantIndex].status = response;
    meeting.participants[participantIndex].responseTime = new Date();

    await meeting.save();

    res.status(200).json({
      success: true,
      message: `Invitation ${response} successfully`,
      status: response
    });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({
      success: false,
      message: "Server error while responding to invitation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Join a meeting with access code
const joinMeeting = async (req, res) => {
  try {
    const { password } = req.body;
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    if (meeting.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Meeting is ${meeting.status}, not active`
      });
    }

    // Check if user is the host
    const isHost = meeting.host.toString() === req.user.id;
    
    // Check if user is a participant
    const participantIndex = isHost 
      ? -1 
      : meeting.participants.findIndex(p => p.userId && p.userId.toString() === req.user.id);

    // If not host and not a participant, check if they have the correct password
    if (!isHost && participantIndex === -1) {
      // Password required for non-participants
      if (!password || password !== meeting.password) {
        return res.status(401).json({
          success: false,
          message: "Invalid meeting password"
        });
      }
      
      // Add them as a participant if password is correct
      meeting.participants.push({
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        status: "accepted",
        joinedAt: new Date()
      });
    } else if (!isHost) {
      // Mark existing participant as joined
      meeting.participants[participantIndex].joinedAt = new Date();
    }

    // If host, mark meeting as having host joined
    if (isHost) {
      meeting.hostJoined = true;
      meeting.hostJoinedAt = new Date();
    }

    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Joined meeting successfully",
      meeting: {
        meetingId: meeting.meetingId,
        title: meeting.title,
        isHost
      }
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while joining meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Leave a meeting
const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    // Check if user is the host
    const isHost = meeting.host.toString() === req.user.id;

    // If host leaves, end the meeting
    if (isHost) {
      meeting.status = "completed";
      meeting.actualEndTime = new Date();
      await meeting.save();

      return res.status(200).json({
        success: true,
        message: "As host, you left and ended the meeting",
        meetingEnded: true
      });
    }

    // For regular participants, mark them as left
    const participantIndex = meeting.participants.findIndex(
      p => p.userId && p.userId.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "You are not a participant in this meeting"
      });
    }

    meeting.participants[participantIndex].leftAt = new Date();
    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Left meeting successfully"
    });
  } catch (error) {
    console.error("Error leaving meeting:", error);
    res.status(500).json({
      success: false,
      message: "Server error while leaving meeting",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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
    
    res.status(200).json({
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