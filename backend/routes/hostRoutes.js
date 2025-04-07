const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyHostToken, auth } = require("../middleware/userMiddleware");

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
const hostController = require("../controllers/hostController");

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
  hostController.createHostProfile
);

router.get("/me", verifyHostToken, hostController.getHostProfile);
router.get("/available", hostController.getAvailableHosts);
router.get("/:hostId", hostController.getHostById);
router.put(
  "/update", 
  verifyHostToken, 
  upload.single("avatar"), 
  handleMulterError,
  hostController.updateHostProfile
);

// Add both login routes to match both potential endpoints
router.post("/login", hostController.loginHost);
router.post("/loginHost", hostController.loginHost); // Add this line to fix the route issue

module.exports = router;