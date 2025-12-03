# KMail - Quantum-Resistant Secure Mail (Skeleton)

This repository is a production-oriented **skeleton** of KMail with:
- backend (Node + Express + TypeScript)
- frontend (React + Vite)
- shared PQC crypto interface (placeholder implementation)

## What this archive contains
- `backend/` - full Express TypeScript app with routes, models, and PQC interface
- `frontend/` - React + Vite app (basic UI)
- `shared/crypto/QuantumCrypto.ts` - interface + placeholder implementations and clear TODOs

## Important notes
- **This is NOT a drop-in full PQC implementation.** The QuantumCrypto module contains placeholders and MUST be replaced with a secure PQC library (e.g., liboqs, pqclean WASM builds) for production use.
- JWT_SECRET must be at least 64 bytes in production.
- Use HTTPS, set strict CSP and HSTS in your hosting layer.
- Encrypted private keys are stored in DB; ensure masterKey handling is secure (user-provided passphrase or KMS).

## Quick local run (development)
1. Backend:
   - `cd backend`
   - `npm install`
   - create `.env` based on `../.env.example`
   - `npm run dev`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - set `.env` from `.env.example`
   - `npm run dev`

## Deploy to Render
- Create two services: a Web Service (backend) and a Static Site (frontend).
- Use the `render.yaml` as a starting manifest.
- Ensure env vars (MONGO_URI, JWT_SECRET, FRONTEND_URL) are configured in Render dashboard.

## Deliverables included
- Code skeleton for backend, frontend, shared crypto
- .env.example
- render.yaml
- Basic instructions and notes about production hardening

If you'd like, I can now:
- Add working PQC using a WASM liboqs example (requires selecting a particular implementation).
- Expand frontend UI and key management flows.
- Add integration tests and CI pipeline.
