import { Request, Response, NextFunction } from 'express';
try {
const { recipientEmail, subject, message } = req.body;
const senderId = (req as any).user?.id;
if (!recipientEmail || !message) throw createError('Recipient and message required', 400);
const recipient = await User.findOne({ email: recipientEmail }).select('kyber_public_key');
if (!recipient) throw createError('Recipient not found', 404);
const sender = await User.findById(senderId).select('dilithium_private_key email name');


const messageBuffer = Buffer.from(JSON.stringify({ subject: subject || '', body: message, sender: { email: sender?.email, name: sender?.name }, timestamp: new Date().toISOString() }));


const signature = await QuantumCrypto.sign(messageBuffer, sender?.dilithium_private_key as any);
const ephemeral = await QuantumCrypto.generateKyberKeyPair();
const encapsulation = await QuantumCrypto.encapsulate(recipient.kyber_public_key as any);
const encrypted = QuantumCrypto.encryptMessage(messageBuffer, encapsulation.sharedSecret);


const saved = await Message.create({
sender_id: senderId,
recipient_id: recipient._id,
subject: subject || '',
encrypted_content: Buffer.from(encrypted.ciphertext),
encryption_nonce: Buffer.from(encrypted.nonce || ''),
encryption_auth_tag: Buffer.from(encrypted.authTag || ''),
ephemeral_public_key: Buffer.from(ephemeral.publicKey || ''),
kyber_ciphertext: Buffer.from(encapsulation.ciphertext || ''),
signature: Buffer.from(signature || ''),
created_at: new Date()
});


await AuditLog.create({ user_id: senderId, action: 'SEND_MESSAGE', resource_type: 'message', resource_id: saved._id.toString(), details: { recipient: recipientEmail, subject_length: subject?.length || 0, message_length: message.length } });


res.status(201).json({ message: 'Message sent', messageId: saved._id });
} catch (err) {
next(err);
}
}


static async getInbox(req: Request, res: Response, next: NextFunction) {
try {
const userId = (req as any).user?.id;
const page = Math.max(1, parseInt(req.query.page as any) || 1);
const limit = Math.min(50, parseInt(req.query.limit as any) || 20);
const messages = await Message.find({ recipient_id: userId }).populate('sender_id', 'name email').sort({ created_at: -1 }).skip((page-1)*limit).limit(limit).lean();
res.json({ messages });
} catch (err) { next(err); }
}


static async deleteMessage(req: Request, res: Response, next: NextFunction) {
try {
const messageId = req.params.id;
const userId = (req as any).user?.id;
const message = await Message.findOne({ _id: messageId, recipient_id: userId });
if (!message) throw createError('Message not found', 404);
await Message.deleteOne({ _id: messageId });
await AuditLog.create({ user_id: userId, action: 'DELETE_MESSAGE', resource_type: 'message', resource_id: messageId });
res.json({ message: 'Message deleted' });
} catch (err) { next(err); }
}
}
