// backend/src/models/Email.js
import mongoose from "mongoose";

/**
 * Email schema aligned to hybrid PQC + AES design:
 *
 * - sender: ObjectId reference for routing (server-visible, OK)
 * - recipients: array of recipient email addresses (routing)
 * - subjectHash: optional SHA256(subject) if you need indexing without revealing subject.
 * - subjectEncrypted: optional encrypted subject blob (base64) if you want subject confidentiality
 * - ciphertext: base64 of AES-GCM (iv + ct + tag) for the message body (opaque to server)
 * - wrappedKeys: map/object where keys are recipient emails (or recipient ids) and values are
 *       the recipient-specific data required to unwrap the AES session key:
 *       { "<recipient>": { kyber_ct: "<base64>", wrappedKey: "<base64 iv+ct+tag>" }, ... }
 * - attachments: array of attachment metadata (encrypted blobs stored in S3 or DB; client handles encryption)
 *
 * Important: server does NOT store recipient private keys or cleartext content.
 */

const emailSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: String, required: true }], // email addresses or user identifiers
    // Subject: optional encrypted subject or a hash for server-side indexing without plaintext exposure
    subjectHash: { type: String, default: null }, // e.g. SHA256 hex or base64 of subject
    subjectEncrypted: { type: String, default: null }, // base64 encrypted subject (optional)
    // The message ciphertext (AES-GCM) as base64 of iv + ciphertext + tag
    ciphertext: { type: String, required: true },
    // wrappedKeys: object mapping recipient identifier -> { kyber_ct: base64, wrappedKey: base64 }
    wrappedKeys: {
      type: Map,
      of: new mongoose.Schema(
        {
          kyber_ct: { type: String, required: true },
          wrappedKey: { type: String, required: true },
        },
        { _id: false }
      ),
      required: true,
    },
    // attachments metadata (encrypted client-side). Each attachment entry should include storage pointer and metadata.
    attachments: [
      {
        filename: { type: String },
        size: { type: Number },
        mimeType: { type: String },
        storageUrl: { type: String }, // pointer to S3/GCS etc (blob is encrypted client-side)
        meta: { type: Object, default: {} },
      },
    ],
  },
  { timestamps: true }
);

// Create index if you want recipient-based quick lookup
emailSchema.index({ recipients: 1, createdAt: -1 });

const Email = mongoose.model("Email", emailSchema);
export default Email;
