// config/default.js
module.exports = {
  // MongoDB connection string
  mongoURI:
    process.env.MONGO_URI || "mongodb://localhost:27017/visitor-management",

  // JWT Secret for token signing
  jwtSecret: process.env.JWT_SECRET || "c23Z!1hJ@k3bLw$BfR92pTnG9",

  // JWT token expiry time
  jwtExpire: process.env.JWT_EXPIRE || "24h",

  // Server port
  port: process.env.PORT || 5000,

  // Base URL for the application (used for generating links)
  baseUrl: process.env.BASE_URL || "http://localhost:5000",

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true" || false,
    user: process.env.EMAIL_USER || "getepasspro@gmail.com",
    password: process.env.EMAIL_PASSWORD || "mnjs snaf qzlz nmno",
    from: process.env.EMAIL_FROM || "GetePassPro <getepasspro@gmail.com>",
  },

  // Upload file size limit
  uploadLimit: process.env.UPLOAD_LIMIT || "5mb",

  // Enable/disable debugging
  debug: process.env.DEBUG === "true" || false,
};
