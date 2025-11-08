# KMail Frontend
KMail is a post-quantum, end-to-end encrypted email platform. This frontend is built with React 18 + Vite and Tailwind CSS.

## Features
- Quantum-safe client-side encryption (Kyber + Dilithium)
- IndexedDB storage for encrypted keys
- JWT authentication via backend
- Dark/light theme
- Offline-safe drafts
- Responsive UI

## Setup
npm install
cp .env.example .env
npm run dev

Update `.env` with your backend Render URL.

## Build & Deploy
npm run build
Deploy `dist/` on Render as a static site. Point API base URL to your backend Render service.

## Folder Structure
src/
- components: reusable UI
- pages: views (Login, Register, Inbox, Compose, Profile)
- utils: crypto + axios
- context: Auth & Theme
- hooks: custom utilities

## Security Notes
- All encryption/decryption happens locally.
- Server never sees plaintext messages.
- Private keys are encrypted in IndexedDB, protected by password-derived AES-GCM.
- If post-quantum libraries fail, automatic WebCrypto fallback ensures safe but downgraded security (AES + RSA temporarily).
