// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'Host' depending on your app structure
    required: true
  },
  type: {
    type: String,
    enum: ['new_visitor', 'visitor_checkin', 'visitor_checkout', 'appointment_reminder', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);