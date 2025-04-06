const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up upload limits and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit as specified in frontend
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Import controllers
const {
  createHostProfile,
  getHostProfile,
  getAvailableHosts,
  updateHostProfile,
  getHostById
} = require("../controllers/hostController");

// JWT Secret from config
const config = require("../config/default");
const jwt = require("jsonwebtoken");

// Authentication middleware - FIXED
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Set user in request (using id instead of userId)
    req.user = {
      id: decoded.id || decoded.userId // Handle both formats for compatibility
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    
    return res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

// This middleware is identical to auth for now, but kept separate for clarity
const verifyToken = auth;

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    // Other errors
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.post(
  "/create", 
  auth, 
  upload.single("avatar"),
  handleMulterError,
  createHostProfile
);

router.get("/me", verifyToken, getHostProfile);
router.get("/available", getAvailableHosts);
router.get("/:hostId", getHostById);
router.put(
  "/update", 
  verifyToken, 
  upload.single("avatar"), 
  handleMulterError,
  updateHostProfile
);

module.exports = router;