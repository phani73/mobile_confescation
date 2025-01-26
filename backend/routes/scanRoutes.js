const express = require("express");
const router = express.Router();
const Scan = require("../models/scan");
const authMiddleware = require("../middleware/authMiddleware");

// Save a new scan (linked to the logged-in user)
router.post("/save-scan", authMiddleware, async (req, res) => {
  try {
    const { receiptNumber, rollNo, timestamp, date, name, phoneCompany } =
      req.body;

    if (!receiptNumber || !rollNo || !timestamp || !date || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newScan = new Scan({
      receiptNumber,
      rollNo,
      timestamp,
      date,
      name,
      phoneCompany,
      user: req.user.id,
    });

    await newScan.save();
    res.status(201).json({ message: "Scan data saved successfully!" });
  } catch (error) {
    console.error("Error saving scan data:", error.message);
    res.status(500).json({ error: error.message }); // Provide specific error
  }
});

// Get scans for the logged-in user
router.get("/get-scans", authMiddleware, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // Debug user data

    const scans = await Scan.find({ user: req.user.id }); // Fetch scans for this user
    res.status(200).json(scans);
  } catch (error) {
    console.error("Error fetching scan data:", error);
    res.status(500).json({ error: "Failed to fetch scan data" });
  }
});

// Delete a scan by receiptNumber (only for the logged-in user)
router.delete("/delete-scan/:receiptNo", authMiddleware, async (req, res) => {
  const { receiptNo } = req.params;

  try {
    console.log("Authenticated user:", req.user); // Debug user data

    const result = await Scan.findOneAndDelete({
      receiptNumber: receiptNo,
      user: req.user.id, // Ensure the scan belongs to the logged-in user
    });

    if (!result) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting scan data:", error);
    res.status(500).json({ error: "Failed to delete scan data" });
  }
});

module.exports = router;
