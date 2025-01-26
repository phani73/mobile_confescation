const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  receiptNumber: { type: String, unique: true, required: true },
  rollNo: String,
  timestamp: String,
  date: String,
  name: String,
  phoneCompany: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Reference to User
});

const Scan = mongoose.model("Scan", scanSchema);

module.exports = Scan;
