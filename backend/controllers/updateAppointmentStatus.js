// Inside the 'Confirmed' status block of updateAppointmentStatus
const Meeting = require('../models/Meeting');

// Calculate meeting duration (default to 30 minutes)
const startTime = new Date(appointment.scheduledTime);
const endTime = new Date(startTime);
endTime.setMinutes(startTime.getMinutes() + 30);

// Generate access code for participant
const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

// Create new meeting
const newMeeting = new Meeting({
  meetingId: uuidv4(), // Add a unique ID
  title: `Meeting with ${appointment.visitor.firstName} ${appointment.visitor.lastName}`,
  description: `Scheduled appointment from visitor management system`,
  host: host._id,
  startTime,
  endTime,
  duration: 30, // minutes
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

// Update appointment with meeting link
appointment.meetingLink = `/meeting/${newMeeting._id}`;