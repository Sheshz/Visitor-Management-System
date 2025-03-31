const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { applyToBecomeHost, loginHost, updateHost, deleteHost, getHostDetails , createHost} = require("../controllers/hostController");
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


module.exports = router;