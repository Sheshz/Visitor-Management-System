// routes/hostRoutes.js
const express = require("express");
const router = express.Router();
const hostController = require("../controllers/hostController");
const { verifyToken } = require("../middleware/userMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure upload settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Routes

// GET current user's host profile
router.get("/me", verifyToken, hostController.getHostProfile);

// GET all available hosts
router.get("/available", hostController.getAvailableHosts);

// POST create new host profile - add this route to match the frontend
router.post("/apply", verifyToken, upload.single("avatar"), hostController.createHost);

// PUT update host profile
router.put(
  "/update",
  verifyToken,
  upload.single("avatar"),
  hostController.updateHostProfile
);

module.exports = router;