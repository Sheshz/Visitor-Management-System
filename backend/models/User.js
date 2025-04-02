// backend/models/User.js
const mongoose = require('mongoose');
const generateColorFromEmail = require('../utils/generateColor'); // Corrected import

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
      required: true,
      minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'receptionist', 'host', 'user'],
    default: "user",
  },
  profileColor: {
    type: String,
  },
  resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    // Additional fields as needed
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Pre-save middleware to generate profile color if not set
userSchema.pre('save', function(next) {
  if (!this.profileColor) {
    this.profileColor = generateColorFromEmail(this.email);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
