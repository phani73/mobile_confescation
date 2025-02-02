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


// Delete a scan by receiptNumber (only for the logged-in user)
// Mark scan as returned
router.put("/return-scan/:receiptNo", authMiddleware, async (req, res) => {
  const { receiptNo } = req.params;
  console.log("Received receiptNo:", receiptNo); // Check the parameter

  console.log("req.user:", req.user); // Check user data

  try {
    const scan = await Scan.findOneAndUpdate(
      { receiptNumber: receiptNo, user: req.user.id },
      { status: "Returned" },
      { new: true }
    );

    console.log("Scan after update attempt:", scan); // Check the result of the query

    if (!scan) {
      console.log(
        `Scan with receiptNo ${receiptNo} not found or user doesn't have permission.`
      );
      return res.status(404).json({ message: "Record not found" });
    }

    // ... rest of your code
  } catch (error) {
    console.error("Error returning scan data:", error); // Keep the detailed error
    res.status(500).json({ error: error.message }); // Send the error message
  }
});

// Fetch history (only "Returned" scans)
router.get("/history", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching history for the authenticated user:", req.user);

    const returnedScans = await Scan.find({
      user: req.user.id,
      status: "Returned", // Only return scans with the "Returned" status
    });

    console.log("Fetched returned scans history:", returnedScans);
    res.status(200).json(returnedScans);
  } catch (error) {
    console.error("Error fetching history data:", error);
    res.status(500).json({ error: "Failed to fetch history data" });
  }
});

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
// Get scan counts for the logged-in user
router.get("/scan-counts", authMiddleware, async (req, res) => {
  try {
    // Count the scans with "Pending" status
    const pendingCount = await Scan.countDocuments({
      user: req.user.id,
      status: "Pending",
    });

    // Count the scans with "Returned" status
    const returnedCount = await Scan.countDocuments({
      user: req.user.id,
      status: "Returned",
    });

    // Send back the counts
    res.status(200).json({
      pendingCount,
      returnedCount,
    });
  } catch (error) {
    console.error("Error fetching scan counts:", error);
    res.status(500).json({ error: "Failed to fetch scan counts" });
  }
});



module.exports = router;
