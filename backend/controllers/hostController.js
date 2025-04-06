const Host = require("../models/Host");
const User = require("../models/User");
const { sendHostProfileEmail } = require("../utils/emailService");
const fs = require("fs");
const path = require("path");

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

    // Store password directly as provided
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

// Fetch the current user's host profile
const getHostProfile = async (req, res) => {
  try {
    // Check if user ID exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication error. Please log in again.",
      });
    }

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

// Get all available hosts (for public viewing)
const getAvailableHosts = async (req, res) => {
  try {
    const hosts = await Host.find({ isActive: true, isApproved: true })
      .select("-password -user -__v")
      .sort({ createdAt: -1 });

    res.json(hosts);
  } catch (error) {
    console.error("Error fetching available hosts:", error);
    res.status(500).json({ message: "Server error fetching hosts" });
  }
};

// Update host profile
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

    // Store password directly if provided
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

// Get host by ID
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

module.exports = {
  createHostProfile,
  getHostProfile,
  getAvailableHosts,
  updateHostProfile,
  getHostById,
};