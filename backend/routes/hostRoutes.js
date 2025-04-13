const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Host = require('../models/Host');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { 
  loginHost, 
  createHostProfile, 
  getHostProfile, 
  getAvailableHosts, 
  updateHostProfile, 
  getHostById,
  getHostDetails,
  updateHostActiveStatus
} = require('../controllers/hostController');
const { auth } = require('../middleware/userMiddleware');
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || require('../config/default').jwtSecret);
    
    // Check if token belongs to a host
    if (!decoded.isHost) {
      return res.status(403).json({ 
        valid: false, 
        role: "user", 
        message: "Token is valid but not for a host" 
      });
    }
    
    // Check if host still exists in database
    const host = await Host.findOne({ user: decoded.id });
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
      hostId: host.hostID,
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
router.post('/loginHost', loginHost);

// Host profile routes
router.post('/create-profile', auth, upload.single('avatar'), createHostProfile);
router.get('/profile', auth, getHostProfile);
router.get('/getHostDetails', auth, getHostDetails);
router.get('/available', getAvailableHosts);
router.put('/update-profile', auth, upload.single('avatar'), updateHostProfile);

// Add delete profile endpoint
router.delete('/delete-profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the host by user ID
    const host = await Host.findOne({ user: userId });
    
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }
    
    // Delete host profile
    await Host.findOneAndDelete({ user: userId });
    
    // Update user to remove host status
    await User.findByIdAndUpdate(userId, {
      isHost: false,
      hostId: null
    });
    
    // Delete avatar file if exists
    if (host.avatar) {
      const avatarPath = path.join(__dirname, "..", "public", host.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    res.status(200).json({ message: "Host profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting host profile:", error);
    res.status(500).json({ message: "Server error during profile deletion" });
  }
});

router.get('/:hostId', getHostById);

// Update host active status
router.put('/update-status', auth, updateHostActiveStatus);

module.exports = router;