const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for token generation
const User = require("../models/user"); 
const authMiddleware = require("../middleware/authMiddleware");
// Adjust the path if needed
const router = express.Router();

const JWT_SECRET = "phani123"; // Change this to a secure secret key

// Login Route
router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  console.log("Received login data:", { name, password });

  try {
    // Query the 'Users' collection using the 'User' model
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // If credentials match, create a JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });


      return res.status(200).json({
        message: "Login Successful!",
        token,
        user: { name: user.name, id: user._id }, // Send user data as a response
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

router.post("/reset-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }


    // Get user ID from middleware
    const userId = req.user.id;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});




module.exports = router;
