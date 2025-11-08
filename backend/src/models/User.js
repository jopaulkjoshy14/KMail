const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  kyberPublicKey: { type: Buffer, required: true },
  dilithiumPublicKey: { type: Buffer, required: true }
  // Store only public keys; keep private keys client-side
});
module.exports = mongoose.model('User', UserSchema);
