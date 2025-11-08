import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  hash: String,
  createdAt: Date,
  lastUsed: Date,
  ip: String,
  userAgent: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  usernameHash: { type: String, index: true },
  passwordHash: { type: String, required: true },
  kyberPublicKey: { type: String, required: true },
  dilithiumPublicKey: { type: String, required: true },
  refreshTokens: [refreshTokenSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
