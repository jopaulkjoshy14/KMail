const mongoose = require('mongoose');
const MailSchema = new mongoose.Schema({
  cipher: { type: Buffer, required: true }, // Encrypted message
  capsule: { type: Buffer, required: true }, // Kyber ciphertext
  to: { type: String, required: true }, // Recipient username
  signature: { type: Buffer, required: true } // Dilithium signature of ciphertext
  // Do NOT store sender or timestamp to minimize metadata
});
module.exports = mongoose.model('Mail', MailSchema);
