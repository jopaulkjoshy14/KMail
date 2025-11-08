import crypto from 'crypto';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyDilithiumSignature } from '../utils/signature.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverUsername, receiverUsernameHash, encryptedSubject, encryptedBody, attachmentIds, safeLinkToken, signature } = req.body;
    const senderUsername = req.user.username;

    const senderUsernameHash = crypto.createHash('sha256').update(senderUsername).digest('hex');
    const recvHash = receiverUsernameHash || crypto.createHash('sha256').update(receiverUsername).digest('hex');

    const sender = await User.findOne({ username: senderUsername });
    if (!sender) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Sender not found.' } });

    const messageBlob = JSON.stringify({ encryptedSubject, encryptedBody, attachmentIds });
    const isValid = await verifyDilithiumSignature(sender.dilithiumPublicKey, messageBlob, signature);

    if (!isValid)
      return res.status(400).json({ error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' } });

    await Message.create({
      senderUsernameHash,
      receiverUsernameHash: recvHash,
      encryptedSubject,
      encryptedBody,
      attachmentIds,
      safeLinkToken,
      signature,
    });

    res.status(200).json({ message: 'Message stored successfully (encrypted). Server never decrypts content.' });
  } catch (err) {
    next(err);
  }
};
