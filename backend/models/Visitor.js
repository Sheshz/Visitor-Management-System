// models/Visitor.js
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true
  },
  appointmentDate: {
    type: Date
  },
  appointmentTime: {
    type: String
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  badge: {
    type: String
  },
  type: {
    type: String,
    enum: ['scheduled', 'walk-in', 'event', 'vendor'],
    default: 'scheduled'
  },
  status: {
    type: String,
    enum: ['scheduled', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Visitor', visitorSchema);