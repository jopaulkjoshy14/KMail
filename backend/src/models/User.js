// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User schema
 *
 * - name, email, password: existing auth fields (password hashed)
 * - googleId, avatar: existing fields unchanged
 * - kyberPublicKey: Base64-encoded Kyber public key (client-generated and uploaded)
 *     (kept server-side so senders can encrypt message keys to recipients)
 * - kyberKeyId: optional fingerprint or key identifier for key rotation / display
 *
 * Important: Do NOT store Kyber private keys on the server. Private keys must remain client-only.
 */

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String, default: "https://ui-avatars.com/api/?name=User" },

    // Post-quantum Kyber public key for this user (base64). Nullable until user publishes a key.
    kyberPublicKey: { type: String, default: null },

    // Optional human-friendly key fingerprint/id for display/verification
    kyberKeyId: { type: String, default: null },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
