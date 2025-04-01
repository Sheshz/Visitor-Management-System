/*const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Token is not valid' });
  }
};
*/
/*
const jwt = require("jsonwebtoken");
const config = require("../config/default");
const User = require("../models/User");

module.exports = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token using the secret stored in config
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add the decoded user data to the request object (userId is the user._id)
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);
    res.status(401).json({ message: "Token is not valid or expired" });
  }
};

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Token missing!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists in the database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }

    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token!' });
  }
};*/
/*
const jwt = require("jsonwebtoken");
const config = require("../config/default");
const User = require("../models/User");

module.exports = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token using the secret stored in config
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add the decoded user data to the request object (userId is the user._id)
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }

    // Handle other JWT errors
    return res.status(401).json({ message: "Token is not valid" });
  }
};
*/

// middleware/userMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config/default");
const User = require("../models/User");

// Export as named function
const verifyToken = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token using the secret stored in config
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add the decoded user data to the request object (userId is the user._id)
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }

    // Handle other JWT errors
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = {
  verifyToken
};