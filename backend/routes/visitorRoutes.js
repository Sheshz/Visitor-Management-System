// routes/visitorRoutes.js
const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { verifyToken } = require('../middleware/userMiddleware');

// INCORRECT WAY:
// router.use(auth); // This is causing the error

// CORRECT WAY:
// Apply auth middleware to specific routes
router.post('/create', verifyToken, visitorController.createVisitor);
router.get('/all', verifyToken, visitorController.getAllVisitors);
router.get('/:id', verifyToken, visitorController.getVisitorById);
router.put('/:id', verifyToken, visitorController.updateVisitor);
router.delete('/:id', verifyToken, visitorController.deleteVisitor);

// Public routes (if any)
router.get('/public-data', visitorController.getPublicVisitorData);

module.exports = router;