import mongoose from 'mongoose';


const MessageSchema = new mongoose.Schema({
sender_id: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
recipient_id: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
subject: { type: String },
encrypted_content: { type: Buffer, required: true },
encryption_nonce: { type: Buffer },
encryption_auth_tag: { type: Buffer },
ephemeral_public_key: { type: Buffer },
kyber_ciphertext: { type: Buffer },
signature: { type: Buffer },
is_read: { type: Boolean, default: false },
read_at: { type: Date },
created_at: { type: Date, default: Date.now }
});


export const Message = mongoose.model('Message', MessageSchema);
