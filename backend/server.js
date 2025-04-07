const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");

// Import routes
const userRoutes = require("./routes/userRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
//const meetingRoutes = require("./routes/meetingRoutes");
const hostRoutes = require("./routes/hostRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
//const authRoutes = require("./routes/authRoutes"); // New auth routes import

// Load environment variables
dotenv.config();

// Define PORT at the beginning
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Create an HTTP server for socket.io
const server = http.createServer(app);

// Initialize Socket.io
//const io = socketIo(server, { cors: { origin: "*" } });

// Configure CORS - Add this before other middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true // Enable credentials (cookies, authorization headers, etc.)
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Middleware setup
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
//app.use("/api/au", authRoutes); // Add new auth routes
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/hosts", hostRoutes); // Changed from "/api/host" to "/api/hosts" to match your error message

app.get("/api/public", (req, res) => {
  res.send("This is a public route!");
});
//app.use("/api/meetings", verifyToken, meetingRoutes); // Protect meetings with token verification

// Health check route
app.get("/health", (req, res) => {
  res.status(200).send("Server is running");
});

// Default route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect to database - only once
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: http://localhost:5173`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

module.exports = app;