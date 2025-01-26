const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for token generation
const User = require("../models/user"); 
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





module.exports = router;
