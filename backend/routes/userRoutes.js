const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/userMiddleware");

const router = express.Router();

// Public routes - no auth required
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes - auth required
router.get("/me", auth, userController.getCurrentUser);
router.put("/me", auth, userController.updateProfile);
router.put("/password", auth, userController.updatePassword);
router.delete("/me", auth, userController.deleteAccount);

module.exports = router;