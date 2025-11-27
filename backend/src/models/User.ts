import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },

  kyber_public_key: Buffer,
  kyber_private_key: Buffer,
  dilithium_public_key: Buffer,
  dilithium_private_key: Buffer,

  key_rotated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);
