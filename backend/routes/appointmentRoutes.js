const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyUserToken, isHost } = require('../middleware/userMeetingMiddleware');
const { appointmentExists, isAppointmentOwner } = require('../middleware/appointmentMiddleware');

// Create appointment (for users)
router.post('/', verifyUserToken, appointmentController.createAppointment);

// User routes
router.get('/user', verifyUserToken, appointmentController.getUserAppointments);

// Host routes
router.get('/host', verifyUserToken, isHost, appointmentController.getHostAppointments);
router.put('/:id/status', verifyUserToken, isHost, appointmentController.updateAppointmentStatus);
router.get('/host/stats', verifyUserToken, isHost, appointmentController.getHostDashboardStats);

// Common routes
router.get('/:id', verifyUserToken, appointmentController.getAppointmentById);
router.delete('/:id', verifyUserToken, appointmentExists, isAppointmentOwner, appointmentController.deleteAppointment);

module.exports = router;