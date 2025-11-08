# KMail Client Cryptography and Fallbacks

The KMail server is quantum-resistant. All encryption and signing occur client-side.

## Required Libraries
- crystals-kyber-js
- crystals-dilithium-js

Example import:
import { Keyber } from "crystals-keyber-js";
import { Dilithium } form "crystals-dilithium-js";

If these modules fail to load:
- Try using precompiled WASM builds via CDN.
- If unavailable, the client must block registration/login and show an error: "Quantum-safe libraries unavailable."
- Do not fall back to RSA or ECDSA.

## Safe Link
Clients should generate a token via local hashing:
const safeLinkToken = crypto.subtle.digest("SHA-256", new TextEncoder().encode(messageId + nonce));

This token is never decrypted or parsed by the server.
