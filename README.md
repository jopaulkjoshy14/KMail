# KMail - Quantum-Resistant Mailing Platform

![KMail Logo](https://img.shields.io/badge/KMail-Quantum%20Resistant-blue)
![License](https://img.shields.io/badge/License-Apache%202.0-green)

A production-ready, quantum-resistant email platform built with post-quantum cryptography to secure your communications against future quantum computing threats.

## 🚀 Features

- **Quantum-Resistant Encryption**: Uses CRYSTALS-Kyber for key exchange and CRYSTALS-Dilithium for digital signatures
- **End-to-End Encryption**: All messages are encrypted before leaving your device
- **Forward Secrecy**: XMSS-based key rotation for enhanced security
- **Modern UI**: Clean, responsive React-based interface
- **Production Ready**: Built with scalability and security in mind

## 🛡️ Security Architecture

### Cryptography Stack
- **Key Exchange**: CRYSTALS-Kyber (NIST PQC Standard)
- **Digital Signatures**: CRYSTALS-Dilithium (NIST PQC Standard)
- **Hash-Based Signatures**: XMSS for forward secrecy
- **Symmetric Encryption**: AES-256-GCM
- **Key Derivation**: Argon2id

### Security Features
- Post-quantum secure session management
- Tamper-proof message integrity
- Secure key storage and management
- Rate limiting and DDoS protection
- Comprehensive audit logging

## 🏗️ Architecture

```

Client (React) ↔ API Gateway (Express) ↔ PostgreSQL Database
↕                    ↕
Quantum Crypto         Business Logic
↕                    ↕
Key Management        Audit Logging

```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for session storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kmail.git
   cd kmail
```

1. Install dependencies
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```
2. Set up environment variables
   ```bash
   # Backend .env
   cp backend/.env.example backend/.env
   
   # Frontend .env
   cp frontend/.env.example frontend/.env.local
   ```
3. Database setup
   ```bash
   # Run migrations
   cd backend && npx knex migrate:latest
   ```
4. Start the application
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

📚 API Documentation

Authentication Endpoints

· POST /api/auth/register - User registration
· POST /api/auth/login - User login
· POST /api/auth/logout - User logout
· GET /api/auth/me - Get current user

Message Endpoints

· POST /api/messages/send - Send encrypted message
· GET /api/messages/inbox - Get received messages
· GET /api/messages/sent - Get sent messages
· DELETE /api/messages/:id - Delete message

Key Management Endpoints

· POST /api/keys/generate - Generate new key pair
· GET /api/keys/public - Get user's public key
· POST /api/keys/rotate - Rotate keys

🔧 Configuration

Environment Variables

Backend (.env)

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/kmail
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
CRYPTO_ALGORITHM=kyber1024
```

Frontend (.env.local)

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001
```

🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Run specific services
docker-compose up backend frontend postgres


🌐 Render Deployment

KMail is configured for seamless deployment on Render.com:

1. Connect your GitHub repository to Render
2. Render will automatically detect the render.yaml file
3. Deploy with one click

🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests  
cd frontend && npm test

# Run security audit
npm run audit
```

🔒 Security Best Practices

· Use strong, unique passwords
· Regularly rotate encryption keys
· Enable 2FA when available
· Keep your client software updated
· Verify recipient keys before sending sensitive information

🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.

📄 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

🆘 Support

· 📧 Email: support@kmail.example.com
· 🐛 Issues: GitHub Issues
· 💬 Discussions: GitHub Discussions

🙏 Acknowledgments

· NIST for post-quantum cryptography standards
· The CRYSTALS team for Kyber and Dilithium implementations
· Open-source community for various dependencies

```

## 3. package.json (Root)

```json
{
  "name": "kmail",
  "version": "1.0.0",
  "description": "Quantum-Resistant Mailing Platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "start": "cd backend && npm start",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test",
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install"
  },
  "keywords": ["quantum", "cryptography", "email", "security"],
  "author": "KMail Team",
  "license": "Apache-2.0",
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```
