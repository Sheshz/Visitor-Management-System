const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Host = require("../models/Host");

// Unified middleware to authenticate both users and hosts
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.type === "user") {
      const user = await User.findById(decodedToken.userId);
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = {
        userId: user._id,
        email: user.email,
        role: "user"
      };

      const host = await Host.findOne({ user: user._id });
      if (host) {
        req.user.hostId = host.hostID;
      }

    } else if (decodedToken.type === "host") {
      const host = await Host.findOne({ hostID: decodedToken.hostId });
      if (!host) return res.status(401).json({ message: "Host not found" });

      req.user = {
        hostId: host.hostID,
        email: host.email,
        role: "host",
        userId: host.user || undefined
      };

    } else {
      return res.status(401).json({ message: "Invalid token type" });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

const authorizeHost = (req, res, next) => {
  if (!req.user || !req.user.hostId) {
    return res.status(403).json({ message: "Host privileges required" });
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

const host = (req, res, next) => {
  if (req.user && req.user.role === "host") {
    next();
  } else {
    res.status(403).json({ message: "Host access required" });
  }
};

module.exports = {
  authenticateUser,
  authorizeHost,
  admin,
  host
};
