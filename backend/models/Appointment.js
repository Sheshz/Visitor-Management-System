const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  visitor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Host', 
    required: true 
  },
  scheduledTime: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], 
    default: 'Pending' 
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  purpose: {
    type: String
  },
  meetingLink: { 
    type: String 
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  confirmationCode: { 
    type: String,
    required: true
  },
  rejectionReason: {
    type: String
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

module.exports = mongoose.model('Appointment', appointmentSchema);