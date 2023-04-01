const mongoose = require('mongoose')

// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Define user model
const User = mongoose.model("User", userSchema);

module.exports = User;
