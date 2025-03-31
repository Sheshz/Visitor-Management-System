const Host = require("../models/Host");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmails"); // Import the email utility

// Example of createHost function
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
    const user = await User.findById(req.userId); // Fetch user details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a host
    const existingHost = await Host.findOne({ user: req.userId });
    if (existingHost) {
      return res.status(400).json({ message: "User is already a host" });
    }

    // Create new host
    const newHost = new Host({
      user: req.userId, // Reference to the User model
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
      isActive: true, // Optionally mark as active
    });

    // Save the new host in the database
    await newHost.save();

    // Optionally update user role to "host"
    user.role = "host";
    await user.save();

    // Send email to user and host
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
    const host = await User.findOne({ email }); // Find host by email

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Validate password (use bcrypt in production)
    if (password !== host.password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: host._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get host details
const getHostDetails = async (req, res) => {
  try {
    const hostId = req.params.id || req.userId;

    if (!hostId) {
      return res.status(400).json({ message: "Host ID is required" });
    }

    let host = await Host.findById(hostId);

    if (!host) {
      host = await Host.findOne({ user: hostId });
    }

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    res.status(200).json({
      name: host.name,
      email: host.email,
    });
  } catch (error) {
    console.error("Error fetching host details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update host details
const updateHost = async (req, res) => {
  try {
    const host = await Host.findById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Update fields if provided
    host.bio = req.body.bio || host.bio;
    host.expertise = req.body.expertise || host.expertise;
    host.location = req.body.location || host.location;
    host.experience = req.body.experience || host.experience;
    host.profileImage = req.file ? req.file.filename : host.profileImage;
    host.socialMedia = {
      facebook: req.body.facebook || host.socialMedia.facebook,
      twitter: req.body.twitter || host.socialMedia.twitter,
      linkedin: req.body.linkedin || host.socialMedia.linkedin,
      instagram: req.body.instagram || host.socialMedia.instagram,
    };

    await host.save();
    res.status(200).json({ message: "Host updated successfully", host });
  } catch (error) {
    console.error("Error updating host:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete host
const deleteHost = async (req, res) => {
  try {
    const host = await Host.findByIdAndDelete(req.params.id);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    res.status(200).json({ message: "Host deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  applyToBecomeHost,
  loginHost,
  getHostDetails,
  updateHost,
  deleteHost,
  createHost,
};
