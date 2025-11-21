export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  key_rotated_at?: string;
}

export interface Message {
  id: string;
  subject: string;
  body: string;
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  timestamp: string;
  read: boolean;
  read_at?: string;
  signatureValid: boolean;
}

export interface MessageListItem {
  id: string;
  subject: string;
  sender_name?: string;
  sender_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  created_at: string;
  is_read?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MessagesResponse {
  messages: MessageListItem[];
  pagination: Pagination;
}

export interface PublicKeyInfo {
  kyberPublicKey: string;
  dilithiumPublicKey: string;
  name: string;
  keyRotatedAt?: string;
}

export interface KeyHistory {
  rotated_at: string;
  algorithm: string;
}

export interface KeyInfo {
  keyRotationDate: string;
  accountCreationDate: string;
  algorithms: string[];
  keySizes: {
    kyber: number;
    dilithium: number;
  };
}

export interface UserStats {
  inbox: number;
  unread: number;
  sent: number;
}

export interface AuditLog {
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  created_at: string;
}

export interface ApiError {
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
    stack?: string;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface ComposeForm {
  recipientEmail: string;
  subject: string;
  message: string;
}

export interface ProfileForm {
  name: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Crypto types
export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  authTag: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'KEY_ROTATION' | 'ERROR';
  payload: any;
  timestamp: string;
}
