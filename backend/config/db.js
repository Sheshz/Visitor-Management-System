const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    // Remove the deprecated options
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/visitor-management');
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
