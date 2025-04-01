// routes/hostRoutes.js
const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const { verifyToken } = require('../middleware/userMiddleware');
const fileUpload = require('../middleware/fileUpload');

// Get all hosts
router.get('/all', verifyToken, hostController.getAllHosts);

// Get host by ID
router.get('/:id', verifyToken, hostController.getHostById);

// Get host profile (for current authenticated user)
router.get('/profile/me', verifyToken, hostController.getMyHostProfile);

// Apply to become a host (with file upload)
router.post('/apply', verifyToken, fileUpload.uploadSingleFile('avatar'), hostController.applyToBecomeHost);

// Update host
router.put('/:id', verifyToken, fileUpload.uploadSingleFile('avatar'), hostController.updateHost);

// Delete host
router.delete('/:id', verifyToken, hostController.deleteHost);

// Get hosts for dashboard (admin only)
router.get('/dashboard/stats', verifyToken, hostController.getHostsStats);

// Additional routes as needed
router.get('/department/:deptId', verifyToken, hostController.getHostsByDepartment);

module.exports = router;



/*
// routes/hostsRoutes.js
const express = require('express');
const router = express.Router();
const hostsController = require('../controllers/hostController');
const authMiddleware = require('../middleware/userMiddleware');

// All routes are protected with authentication
router.use(authMiddleware);

// Get available hosts
router.get('/available', hostsController.getAvailableHosts);

// Route for applying to become a host
router.post("/apply", verifyToken, upload.single("avatar"), applyToBecomeHost);
module.exports = router;

// Host login route
router.post("/loginHost", loginHost);

/*const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
//const { applyToBecomeHost, loginHost, updateHost, deleteHost, getHostDetails , createHost ,  getAvailableHosts } = require("../controllers/hostController");
const { createHost,getAvailableHosts } = require("../controllers/hostController");

const { verifyToken } = require("../middleware/userMiddleware");

// Set up Multer for image uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// Route for applying to become a host
router.post("/apply", verifyToken, upload.single("avatar"), applyToBecomeHost);

// Host login route
router.post("/loginHost", loginHost);

// Add verifyToken middleware to protect this route
router.get("/getHostDetails", verifyToken, getHostDetails);

// Protected route with token verification (example)
router.get("/protected-route", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected route accessed successfully!" });
});

// Update host (with avatar upload)
router.put("/:id", verifyToken, upload.single("avatar"), updateHost);

// Delete host
router.delete("/:id", verifyToken, deleteHost);

// Define POST route to create a host
router.post("/create", createHost);

// Route to get available hosts
router.get("/available", getAvailableHosts);

// Define POST route to create a host
router.post("/create", createHost);
module.exports = router; */
