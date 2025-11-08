# KMail Backend - Quantum-Resistant Mail Server

## Overview
This backend powers KMail — an end-to-end encrypted, post-quantum-secure mail platform.

### Privacy Philosophy
- The server never decrypts.
- It stores only encrypted blobs and hashes.
- All cryptography (Kyber/Dilithium) runs client-side.
- Server only verifies signatures using sender public keys.

## Setup
1. Clone the repo.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_ORIGIN`.

Install and run:
npm install
npm run dev

Deploy on Render:
- Set environment variables via the Render dashboard.
- Ensure network access to MongoDB Atlas.
