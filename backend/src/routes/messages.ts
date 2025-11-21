import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { db } from '../config/database';
import { QuantumCrypto } from '../crypto/quantumCrypto';

const router = Router();

// Send encrypted message
router.post('/send', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { recipientEmail, subject, message, signature } = req.body;
    const senderId = req.user!.id;

    if (!recipientEmail || !message) {
      throw createError('Recipient email and message are required', 400);
    }

    // Find recipient
    const recipient = await db('users')
      .where({ email: recipientEmail })
      .select('id', 'kyber_public_key', 'dilithium_public_key')
      .first();

    if (!recipient) {
      throw createError('Recipient not found', 404);
    }

    // Get sender's keys for signing
    const sender = await db('users')
      .where({ id: senderId })
      .select('dilithium_private_key')
      .first();

    // Create message data
    const messageData = {
      subject: subject || '',
      body: message,
      timestamp: new Date().toISOString(),
    };

    const messageBuffer = Buffer.from(JSON.stringify(messageData));

    // Sign the message
    const messageSignature = await QuantumCrypto.sign(
      messageBuffer,
      sender.dilithium_private_key
    );

    // Generate ephemeral key pair for this message
    const ephemeralKeyPair = await QuantumCrypto.generateKyberKeyPair();

    // Encapsulate shared secret with recipient's public key
    const encapsulation = await QuantumCrypto.encapsulate(
      recipient.kyber_public_key
    );

    // Encrypt the message
    const encryptedMessage = QuantumCrypto.encryptMessage(
      messageBuffer,
      encapsulation.sharedSecret
    );

    // Store the encrypted message
    const [savedMessage] = await db('messages').insert({
      sender_id: senderId,
      recipient_id: recipient.id,
      subject,
      encrypted_content: encryptedMessage.ciphertext,
      encryption_nonce: encryptedMessage.nonce,
      encryption_auth_tag: encryptedMessage.authTag,
      ephemeral_public_key: ephemeralKeyPair.publicKey,
      kyber_ciphertext: encapsulation.ciphertext,
      signature: messageSignature,
      created_at: new Date(),
    }).returning('*');

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: savedMessage.id,
    });
  } catch (error) {
    next(error);
  }
});

// Get inbox messages
router.get('/inbox', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const messages = await db('messages')
      .join('users as sender', 'messages.sender_id', 'sender.id')
      .where({ recipient_id: userId })
      .select(
        'messages.id',
        'messages.subject',
        'sender.name as sender_name',
        'sender.email as sender_email',
        'messages.created_at',
        'messages.is_read'
      )
      .orderBy('messages.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('messages')
      .where({ recipient_id: userId })
      .count('* as count')
      .first();

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: parseInt(total?.count as string) || 0,
        pages: Math.ceil((parseInt(total?.count as string) || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get sent messages
router.get('/sent', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const messages = await db('messages')
      .join('users as recipient', 'messages.recipient_id', 'recipient.id')
      .where({ sender_id: userId })
      .select(
        'messages.id',
        'messages.subject',
        'recipient.name as recipient_name',
        'recipient.email as recipient_email',
        'messages.created_at'
      )
      .orderBy('messages.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('messages')
      .where({ sender_id: userId })
      .count('* as count')
      .first();

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: parseInt(total?.count as string) || 0,
        pages: Math.ceil((parseInt(total?.count as string) || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get specific message
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user!.id;

    const message = await db('messages')
      .join('users as sender', 'messages.sender_id', 'sender.id')
      .join('users as recipient', 'messages.recipient_id', 'recipient.id')
      .where({
        'messages.id': messageId,
        'messages.recipient_id': userId,
      })
      .select(
        'messages.*',
        'sender.name as sender_name',
        'sender.email as sender_email',
        'sender.dilithium_public_key as sender_public_key',
        'recipient.name as recipient_name',
        'recipient.email as recipient_email'
      )
      .first();

    if (!message) {
      throw createError('Message not found', 404);
    }

    // Get recipient's private key for decryption
    const recipient = await db('users')
      .where({ id: userId })
      .select('kyber_private_key')
      .first();

    // Decapsulate shared secret
    const sharedSecret = await QuantumCrypto.decapsulate(
      message.kyber_ciphertext,
      recipient.kyber_private_key
    );

    // Decrypt the message
    const encryptedData = {
      ciphertext: message.encrypted_content,
      nonce: message.encryption_nonce,
      authTag: message.encryption_auth_tag,
    };

    const decryptedBuffer = QuantumCrypto.decryptMessage(
      encryptedData,
      sharedSecret
    );

    const messageData = JSON.parse(decryptedBuffer.toString());

    // Verify signature
    const isValidSignature = await QuantumCrypto.verify(
      message.signature,
      decryptedBuffer,
      message.sender_public_key
    );

    // Mark as read
    if (!message.is_read) {
      await db('messages')
        .where({ id: messageId })
        .update({ is_read: true, read_at: new Date() });
    }

    res.json({
      message: {
        id: message.id,
        subject: message.subject,
        body: messageData.body,
        sender: {
          name: message.sender_name,
          email: message.sender_email,
        },
        recipient: {
          name: message.recipient_name,
          email: message.recipient_email,
        },
        timestamp: message.created_at,
        signatureValid: isValidSignature,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user!.id;

    const result = await db('messages')
      .where({
        id: messageId,
        recipient_id: userId,
      })
      .del();

    if (result === 0) {
      throw createError('Message not found', 404);
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
