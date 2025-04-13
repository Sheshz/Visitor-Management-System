const Host = require("../models/Host");
const User = require("../models/User");
const { sendHostProfileEmail } = require("../utils/emailService");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const config = require("../config/default");

// Host login functionality
const loginHost = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find host by email
    const host = await Host.findOne({ email });
    if (!host) {
      return res.status(404).json({ message: "Host not found. Invalid credentials." });
    }

    // Direct password comparison (keeping original approach)
    if (host.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Only check if host is active, remove the isApproved check
    if (!host.isActive) {
      return res.status(403).json({ message: "Your host account is currently inactive" });
    }

    // Create payload for JWT
    const payload = {
      id: host.user,
      hostId: host.hostID,
      email: host.email,
      isHost: true
    };

    // Sign JWT token
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          hostId: host.hostID,
          name: host.name
        });
      }
    );
  } catch (error) {
    console.error("Error in host login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Create a new host profile
const createHostProfile = async (req, res) => {
  try {
    // Retrieve the user from JWT
    const userId = req.user.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if host profile already exists for this user
    const existingHost = await Host.findOne({ user: userId });
    if (existingHost) {
      return res
        .status(400)
        .json({ message: "Host profile already exists for this user" });
    }

    // Store password directly as provided (keeping original approach)
    const password = req.body.password || "";

    // Handle avatar file if uploaded
    let avatarPath = "";
    if (req.file) {
      avatarPath = `/uploads/${req.file.filename}`;
    }

    // Create the host profile
    const newHost = new Host({
      user: userId,
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: password, // Store password as provided
      bio: req.body.bio,
      expertise: req.body.expertise,
      location: req.body.location,
      experience: req.body.experience,
      socialMedia: {
        facebook: req.body.facebook || "",
        twitter: req.body.twitter || "",
        linkedin: req.body.linkedin || "",
        instagram: req.body.instagram || "",
      },
      avatar: avatarPath,
      isApproved: true, // Auto-approve hosts
    });

    // Save the new host profile
    const savedHost = await newHost.save();

    // Update user record to indicate they're a host
    await User.findByIdAndUpdate(userId, {
      isHost: true,
      hostId: savedHost.hostID,
    });

    // Send confirmation email using emailService
    try {
      // Pass the full host object to the email service
      await sendHostProfileEmail(savedHost);
    } catch (emailError) {
      console.error("Error sending host profile email:", emailError);
      // Continue with the response even if email fails
    }

    // Return success response
    res.status(201).json({
      message: "Host profile created successfully",
      hostId: savedHost.hostID,
    });
  } catch (error) {
    console.error("Error creating host profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get host details for authenticated host
const getHostDetails = async (req, res) => {
  try {
    const host = await Host.findOne({ user: req.user.id }).select("-password");
    
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }
    
    res.json({ host });
  } catch (error) {
    console.error("Error fetching host details:", error);
    res.status(500).json({ message: "Server error fetching host details" });
  }
};

// Get the host profile for the authenticated user
const getHostProfile = async (req, res) => {
  try {
    // This function is assumed to exist in the original code
    // Implementation not shown in the provided code
    // Add your implementation here if needed
    const host = await Host.findOne({ user: req.user.id }).select("-password");
    
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }
    
    res.json(host);
  } catch (error) {
    console.error("Error fetching host profile:", error);
    res.status(500).json({ message: "Server error fetching host profile" });
  }
};

const getAvailableHosts = async (req, res) => {
  try {
    // Modified to only check isActive since all hosts are now auto-approved
    const hosts = await Host.find({ isActive: true })
      .select("-password -user -__v")
      .sort({ createdAt: -1 });

    res.json(hosts);
  } catch (error) {
    console.error("Error fetching available hosts:", error);
    res.status(500).json({ message: "Server error fetching hosts" });
  }
};

const updateHostProfile = async (req, res) => {
  try {
    // Check if user ID exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication error. Please log in again.",
      });
    }

    let host = await Host.findOne({ user: req.user.id });

    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name || host.name,
      email: req.body.email || host.email,
      username: req.body.username || host.username,
      bio: req.body.bio || host.bio,
      expertise: req.body.expertise || host.expertise,
      location: req.body.location || host.location,
      experience: req.body.experience || host.experience,
      socialMedia: {
        facebook: req.body.facebook || host.socialMedia.facebook,
        twitter: req.body.twitter || host.socialMedia.twitter,
        linkedin: req.body.linkedin || host.socialMedia.linkedin,
        instagram: req.body.instagram || host.socialMedia.instagram,
      },
    };

    // Store password directly if provided (keeping original approach)
    if (req.body.password) {
      updateData.password = req.body.password;
    }

    // Handle avatar update if new file is uploaded
    if (req.file) {
      // Delete old avatar file if it exists
      if (host.avatar) {
        const oldAvatarPath = path.join(__dirname, "..", "public", host.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Set new avatar path
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    // Update host profile
    host = await Host.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Host profile updated successfully",
      host,
    });
  } catch (error) {
    console.error("Error updating host profile:", error);
    res.status(500).json({ message: "Server error updating host profile" });
  }
};

const getHostById = async (req, res) => {
  try {
    const host = await Host.findOne({ hostID: req.params.hostId })
      .select("-password -user")
      .populate("user", "name email");

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    res.json(host);
  } catch (error) {
    console.error("Error fetching host by ID:", error);
    res.status(500).json({ message: "Server error fetching host profile" });
  }
};
// Add this to your hostController.js file

const updateHostActiveStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find host by user ID
    const host = await Host.findOne({ user: userId });
    
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }
    
    // Update active status and activeUntil
    const { isActive, activeUntil } = req.body;
    
    // Validate the request data
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }
    
    // If activating, require activeUntil
    if (isActive && !activeUntil) {
      return res.status(400).json({ message: "activeUntil is required when activating host" });
    }
    
    // Update the host document
    const updatedHost = await Host.findOneAndUpdate(
      { user: userId },
      { 
        isActive: isActive,
        activeUntil: isActive ? activeUntil : null
      },
      { new: true }
    ).select("-password");
    
    res.json({
      success: true,
      message: `Host status updated to ${isActive ? 'active' : 'inactive'}`,
      host: updatedHost
    });
  } catch (error) {
    console.error("Error updating host active status:", error);
    res.status(500).json({ message: "Server error updating host status" });
  }
};

// Add a function to check and update expired host statuses
const checkAndUpdateHostStatuses = async () => {
  try {
    const currentTime = new Date();
    
    // Find all hosts whose active status should expire
    const hostsToUpdate = await Host.find({
      isActive: true,
      activeUntil: { $lt: currentTime }
    });
    
    // Update each host to inactive
    for (const host of hostsToUpdate) {
      host.isActive = false;
      host.activeUntil = null;
      await host.save();
      
      console.log(`Host ${host.name} (ID: ${host.hostID}) status set to inactive due to expiration`);
    }
    
    return hostsToUpdate.length;
  } catch (error) {
    console.error("Error checking and updating host statuses:", error);
    return 0;
  }
};

// Add these functions to module.exports
module.exports = {
  loginHost,
  createHostProfile,
  getHostProfile,
  getAvailableHosts,
  updateHostProfile,
  getHostById,
  getHostDetails,
  updateHostActiveStatus,
  checkAndUpdateHostStatuses,
};