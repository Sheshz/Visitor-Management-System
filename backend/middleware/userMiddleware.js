const jwt = require("jsonwebtoken");
const config = require("../config/default");

module.exports = function (req, res, next) {
  // Get token from header (Bearer token)
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from the "Authorization" header

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token using the secret stored in config
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add the decoded user data to the request object
    req.user = decoded; // We now expect the token to have { userId: user._id }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token is not valid" });
  }
};