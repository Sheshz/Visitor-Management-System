const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify user token
const verifyUserToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

// Check if user is host
const isHost = (req, res, next) => {
  if (req.user && req.user.role === 'host') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Host privileges required' });
  }
};

// Combined auth middleware
const auth = (roles = []) => {
  return [
    verifyUserToken,
    (req, res, next) => {
      if (roles.length === 0 || roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied: Insufficient privileges' });
      }
    }
  ];
};

module.exports = {
  verifyUserToken,
  isAdmin,
  isHost,
  auth
};