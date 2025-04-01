// controllers/hostController.js
const Host = require('../models/Host');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get all hosts
exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await Host.find().populate('user');
    
    return res.status(200).json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return res.status(500).json({ error: 'Server error while fetching hosts' });
  }
};

// Get host by ID
exports.getHostById = async (req, res) => {
  try {
    const hostId = req.params.id;
    
    const host = await Host.findById(hostId).populate('user');
    
    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }
    
    return res.status(200).json(host);
  } catch (error) {
    console.error('Error fetching host:', error);
    return res.status(500).json({ error: 'Server error while fetching host' });
  }
};

// Get host profile for current authenticated user
exports.getMyHostProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const host = await Host.findOne({ user: userId });
    
    if (!host) {
      return res.status(404).json({ error: 'Host profile not found' });
    }
    
    return res.status(200).json(host);
  } catch (error) {
    console.error('Error fetching host profile:', error);
    return res.status(500).json({ error: 'Server error while fetching host profile' });
  }
};

// Apply to become a host
exports.applyToBecomeHost = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, experience, bio, expertise } = req.body;
    const userId = req.user ? req.user._id : null;
    
    // Check if email already exists
    const existingHost = await Host.findOne({ email });
    if (existingHost) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new host profile
    const newHost = new Host({
      user: userId,
      firstName,
      lastName,
      email,
      password, // Note: You should hash this password before saving
      location,
      experience,
      bio,
      expertise,
      profileImage: req.file ? `/uploads/${req.file.filename}` : ''
    });
    
    const savedHost = await newHost.save();
    
    // If linked to a user, update user's role
    if (userId && User) {
      await User.findByIdAndUpdate(userId, { 
        $addToSet: { roles: 'host' }
      });
    }
    
    return res.status(201).json(savedHost);
  } catch (error) {
    console.error('Error creating host profile:', error);
    return res.status(500).json({ error: 'Server error while creating host profile' });
  }
};

// Update host
exports.updateHost = async (req, res) => {
  try {
    const hostId = req.params.id;
    const updates = req.body;
    
    // Get existing host to check profile image
    const existingHost = await Host.findById(hostId);
    if (!existingHost) {
      return res.status(404).json({ error: 'Host not found' });
    }
    
    // Handle profile image update if new file is uploaded
    if (req.file) {
      // Delete old profile image if exists and is not the default
      if (existingHost.profileImage && existingHost.profileImage.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', existingHost.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new profile image path
      updates.profileImage = `/uploads/${req.file.filename}`;
    }
    
    const updatedHost = await Host.findByIdAndUpdate(
      hostId,
      updates,
      { new: true }
    );
    
    return res.status(200).json(updatedHost);
  } catch (error) {
    console.error('Error updating host:', error);
    return res.status(500).json({ error: 'Server error while updating host' });
  }
};

// Delete host
exports.deleteHost = async (req, res) => {
  try {
    const hostId = req.params.id;
    
    // Get host to find user ID and profile image
    const host = await Host.findById(hostId);
    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }
    
    // Delete profile image file if exists
    if (host.profileImage && host.profileImage.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', host.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete host from database
    await Host.findByIdAndDelete(hostId);
    
    // Update user role to remove 'host' if there's a linked user
    if (host.user && User) {
      await User.findByIdAndUpdate(host.user, {
        $pull: { roles: 'host' }
      });
    }
    
    return res.status(200).json({ message: 'Host deleted successfully' });
  } catch (error) {
    console.error('Error deleting host:', error);
    return res.status(500).json({ error: 'Server error while deleting host' });
  }
};

// Get hosts stats for dashboard
exports.getHostsStats = async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required' });
    }
    
    // Get total hosts count
    const totalHosts = await Host.countDocuments();
    
    // Get active and inactive hosts
    const activeHosts = await Host.countDocuments({ isActive: true });
    const inactiveHosts = await Host.countDocuments({ isActive: false });
    
    // Get recent hosts (last 5)
    const recentHosts = await Host.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    return res.status(200).json({
      totalHosts,
      activeHosts,
      inactiveHosts,
      recentHosts
    });
  } catch (error) {
    console.error('Error getting hosts stats:', error);
    return res.status(500).json({ error: 'Server error while getting hosts stats' });
  }
};

// Get hosts by department
exports.getHostsByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.deptId;
    
    // Since your schema doesn't have department field, this might need to be adjusted
    // For now, we'll return all active hosts
    const hosts = await Host.find({ isActive: true });
    
    return res.status(200).json(hosts);
  } catch (error) {
    console.error('Error fetching hosts by department:', error);
    return res.status(500).json({ error: 'Server error while fetching hosts' });
  }
};

