const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { auth, verifyUserToken } = require('../middleware/userMiddleware');

// First, let's verify what functions are actually available in the controller
//console.log("Available visitor controller functions:", Object.keys(visitorController));

// Public routes (no authentication required)
router.get('/current', visitorController.getCurrentVisitor);
router.get('/public', visitorController.getPublicVisitorData);

// Protected routes (require authentication)
// This is line 11 in your original file - the likely source of the error
router.post('/', verifyUserToken, visitorController.createVisitor);
router.get('/', verifyUserToken, visitorController.getAllVisitors);
router.get('/recent', verifyUserToken, visitorController.getRecentVisitors);
router.get('/:id', verifyUserToken, visitorController.getVisitorById);
router.put('/:id', verifyUserToken, visitorController.updateVisitor);
router.delete('/:id', verifyUserToken, visitorController.deleteVisitor);

module.exports = router;