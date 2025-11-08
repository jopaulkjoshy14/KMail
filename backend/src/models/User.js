const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },             // bcrypt hash
  kyberPublicKey: { type: Buffer, required: true },
  dilithiumPublicKey: { type: Buffer, required: true }
});
module.exports = mongoose.model('User', UserSchema);
