const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController'); // Ensure the path is correct

// Route to get all appointments
router.get('/', getAppointments);

// Route to create a new appointment
router.post('/', createAppointment);

// Route to update an appointment
router.put('/:id', updateAppointment);

// Route to delete an appointment
router.delete('/:id', deleteAppointment);

module.exports = router;
