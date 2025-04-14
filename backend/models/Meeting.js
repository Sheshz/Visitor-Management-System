const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    default: () => `MEETING-${uuidv4().substring(0, 8).toUpperCase()}`,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host",
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "attended"],
      default: "pending"
    },
    joinedAt: {
      type: Date
    },
    leftAt: {
      type: Date
    }
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  roomCode: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase()
  },
  status: {
    type: String,
    enum: ["scheduled", "active", "completed", "cancelled"],
    default: "scheduled"
  },
  recordingUrl: {
    type: String,
    default: ""
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for better query performance
meetingSchema.index({ host: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ startTime: 1 });
meetingSchema.index({ "participants.user": 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;