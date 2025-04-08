const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Add this import
const Host = require('../models/Host'); // Add this import
const { 
  loginHost, 
  createHostProfile, 
  getHostProfile, 
  getAvailableHosts, 
  updateHostProfile, 
  getHostById,
  getHostDetails
} = require('../controllers/hostController');
const { verifyUserToken, auth } = require('../middleware/userMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Validate host token endpoint
router.post("/validate-token", async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token belongs to a host
    if (!decoded.isHost) {
      return res.status(403).json({ 
        valid: false, 
        role: "user", 
        message: "Token is valid but not for a host" 
      });
    }
    
    // Check if host still exists in database
    const host = await Host.findOne({ hostID: decoded.hostId });
    if (!host) {
      return res.status(404).json({ 
        valid: false, 
        message: "Host account not found" 
      });
    }
    
    // Return successful validation
    return res.status(200).json({
      valid: true,
      role: "host",
      hostId: decoded.hostId,
      name: host.name
    });
  } catch (error) {
    // Handle expired or invalid tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        valid: false, 
        message: "Token expired" 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        valid: false, 
        message: "Invalid token" 
      });
    }
    
    // Handle other errors
    console.error("Token validation error:", error);
    return res.status(500).json({ 
      valid: false, 
      message: "Server error during validation" 
    });
  }
});

// Host authentication routes
router.post('/login', loginHost);
router.post('/loginHost', loginHost); // Add this route to match frontend's expectations

// Host profile routes
router.post('/create-profile', auth, upload.single('avatar'), createHostProfile);
router.get('/profile', auth, getHostProfile);
router.get('/getHostDetails', auth, getHostDetails);
router.get('/available', getAvailableHosts);
router.put('/update-profile', auth, upload.single('avatar'), updateHostProfile);
router.get('/:hostId', getHostById);

module.exports = router;