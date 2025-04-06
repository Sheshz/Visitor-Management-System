const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailService");

// Register User and Send Email
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Check if email is in valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    const fullName = `${firstName} ${lastName}`;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Save the user with plain password (no hashing)
    const user = new User({ firstName, lastName, email, password });
    await user.save();

    // Generate custom styled welcome email
    const subject = "Welcome to GetPass Pro!";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GetPass Pro</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #5e42d5; padding: 15px; text-align: center; }
    .logo-box { display: inline-block; background-color: #5e42d5; border-radius: 8px; width: 40px; height: 40px; margin-right: 10px; vertical-align: middle; border: 2px solid rgba(255,255,255,0.4); }
    .logo-text { display: inline-block; font-size: 24px; font-weight: bold; color: white; vertical-align: middle; }
    .gp-text { color: white; font-weight: bold; font-size: 20px; line-height: 40px; }
    .content { padding: 30px; }
    .user-info { background-color: #f5f3ff; border-left: 4px solid #5e42d5; padding: 15px; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
    .section-title { color: #5e42d5; margin-top: 25px; margin-bottom: 15px; }
    .feature-list { padding-left: 20px; }
    .feature-list li { margin-bottom: 10px; }
    .button { display: inline-block; background-color:rgb(117, 101, 190); color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
    .button:hover { background-color:rgb(103, 83, 189); }
    .divider { height: 1px; background-color: #eee; margin: 25px 0; }
    .footer { font-size: 12px; color: #777; text-align: center; padding: 20px; background-color: #f5f3ff; }
    .social-links { margin: 15px 0; }
    .social-link { display: inline-block; margin: 0 10px; color: #5e42d5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-box">
        <div class="gp-text">GP</div>
      </div>
      <span class="logo-text">GetPass Pro</span>
    </div>
    
    <div class="content">
      <h2>Welcome to GetPass Pro!</h2>
      
      <div class="user-info">
        <p><strong>Account Information:</strong></p>
        <p>Name: ${fullName}</p>
        <p>Email: ${email}</p>
      </div>
      
      <p>Thank you for creating your GetPass Pro account. We're excited to have you join our community of security-conscious users!</p>
      
      <h3 class="section-title">Your Password Management Journey Begins</h3>
      <p>GetPass Pro helps you securely manage all your passwords and sensitive information in one place, with military-grade encryption and intuitive features.</p>
      
      <h3 class="section-title">Get Started Today</h3>
      <ul class="feature-list">
        <li><strong>Download our mobile app</strong> to access your passwords on the go</li>
        <li><strong>Install our browser extension</strong> for seamless password auto-fill</li>
        <li><strong>Set up two-factor authentication</strong> for enhanced security</li>
        <li><strong>Import existing passwords</strong> from your browser or other password managers</li>
      </ul>
      
      <center><a href="#" class="button">Access Your Vault</a></center>
      
      <div class="divider"></div>
      
      <p>If you have any questions or need assistance, our support team is ready to help at <a href="mailto:support@getpasspro.com">support@getpasspro.com</a>.</p>
      
      <p>Stay secure,<br><strong>The GetPass Pro Team</strong></p>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">Twitter</a>
        <a href="#" class="social-link">Facebook</a>
        <a href="#" class="social-link">LinkedIn</a>
      </div>
      <p>© 2025 GetPass Pro. All rights reserved.</p>
      <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

    // Plain text version as fallback
    const text = `
Welcome to GetPass Pro, ${fullName}!

ACCOUNT INFORMATION:
Name: ${fullName}
Email: ${email}

Thank you for creating your GetPass Pro account. We're excited to have you join our community of security-conscious users!

YOUR PASSWORD MANAGEMENT JOURNEY BEGINS
GetPass Pro helps you securely manage all your passwords and sensitive information in one place, with military-grade encryption and intuitive features.

GET STARTED TODAY:
- Download our mobile app to access your passwords on the go
- Install our browser extension for seamless password auto-fill
- Set up two-factor authentication for enhanced security
- Import existing passwords from your browser or other password managers

If you have any questions or need assistance, our support team is ready to help at support@getpasspro.com.

Stay secure,
The GetPass Pro Team

© 2025 GetPass Pro. All rights reserved.
`;

    try {
      // Log before sending email for debugging
      console.log(`Attempting to send welcome email to: ${email}`);
      
      // Send email using the email service
      await sendEmail(email, subject, text, html);
      console.log(`Welcome email sent successfully to: ${email}`);
      
      // Send success response
      res.status(201).json({ message: "User registered successfully and email sent." });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      
      // Even if email fails, user is registered
      res.status(201).json({ 
        message: "User registered successfully, but welcome email could not be sent.",
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Direct password comparison (plain text)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role, // Add the user's role to the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password is correct (plain text comparison)
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update with new password (plain text)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    // Check if email is already in use (by another user)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    // Remove user
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile by email
const getprofile = async (req, res) => {
  try {
    const email = req.query.email; // Get email from query params

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Send password reset email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create reset link
    const resetLink = `${
      process.env.BASE_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    // Create email content with matching GetPass Pro styling
    const subject = "Password Reset Request";
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - GetPass Pro</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #5e42d5; padding: 15px; text-align: center; }
    .logo-box { display: inline-block; background-color: #5e42d5; border-radius: 8px; width: 40px; height: 40px; margin-right: 10px; vertical-align: middle; border: 2px solid rgba(255,255,255,0.4); }
    .logo-text { display: inline-block; font-size: 24px; font-weight: bold; color: white; vertical-align: middle; }
    .gp-text { color: white; font-weight: bold; font-size: 20px; line-height: 40px; }
    .content { padding: 30px; }
    .alert-box { background-color: #f5f3ff; border-left: 4px solid #5e42d5; padding: 15px; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
    .button { display: inline-block; background-color:rgb(117, 101, 190); color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
    .button:hover { background-color:rgb(103, 83, 189); }
    .divider { height: 1px; background-color: #eee; margin: 25px 0; }
    .footer { font-size: 12px; color: #777; text-align: center; padding: 20px; background-color: #f5f3ff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-box">
        <div class="gp-text">GP</div>
      </div>
      <span class="logo-text">GetPass Pro</span>
    </div>
    
    <div class="content">
      <h2>Password Reset Request</h2>
      
      <div class="alert-box">
        <p>We received a request to reset your password. This link will expire in 1 hour.</p>
      </div>
      
      <p>Dear ${user.firstName} ${user.lastName},</p>
      
      <p>We've received a request to reset your password for your GetPass Pro account. To proceed with the password reset, please click the button below:</p>
      
      <center><a href="${resetLink}" class="button">Reset My Password</a></center>
      
      <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 14px;">${resetLink}</p>
      
      <div class="divider"></div>
      
      <p><strong>Important:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns about your account security.</p>
      
      <p>Stay secure,<br><strong>The GetPass Pro Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2025 GetPass Pro. All rights reserved.</p>
      <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
`;

    const textContent = `
Password Reset Request - GetPass Pro

Dear ${user.firstName} ${user.lastName},

We've received a request to reset your password for your GetPass Pro account. 
To proceed with the password reset, please use the following link:

${resetLink}

This link will expire in 1 hour.

Important: If you didn't request this password reset, please ignore this email or contact support if you have concerns about your account security.

Stay secure,
The GetPass Pro Team

© 2025 GetPass Pro. All rights reserved.
`;

    try {
      // Log before sending email for debugging
      console.log(`Attempting to send password reset email to: ${email}`);
      
      // Send password reset email
      await sendEmail(email, subject, textContent, htmlContent);
      console.log(`Password reset email sent successfully to: ${email}`);
      
      res.status(200).json({ message: "Password reset email sent" });
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      res.status(500).json({ 
        message: "Failed to send password reset email", 
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error("Error processing reset request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add the refresh token function to your existing auth controller
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    
    // Validate the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Match the expiration time used in login
    );
    
    res.json({ 
      token: newAccessToken,
      role: user.role
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ message: 'Failed to refresh token' });
  }
};

module.exports = {
  getprofile,
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updatePassword,
  deleteAccount,
  forgotPassword,
  refreshToken,
};