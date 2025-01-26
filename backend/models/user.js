const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    collection: "Users", // Change collection name to 'Users'
  }
);

module.exports = mongoose.model("User", userSchema);
