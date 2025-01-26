const express = require("express");
const cors = require("cors"); // Import the CORS middleware
const connectDB = require("./db"); // Your database connection
const authRoutes = require("./routes/authRoutes"); // The routes you defined earlier
const scanRoutes = require("./routes/scanRoutes");
const app = express();

// Use CORS middleware to allow requests from your frontend
app.use(
  cors({
    origin: "*", // You can also specify the React frontend origin like "http://localhost:5173"
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true, // Allow cookies to be sent
    allowedHeaders: ["Content-Type", "Authorization"], // Allow 'Authorization' header for JWT token
  })
);

// Your middleware to handle JSON data from frontend
app.use(express.json());

// Database connection
connectDB()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the app on database connection failure
  });

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", scanRoutes); // Your scan routes go here

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).send("Internal Server Error");
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
