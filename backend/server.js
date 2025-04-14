const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const morgan = require("morgan");

// Import routes
const userRoutes = require("./routes/userRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const hostRoutes = require("./routes/hostRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const meetingRoutes = require("./routes/meetingRoutes");

// Import the status scheduler
const { scheduleStatusUpdates } = require('./utils/statusScheduler');

// Load environment variables
dotenv.config();

// Define PORT at the beginning
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Create an HTTP server for socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set up socket.io for real-time communication
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a meeting room
  socket.on('joinMeeting', (meetingId) => {
    socket.join(`meeting-${meetingId}`);
    console.log(`User joined meeting: ${meetingId}`);
  });
  
  // Join a private user room for direct messages
  socket.on('registerUser', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User registered for private messages: ${userId}`);
    }
  });
  
  // Leave a meeting room
  socket.on('leaveMeeting', (meetingId) => {
    socket.leave(`meeting-${meetingId}`);
    console.log(`User left meeting: ${meetingId}`);
  });
  
  // Handle chat messages
  socket.on('sendMessage', (data) => {
    if (data.isPrivate && data.recipientId) {
      // Private message
      io.to(`user-${data.recipientId}`).to(`user-${data.senderId}`).emit('newPrivateMessage', data);
    } else {
      // Public message to meeting room
      io.to(`meeting-${data.meetingId}`).emit('newMessage', data);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Add morgan for HTTP request logging
app.use(morgan('dev'));

// Configure CORS - Add this before other middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Your React app's URL
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
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/hosts", hostRoutes); 
app.use("/api/meetings", meetingRoutes);

app.get("/api/public", (req, res) => {
  res.send("This is a public route!");
});

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

// Share io instance for use in other files
app.set('io', io);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  
  // Initialize the host status scheduler
  scheduleStatusUpdates();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

module.exports = { app, server, io };