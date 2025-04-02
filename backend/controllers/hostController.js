const Host = require("../models/Host");
const User = require("../models/User");
const { sendHostProfileEmail } = require("../utils/emailService");
const fs = require("fs");
const path = require("path");

// Create a new host profile
// Create a new host profile
const createHost = async (req, res) => {
  try {
    console.log("Create host process started", { 
      body: req.body, 
      file: req.file, 
      userId: req.user?.id 
    });
    
    // Check if user ID exists
    if (!req.user || !req.user.id) {
      console.log("Authentication error: No user ID found in request");
      return res.status(401).json({ 
        message: "Authentication error. Please log in again." 
      });
    }
    
    // Check if user already has a host profile - Enhanced check
    const existingHost = await Host.findOne({ user: req.user.id });
    if (existingHost) {
      console.log("User already has a host profile", { 
        userId: req.user.id,
        hostId: existingHost._id,
        hostID: existingHost.hostID
      });
      return res.status(400).json({ 
        message: "You already have a host profile", 
        hostID: existingHost.hostID,
        redirect: "/host/dashboard"  // Redirect path for the frontend
      });
    }

    // Get user data from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found", { userId: req.user.id });
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found successfully", { userId: req.user.id });

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process file upload if present
    let avatarPath = "";
    if (req.file) {
      console.log("Processing file upload", req.file);
      avatarPath = `/uploads/${req.file.filename}`;
    }

    // Prepare social media object - trim whitespace from URLs
    const socialMedia = {
      facebook: req.body.facebook ? req.body.facebook.trim() : "",
      twitter: req.body.twitter ? req.body.twitter.trim() : "",
      linkedin: req.body.linkedin ? req.body.linkedin.trim() : "",
      instagram: req.body.instagram ? req.body.instagram.trim() : ""
    };

    // Create new host profile with data from request
    const newHost = new Host({
      user: req.user.id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      bio: req.body.bio,
      expertise: req.body.expertise,
      location: req.body.location,
      experience: req.body.experience,
      socialMedia,
      avatar: avatarPath
    });

    console.log("Preparing to save host profile", { hostData: newHost });

    // Save host to database
    await newHost.save();
    console.log("Host profile saved successfully");

    // Send confirmation email with PDF attachment
    try {
      await sendHostProfileEmail(newHost);
      console.log("Host profile email sent successfully");
    } catch (emailError) {
      console.error("Error sending email, but host profile was created:", emailError);
      // Continue anyway since the profile was created
    }

    // Return success response with host ID and redirection info
    res.status(201).json({
      success: true,
      message: "Host profile created successfully! A confirmation email with your host details has been sent to your email address.",
      host: {
        id: newHost._id,
        hostID: newHost.hostID,
        name: newHost.name,
        email: newHost.email
      },
      redirect: "/host/dashboard"  // Path for redirection
    });
  } catch (error) {
    console.error("Error creating host profile:", error);
    // Return a more detailed error message
    res.status(500).json({ 
      message: "Server error creating host profile", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// The rest of the controller remains unchanged
const getHostProfile = async (req, res) => {
  try {
    // Check if user ID exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: "Authentication error. Please log in again." 
      });
    }
    
    const host = await Host.findOne({ user: req.user.id });
    
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
      .select('-user -__v')
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
        message: "Authentication error. Please log in again." 
      });
    }
    
    let host = await Host.findOne({ user: req.user.id });
    
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }
    
    // Prepare update data
    const updateData = {
      bio: req.body.bio || host.bio,
      expertise: req.body.expertise || host.expertise,
      location: req.body.location || host.location,
      experience: req.body.experience || host.experience,
      socialMedia: {
        facebook: req.body.facebook || host.socialMedia.facebook,
        twitter: req.body.twitter || host.socialMedia.twitter,
        linkedin: req.body.linkedin || host.socialMedia.linkedin,
        instagram: req.body.instagram || host.socialMedia.instagram
      }
    };
    
    // Handle avatar update if new file is uploaded
    if (req.file) {
      // Delete old avatar file if it exists
      if (host.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', host.avatar);
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
    );
    
    res.json({
      success: true,
      message: "Host profile updated successfully",
      host
    });
  } catch (error) {
    console.error("Error updating host profile:", error);
    res.status(500).json({ message: "Server error updating host profile" });
  }
};

module.exports = {
  createHost,
  getHostProfile,
  getAvailableHosts,
  updateHostProfile
};