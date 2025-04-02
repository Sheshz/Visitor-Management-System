const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Custom function to generate hostID
const generateHostID = () => {
  // Generate a unique host ID combining a prefix, random chars, and timestamp
  const prefix = "HOST";
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  
  return `${prefix}-${randomChars}-${timestamp}`;
};

const hostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  hostID: {
    type: String,
    default: () => `HOST-${uuidv4().substring(0, 8).toUpperCase()}`,
    unique: true,
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
    required: true
  },
  expertise: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
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
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
},
{ timestamps: true }
);

const Host = mongoose.model("Host", hostSchema);

module.exports = Host;