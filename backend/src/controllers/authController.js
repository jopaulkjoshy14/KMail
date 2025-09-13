import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getGoogleUser } from "../utils/googleAuth.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    token: generateToken(user._id),
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    token: generateToken(user._id),
  });
};

// @desc    Google OAuth login
// @route   GET /api/auth/google/callback?code=...
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const code = req.query.code;
    const googleUser = await getGoogleUser(code);

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
      });
    }

    const token = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(
      `https://jopaulkjoshy14.github.io/KMail/?token=${token}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed" });
  }
};
