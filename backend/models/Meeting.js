const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "tentative"],
    default: "pending"
  },
  responseTime: {
    type: Date
  },
  joinedAt: {
    type: Date
  },
  leftAt: {
    type: Date
  }
});

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
    unique: true,
    index: true
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
    ref: "User",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["scheduled", "active", "completed", "cancelled"],
    default: "scheduled"
  },
  password: {
    type: String,
    default: ""
  },
  participants: [participantSchema],
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  hostJoined: {
    type: Boolean,
    default: false
  },
  hostJoinedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
meetingSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for meeting duration in minutes
meetingSchema.virtual("durationMinutes").get(function() {
  const start = new Date(this.startTime);
  const end = new Date(this.endTime);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60));
});

// Virtual for actual duration in minutes
meetingSchema.virtual("actualDurationMinutes").get(function() {
  if (!this.actualStartTime || !this.actualEndTime) return null;
  
  const start = new Date(this.actualStartTime);
  const end = new Date(this.actualEndTime);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60));
});

// Method to check if a user is a participant
meetingSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.userId && p.userId.toString() === userId.toString());
};

// Method to check if the meeting is ongoing
meetingSchema.methods.isOngoing = function() {
  return this.status === "active";
};

module.exports = mongoose.model("Meeting", meetingSchema);