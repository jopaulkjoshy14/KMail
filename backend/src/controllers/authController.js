import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getGoogleTokens, getGoogleUser } from "../utils/googleOAuth.js"; // optional

// Generate JWT (change 5m → 7d for longer sessions)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5m" });
};

// ==================== REGISTER ====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists. Please log in instead.",
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// ==================== LOGIN ====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email. Please register first.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Try logging in with Google.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed. Please try again later." });
  }
};

// ==================== GOOGLE LOGIN ====================
export const googleLogin = async (req, res) => {
  try {
    const code = req.query.code;
    const { id_token, access_token } = await getGoogleTokens(code);
    const googleUser = await getGoogleUser(id_token, access_token);

    let user = await User.findOne({ email: googleUser.email });

    // Create user if not exists
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
      });
    }

    const token = generateToken(user._id);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}?token=${token}`);
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};
