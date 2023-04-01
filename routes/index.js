const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model");
const middleware = require("../middleware");
const generateToken = require("../utils");

const router = express.Router();

// Create user
router.post("/user", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ email, password: hashedPassword });

    // Save user to database
    await newUser.save();

    return res.json({ message: "User created" });
  }

  res.status(404).json({ message: "User already exists" });
});

// Authenticate user
router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Compare password hashes
  const isMatch = await bcrypt.compare(password, user.password);

  // If passwords don't match, return error
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  // Generate JWT and return it
  const token = generateToken(user);

  res.json({ token });
});

// Example API call that requires authentication
router.get("/data", middleware.verifyToken, async (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}! This is protected data.` });
});

// Send password reset email
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate password reset token
  const token = Math.random().toString(36).slice(-8);
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  // Save user to database
  await user.save();

  // Create email transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tamilskillhub@gmail.com",
      pass: "jyzzrwntlyqzcikp",
    },
  });

  // Create email message
  const message = {
    from: "tamilskillhub@gmail.com",
    to: email,
    subject: "Password Reset Request",
    text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n Please use the following token to reset your password: ${token}\n\n If you did not request a password reset, please ignore this email.`,
  };

  // Send email
  transporter.sendMail(message, (error, info) => {
    if (error) {
      res.json({ message: "Something went wrong. Try again" });
      console.log(error.message);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res.json({ message: "Password reset email sent" });
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find user by token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // If user not found or token expired, return error
  if (!user) {
    return res.status(404).json({ message: "Invalid token" });
  }

  // Hash new password and update user
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: "Password reset successful" });
});

module.exports = router;
