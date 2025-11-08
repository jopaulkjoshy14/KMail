const { Kyber768 } = require('crystals-kyber-js');
const DilithiumPromise = require('dilithium-crystals-js'); // async for WASM

let dilithium;
DilithiumPromise.then((d) => { dilithium = d; });

async function generatePQKeys() {
  const kyber = new Kyber768();
  const [kyberPublicKey, kyberPrivateKey] = await kyber.generateKeyPair();
  const kind = 3; // Dilithium3/ML-DSA-76
  const { publicKey: dilithiumPublicKey, privateKey: dilithiumPrivateKey } = dilithium.generateKeys(kind);

  return {
    kyberPublicKey,
    kyberPrivateKey,
    dilithiumPublicKey,
    dilithiumPrivateKey
  };
}

// Kyber KEM encap and decap
async function encapsulateKyber(publicKey) {
  const kyber = new Kyber768();
  return await kyber.encap(publicKey); // returns [ciphertext, sharedSecret]
}
async function decapsulateKyber(ciphertext, privateKey) {
  const kyber = new Kyber768();
  return await kyber.decap(ciphertext, privateKey); // returns sharedSecret
}

// Dilithium sign/verify
function signDilithium(msg, privateKey) {
  const kind = 3;
  const message = Buffer.isBuffer(msg) ? msg : Buffer.from(msg);
  return dilithium.sign(message, privateKey, kind).signature;
}

function verifyDilithium(msg, signature, publicKey) {
  const kind = 3;
  const message = Buffer.isBuffer(msg) ? msg : Buffer.from(msg);
  return dilithium.verify(signature, message, publicKey, kind).result === 0;
}

module.exports = {
  generatePQKeys,
  encapsulateKyber,
  decapsulateKyber,
  signDilithium,
  verifyDilithium
};
