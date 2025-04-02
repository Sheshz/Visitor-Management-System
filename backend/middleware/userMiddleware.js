// middleware/userMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config/default");
const User = require("../models/User");

// Export as named function
const verifyToken = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
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

const auth = async (req, res, next) => {
  try {
    // Log the token for debugging
    console.log("Token received:", req.header("Authorization"));
    
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, config.jwtSecret);

    // Log the decoded user for debugging
    console.log("Decoded user:", decoded);

    // This is crucial - it should set req.user with the user info
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = {
  verifyToken,
  auth,
};