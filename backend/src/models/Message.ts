import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Types.ObjectId, ref: "User" },
  recipient_id: { type: mongoose.Types.ObjectId, ref: "User" },

  subject: String,

  encrypted_content: Buffer,
  encryption_nonce: Buffer,
  encryption_auth_tag: Buffer,

  ephemeral_public_key: Buffer,
  kyber_ciphertext: Buffer,
  signature: Buffer,

  is_read: { type: Boolean, default: false },
  read_at: Date,

  created_at: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);
