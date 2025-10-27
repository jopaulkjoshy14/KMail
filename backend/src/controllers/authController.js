import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import mongoose from "mongoose";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5m" });
};

// Register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Update Profile (requires current password to change password)
export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { name, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: "Current password required" });

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ message: "Current password is incorrect" });

      user.password = newPassword; // pre-save hook will hash it
    }

    user.name = name || user.name;
    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Admin clear DB
export const adminClearDatabase = async (req, res) => {
  try {
    const { adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_CLEAR_KEY)
      return res.status(403).json({ message: "Unauthorized: Invalid admin key" });

    await mongoose.connection.dropDatabase();
    res.json({ message: "✅ Entire database cleared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear entire database" });
  }
};
