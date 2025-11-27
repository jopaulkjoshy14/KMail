import mongoose from 'mongoose';


const UserSchema = new mongoose.Schema({
email: { type: String, required: true, unique: true, index: true },
password_hash: { type: String, required: true },
name: { type: String, required: true },


kyber_public_key: { type: Buffer },
kyber_private_key: { type: Buffer },
dilithium_public_key: { type: Buffer },
dilithium_private_key: { type: Buffer },


key_rotated_at: { type: Date },
created_at: { type: Date, default: Date.now },
updated_at: { type: Date, default: Date.now },
});


export const User = mongoose.model('User', UserSchema);
