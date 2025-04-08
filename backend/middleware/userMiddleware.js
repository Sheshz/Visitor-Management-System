const jwt = require("jsonwebtoken");
const config = require("../config/default");
const User = require("../models/User");

// User authentication middleware
const verifyUserToken = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Ensure this is a user token, not a host token
    if (decoded.isHost) {
      return res.status(403).json({ message: "Invalid token type. Host token used for user access." });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    // Handle other JWT errors
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Host authentication middleware
const verifyHostToken = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Ensure this is a host token
    if (!decoded.isHost) {
      return res.status(403).json({ message: "Invalid token type. User token used for host access." });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    // Handle other JWT errors
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Generic token verification (can be either user or host)
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    const decoded = jwt.verify(token, config.jwtSecret);
    
    req.user = {
      id: decoded.id || decoded.userId,
      isHost: decoded.isHost || false
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    
    return res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

// Add a verifyToken alias for backward compatibility
const verifyToken = auth;

module.exports = {
  verifyUserToken,
  verifyHostToken,
  auth,
  verifyToken
};