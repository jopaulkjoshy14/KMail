import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/kmail',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  crypto: {
    algorithm: process.env.CRYPTO_ALGORITHM || 'kyber1024',
    symmetricAlgorithm: 'aes-256-gcm',
    keyDerivation: {
      algorithm: 'argon2id',
      timeCost: 3,
      memoryCost: 65536,
      parallelism: 4,
    },
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

// Validate required environment variables
if (!process.env.JWT_SECRET && config.nodeEnv === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

if (!process.env.DATABASE_URL && config.nodeEnv === 'production') {
  throw new Error('DATABASE_URL environment variable is required in production');
}
