import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, generateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { db } from '../config/database';
import { QuantumCrypto } from '../crypto/quantumCrypto';

const router = Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw createError('Email, password, and name are required', 400);
    }

    if (password.length < 8) {
      throw createError('Password must be at least 8 characters long', 400);
    }

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate quantum-resistant key pairs
    const [kyberKeyPair, dilithiumKeyPair] = await Promise.all([
      QuantumCrypto.generateKyberKeyPair(),
      QuantumCrypto.generateDilithiumKeyPair(),
    ]);

    // Create user in database
    const [user] = await db('users').insert({
      email,
      password_hash: hashedPassword,
      name,
      kyber_public_key: kyberKeyPair.publicKey,
      kyber_private_key: kyberKeyPair.privateKey,
      dilithium_public_key: dilithiumKeyPair.publicKey,
      dilithium_private_key: dilithiumKeyPair.privateKey,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning(['id', 'email', 'name']);

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Find user
    const user = await db('users')
      .where({ email })
      .select('id', 'email', 'name', 'password_hash')
      .first();

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user!.id })
      .select('id', 'email', 'name', 'created_at')
      .first();

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

export default router;
