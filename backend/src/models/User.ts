import { db } from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  kyber_public_key: Buffer;
  kyber_private_key: Buffer;
  dilithium_public_key: Buffer;
  dilithium_private_key: Buffer;
  key_rotated_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  email: string;
  password_hash: string;
  name: string;
  kyber_public_key: Buffer;
  kyber_private_key: Buffer;
  dilithium_public_key: Buffer;
  dilithium_private_key: Buffer;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  key_rotated_at: Date;
  created_at: Date;
}

export class UserModel {
  static async create(userData: UserCreate): Promise<User> {
    const [user] = await db('users')
      .insert({
        ...userData,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where({ email }).first();
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const user = await db('users').where({ id }).first();
    return user || null;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const [user] = await db('users')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');
    
    return user || null;
  }

  static async search(query: string, excludeUserId?: string): Promise<UserPublic[]> {
    let builder = db('users')
      .where(function() {
        this.where('email', 'ilike', `%${query}%`)
          .orWhere('name', 'ilike', `%${query}%`);
      })
      .select('id', 'email', 'name', 'key_rotated_at', 'created_at');

    if (excludeUserId) {
      builder = builder.andWhereNot('id', excludeUserId);
    }

    return builder.limit(10);
  }

  static async getPublicKeyData(email: string): Promise<{ 
    kyber_public_key: Buffer; 
    dilithium_public_key: Buffer;
    name: string;
  } | null> {
    const user = await db('users')
      .where({ email })
      .select('kyber_public_key', 'dilithium_public_key', 'name')
      .first();
    
    return user || null;
  }

  static async updateKeys(
    userId: string, 
    keys: {
      kyber_public_key: Buffer;
      kyber_private_key: Buffer;
      dilithium_public_key: Buffer;
      dilithium_private_key: Buffer;
    }
  ): Promise<void> {
    await db('users')
      .where({ id: userId })
      .update({
        ...keys,
        key_rotated_at: new Date(),
        updated_at: new Date(),
      });
  }
}
