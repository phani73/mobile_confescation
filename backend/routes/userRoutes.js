const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/user");

const router = express.Router();

// Route to get user profile data
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // Fetch data associated with the logged-in user using the userId from the token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
