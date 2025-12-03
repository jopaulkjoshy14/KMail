# KMail

**Post-Quantum Secure End-to-End Encrypted Email Web App**  
AES-256 for content encryption · CRYSTALS-Kyber for key exchange · Server stores only encrypted blobs

---

## 🔒 Overview

KMail is a next-generation email system designed with **end-to-end encryption** and **post-quantum cryptography** at its core.  
Unlike traditional email, KMail ensures that **servers never see your plaintext data**. All encryption, decryption, and optional scanning happen **client-side**.

---

## ✨ Features

- **Email Content Encryption**  
  - AES-256 (symmetric) for message bodies and attachments  
  - Encrypted at sender, decrypted at recipient  

- **Key Distribution**  
  - CRYSTALS-Kyber (PQ KEM) for secure AES session key exchange  
  - Post-quantum safe against future attacks  

- **Private Key Storage**  
  - Encrypted locally (OS key store, TPM, or passphrase)  
  - Optional encrypted key backups  

- **Server Role**  
  - Stores only encrypted blobs + metadata  
  - Cannot decrypt messages  

- **Client-Side Processing**  
  - Decryption, malware scanning, and local search indexing  
  - User retains full control  

- **Transport Security**  
  - TLS with hybrid PQ KEM for safe transit  

---
## 🏗 RepositoryStructure
kmail/
├── backend/           # Node.js Express server
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── utils/crypto/
│   ├── package.json
│   └── Dockerfile
├── frontend/          # React + TS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/crypto/
│   ├── package.json
│   └── vite.config.ts
├── docs/              # Documentation
├── scripts/           # Deployment scripts
└── README.md
---

## 🚀 Getting Started
