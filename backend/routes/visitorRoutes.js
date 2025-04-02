const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { verifyToken } = require('../middleware/userMiddleware');

// Public routes (no authentication required)
router.get('/current', visitorController.getCurrentVisitor);
router.get('/public', visitorController.getPublicVisitorData);

// Protected routes (require authentication)
router.post('/', verifyToken, visitorController.createVisitor);
router.get('/', verifyToken, visitorController.getAllVisitors);
router.get('/recent', verifyToken, visitorController.getRecentVisitors);
router.get('/:id', verifyToken, visitorController.getVisitorById);
router.put('/:id', verifyToken, visitorController.updateVisitor);
router.delete('/:id', verifyToken, visitorController.deleteVisitor);

module.exports = router;