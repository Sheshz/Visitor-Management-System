const mongoose = require("mongoose");

const meetingChatSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Meeting"
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "senderModel",
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "Host"]
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "recipientModel",
    default: null
  },
  recipientModel: {
    type: String,
    enum: ["User", "Host"],
    default: null
  }
});

// Indexes for better query performance
meetingChatSchema.index({ meetingId: 1 });
meetingChatSchema.index({ timestamp: 1 });

const MeetingChat = mongoose.model("MeetingChat", meetingChatSchema);

module.exports = MeetingChat;