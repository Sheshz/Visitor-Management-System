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
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  profileColor: {
    type: String,
  }
});

// Pre-save middleware to generate profile color if not set
userSchema.pre('save', function(next) {
  if (!this.profileColor) {
    this.profileColor = generateColorFromEmail(this.email);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
