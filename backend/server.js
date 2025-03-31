const connectDB = require("./config/db");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
//const meetingRoutes = require("./routes/meetingRoutes");
//const hostRoutes = require("./routes/hostRoutes"); // Host Routes
const http = require("http");
//const socketIo = require("socket.io");

// Load environment variables
dotenv.config();
connectDB();

require('dotenv').config(); // Make sure to require dotenv at the top of your app

const jwtSecret = process.env.JWT_SECRET;
console.log(jwtSecret); // Prints the JWT_SECRET

// Initialize Express app
const app = express();

// Create an HTTP server for socket.io
const server = http.createServer(app);

// Initialize Socket.io
//const io = socketIo(server, { cors: { origin: "*" } });

// Middleware setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use("/uploads", express.static("uploads")); // Serve static files for image uploads

// Routes
app.use("/api/users", userRoutes);

app.get("/api/public", (req, res) => {
  res.send("This is a public route!");
});
//app.use("/api/meetings", verifyToken, meetingRoutes); // Protect meetings with token verification
//app.use("/api/hosts", hostRoutes); // Host routes

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});