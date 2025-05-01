const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const hostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Ensures one host per user
  },
  hostID: {
    type: String,
    default: () => `HOST-${uuidv4().substring(0, 8).toUpperCase()}`,
    unique: true,
  },
  password: {  // Added this field as it's used in controller
    type: String,
    required: false  // Not requiring password as it might be optional
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  // Changed to array to match how it's used in the controller
  expertise: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: ""
  },
  experience: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  socialMedia: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  // Adding availability field since it's used in the appointment system
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: String,
    endTime: String
  }]
},
{ timestamps: true }
);

const Host = mongoose.model("Host", hostSchema);

module.exports = Host;