/*
// controllers/hostController.js
const Host = require("../models/Host");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmails");
const config = require("../config/default");

// Create host (admin function)
const createHost = (req, res) => {
  const { name, email } = req.body;

  // Your logic for creating a host (e.g., saving to the database)

  res.status(200).json({
    message: "Host created successfully!",
  });
};

// Apply to become a host
const applyToBecomeHost = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Fetch user details using the userId from JWT

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a host
    const existingHost = await Host.findOne({ user: req.user.userId });
    if (existingHost) {
      return res.status(400).json({ message: "User is already a host" });
    }

    // Create new host
    const newHost = new Host({
      user: req.user.userId, // Reference to the User model
      name: user.name, // Get name from User model
      email: user.email, // Get email from User model
      bio: req.body.bio,
      expertise: req.body.expertise,
      location: req.body.location,
      experience: req.body.experience,
      profileImage: req.file ? req.file.filename : null, // Save file name
      socialMedia: {
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        instagram: req.body.instagram,
      },
      available: true, // Mark as available by default
      isActive: true, // Mark as active by default
    });

    // Save the new host in the database
    await newHost.save();

    // Update user role to "host"
    user.role = "host";
    await user.save();

    // Send email to user
    const hostEmailSubject = "You have been approved as a host!";
    const hostEmailText = `Hello ${user.name},\n\nYour application to become a host has been approved. You can now start hosting sessions. Your login email is ${user.email}.\n\nThank you!`;
    const hostEmailHtml = `<h1>Hello ${user.name}</h1><p>Your application to become a host has been approved. You can now start hosting sessions. Your login email is ${user.email}.</p><p>Thank you!</p>`;

    // Send email to the user
    await sendEmail(user.email, hostEmailSubject, hostEmailText, hostEmailHtml);

    res.status(201).json({
      message: "Host application submitted successfully",
      host: newHost,
    });
  } catch (error) {
    console.error("Error applying as host:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login function for host
const loginHost = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Check if the user is a host
    const hostProfile = await Host.findOne({ user: user._id });
    if (!hostProfile) {
      return res
        .status(403)
        .json({ message: "User is not registered as a host" });
    }

    // Validate password (use bcrypt in production)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get host profile
const getHostProfile = async (req, res) => {
  try {
    // Find host by user ID from token
    const hostProfile = await Host.findOne({ user: req.user.userId });

    if (!hostProfile) {
      return res.status(404).json({ message: "Host profile not found" });
    }

    res.status(200).json(hostProfile);
  } catch (error) {
    console.error("Error fetching host profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update host profile
const updateHostProfile = async (req, res) => {
  try {
    // Find host by user ID from token
    const hostProfile = await Host.findOne({ user: req.user.userId });

    if (!hostProfile) {
      return res.status(404).json({ message: "Host profile not found" });
    }

    // Update fields if provided
    hostProfile.bio = req.body.bio || hostProfile.bio;
    hostProfile.expertise = req.body.expertise || hostProfile.expertise;
    hostProfile.location = req.body.location || hostProfile.location;
    hostProfile.experience = req.body.experience || hostProfile.experience;
    hostProfile.profileImage = req.file
      ? req.file.filename
      : hostProfile.profileImage;
    hostProfile.available =
      req.body.available !== undefined
        ? req.body.available
        : hostProfile.available;
    hostProfile.socialMedia = {
      facebook: req.body.facebook || hostProfile.socialMedia.facebook,
      twitter: req.body.twitter || hostProfile.socialMedia.twitter,
      linkedin: req.body.linkedin || hostProfile.socialMedia.linkedin,
      instagram: req.body.instagram || hostProfile.socialMedia.instagram,
    };

    await hostProfile.save();
    res
      .status(200)
      .json({
        message: "Host profile updated successfully",
        host: hostProfile,
      });
  } catch (error) {
    console.error("Error updating host profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get available hosts (public endpoint)
const getAvailableHosts = async (req, res) => {
  try {
    // Find hosts that are both active and available
    const availableHosts = await Host.find({ isActive: true, available: true })
      .select("-user -__v") // Exclude sensitive fields
      .sort({ name: 1 }); // Sort by name

    res.status(200).json(availableHosts);
  } catch (error) {
    console.error("Error fetching available hosts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createHost,
  applyToBecomeHost,
  loginHost,
  getHostProfile,
  updateHostProfile,
  getAvailableHosts,
};
*/