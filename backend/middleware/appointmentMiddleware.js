const Appointment = require('../models/Appointment');
const Host = require('../models/Host');

// Check if appointment exists
const appointmentExists = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Add appointment to request
    req.appointment = appointment;
    next();
  } catch (error) {
    console.error('Appointment check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is appointment owner
const isAppointmentOwner = async (req, res, next) => {
  try {
    const appointment = req.appointment;
    
    // Check if user is visitor who created the appointment
    if (appointment.visitor.toString() === req.userId.toString()) {
      return next();
    }
    
    // If not visitor, check if user is the host
    const host = await Host.findOne({ user: req.userId });
    
    if (host && appointment.host.toString() === host._id.toString()) {
      return next();
    }
    
    res.status(403).json({ message: 'Not authorized to modify this appointment' });
  } catch (error) {
    console.error('Appointment ownership check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  appointmentExists,
  isAppointmentOwner
};