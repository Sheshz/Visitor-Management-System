const Appointment = require('../models/Appointment');
const Meeting = require('../models/Meeting');
const Host = require('../models/Host');
const User = require('../models/User');
const { sendMeetingInvitation } = require('../utils/emailMeetingService');
const { generateMeetingQR } = require('../utils/qrCodeGenerator');
const { v4: uuidv4 } = require('uuid');

// Create a new appointment request
exports.createAppointment = async (req, res) => {
  try {
    const { hostId, scheduledTime, purpose, title, description } = req.body;
    const visitorId = req.userId;
    
    // Verify host exists
    const host = await Host.findById(hostId);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    
    // Get visitor details
    const visitor = await User.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate unique confirmation code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create appointment
    const newAppointment = new Appointment({
      visitor: visitorId,
      host: host._id,
      scheduledTime: new Date(scheduledTime),
      status: 'Pending',
      confirmationCode,
      purpose,
      title,
      description
    });
    
    await newAppointment.save();
    
    res.status(201).json({
      message: 'Appointment request created successfully',
      appointment: await Appointment.findById(newAppointment._id)
        .populate('visitor', 'firstName lastName email')
        .populate('host', 'name email')
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const appointment = await Appointment.findById(id)
      .populate('visitor', 'firstName lastName email')
      .populate('host', 'name email bio expertise');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check authorization - either the visitor or host can view
    const host = await Host.findOne({ user: userId });
    
    if (
      appointment.visitor._id.toString() !== userId.toString() && 
      (!host || appointment.host._id.toString() !== host._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }
    
    // If appointment is confirmed, generate QR code
    let qrCodeDataUrl = null;
    if (appointment.status === 'Confirmed' && appointment.meetingLink) {
      try {
        qrCodeDataUrl = await generateMeetingQR(
          appointment.meetingLink.split('/').pop(),
          appointment.confirmationCode
        );
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
      }
    }
    
    res.status(200).json({
      appointment,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update appointment status (host action)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const userId = req.userId;
    
    if (!['Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find host
    const host = await Host.findOne({ user: userId });
    if (!host) {
      return res.status(404).json({ message: 'Host profile not found' });
    }
    
    // Find appointment
    const appointment = await Appointment.findOne({ 
      _id: id,
      host: host._id
    }).populate('visitor', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or not authorized' });
    }
    
    // Update status
    appointment.status = status;
    
    if (status === 'Cancelled' && rejectionReason) {
      appointment.rejectionReason = rejectionReason;
    }
    
    // If confirming, create meeting
    if (status === 'Confirmed') {
      const startTime = new Date(appointment.scheduledTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + 30);
      
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newMeeting = new Meeting({
        title: appointment.title || `Meeting with ${appointment.visitor.firstName}`,
        description: appointment.description || `Scheduled appointment`,
        host: host._id,
        startTime,
        endTime,
        duration: 30,
        participants: [{
          user: appointment.visitor._id,
          email: appointment.visitor.email,
          name: `${appointment.visitor.firstName} ${appointment.visitor.lastName}`,
          status: "accepted",
          accessCode
        }],
        status: "scheduled"
      });
      
      await newMeeting.save();
      
      appointment.meetingLink = `/meeting/${newMeeting._id}`;
      appointment.meetingId = newMeeting._id;
      
      // Send confirmation email
      try {
        await sendMeetingInvitation(
          appointment.visitor.email,
          `${appointment.visitor.firstName} ${appointment.visitor.lastName}`,
          host.name,
          {
            ...newMeeting.toObject(),
            meetingId: newMeeting._id.toString()
          },
          accessCode
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }
    
    await appointment.save();
    
    res.status(200).json({
      message: `Appointment ${status.toLowerCase()} successfully`,
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all appointments for a user (as visitor)
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    
    const appointments = await Appointment.find({ visitor: userId })
      .populate('host', 'name email bio expertise')
      .sort({ scheduledTime: -1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting user appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all appointments for a host
exports.getHostAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    
    const host = await Host.findOne({ user: userId });
    if (!host) {
      return res.status(404).json({ message: 'Host profile not found' });
    }
    
    const { status, startDate, endDate } = req.query;
    
    const query = { host: host._id };
    
    if (status && ['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) query.scheduledTime.$gte = new Date(startDate);
      if (endDate) query.scheduledTime.$lte = new Date(endDate);
    }
    
    const appointments = await Appointment.find(query)
      .populate('visitor', 'firstName lastName email')
      .sort({ scheduledTime: -1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting host appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Find host by user ID (if user is a host)
    const host = await Host.findOne({ user: userId });
    
    // Build query based on whether user is host or visitor
    const query = { _id: id };
    if (host) {
      query.host = host._id;
    } else {
      query.visitor = userId;
    }
    
    // Find and delete appointment
    const deletedAppointment = await Appointment.findOneAndDelete(query);
    
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found or not authorized to delete' });
    }
    
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard statistics for host
exports.getHostDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find host by user ID
    const host = await Host.findOne({ user: userId });
    if (!host) {
      return res.status(404).json({ message: 'Host profile not found' });
    }
    
    // Calculate stats
    const totalAppointments = await Appointment.countDocuments({ host: host._id });
    const pendingAppointments = await Appointment.countDocuments({ host: host._id, status: 'Pending' });
    const confirmedAppointments = await Appointment.countDocuments({ host: host._id, status: 'Confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ host: host._id, status: 'Cancelled' });
    
    // Get upcoming appointments
    const now = new Date();
    const upcomingAppointments = await Appointment.find({
      host: host._id,
      status: 'Confirmed',
      scheduledTime: { $gt: now }
    })
    .populate('visitor', 'firstName lastName email')
    .sort({ scheduledTime: 1 })
    .limit(5);
    
    res.status(200).json({
      stats: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        cancelled: cancelledAppointments
      },
      upcomingAppointments
    });
  } catch (error) {
    console.error('Error getting host stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};