const mongoose = require("mongoose");
require("dotenv").config(); // Import environment variables

const dbURI = process.env.MONGODB_URI; // MongoDB connection URI

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit on connection failure
  }
};

module.exports = connectDB;
