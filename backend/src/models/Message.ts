import { db } from '../config/database';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  encrypted_content: Buffer;
  encryption_nonce: Buffer;
  encryption_auth_tag: Buffer;
  ephemeral_public_key: Buffer;
  kyber_ciphertext: Buffer;
  signature: Buffer;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

export interface MessageCreate {
  sender_id: string;
  recipient_id: string;
  subject: string;
  encrypted_content: Buffer;
  encryption_nonce: Buffer;
  encryption_auth_tag: Buffer;
  ephemeral_public_key: Buffer;
  kyber_ciphertext: Buffer;
  signature: Buffer;
}

export interface MessageListItem {
  id: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;
  created_at: Date;
  is_read: boolean;
}

export class MessageModel {
  static async create(messageData: MessageCreate): Promise<Message> {
    const [message] = await db('messages')
      .insert({
        ...messageData,
        created_at: new Date(),
      })
      .returning('*');
    
    return message;
  }

  static async findById(id: string): Promise<Message | null> {
    const message = await db('messages').where({ id }).first();
    return message || null;
  }

  static async findByRecipient(
    recipientId: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<{ messages: MessageListItem[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const messages = await db('messages')
      .join('users as sender', 'messages.sender_id', 'sender.id')
      .where({ recipient_id: recipientId })
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

    const totalResult = await db('messages')
      .where({ recipient_id: recipientId })
      .count('* as count')
      .first();

    const total = parseInt(totalResult?.count as string) || 0;

    return { messages, total };
  }

  static async findBySender(
    senderId: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<{ messages: MessageListItem[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const messages = await db('messages')
      .join('users as recipient', 'messages.recipient_id', 'recipient.id')
      .where({ sender_id: senderId })
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

    const totalResult = await db('messages')
      .where({ sender_id: senderId })
      .count('* as count')
      .first();

    const total = parseInt(totalResult?.count as string) || 0;

    return { messages, total };
  }

  static async markAsRead(messageId: string): Promise<void> {
    await db('messages')
      .where({ id: messageId })
      .update({ 
        is_read: true, 
        read_at: new Date() 
      });
  }

  static async delete(messageId: string, recipientId: string): Promise<boolean> {
    const result = await db('messages')
      .where({ 
        id: messageId,
        recipient_id: recipientId 
      })
      .del();
    
    return result > 0;
  }

  static async getMessageWithSenderAndRecipient(messageId: string, recipientId: string) {
    return db('messages')
      .join('users as sender', 'messages.sender_id', 'sender.id')
      .join('users as recipient', 'messages.recipient_id', 'recipient.id')
      .where({
        'messages.id': messageId,
        'messages.recipient_id': recipientId,
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
  }

  static async getMessageStats(userId: string) {
    const [inboxCount, unreadCount, sentCount] = await Promise.all([
      db('messages').where({ recipient_id: userId }).count('* as count').first(),
      db('messages').where({ recipient_id: userId, is_read: false }).count('* as count').first(),
      db('messages').where({ sender_id: userId }).count('* as count').first(),
    ]);

    return {
      inbox: parseInt(inboxCount?.count as string) || 0,
      unread: parseInt(unreadCount?.count as string) || 0,
      sent: parseInt(sentCount?.count as string) || 0,
    };
  }
}
