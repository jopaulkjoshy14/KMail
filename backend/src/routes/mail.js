const express = require('express');
const router = express.Router();
const Mail = require('../models/Mail');
const { verifyDilithium } = require('../utils/crypto');

router.post('/send', async (req, res) => {
  // Data: { to, cipher, capsule, signature, publicKey }
  const { to, cipher, capsule, signature, publicKey } = req.body;
  if (!verifyDilithium(cipher, signature, publicKey)) {
    return res.status(400).json({ error: 'Signature invalid' });
  }
  await Mail.create({ cipher: Buffer.from(cipher, 'base64'), capsule: Buffer.from(capsule, 'base64'), to, signature: Buffer.from(signature, 'base64') });
  res.json({ success: true });
});

router.get('/inbox/:user', async (req, res) => {
  const mails = await Mail.find({ to: req.params.user });
  res.json(mails.map(m => ({
    cipher: m.cipher.toString('base64'),
    capsule: m.capsule.toString('base64'),
    signature: m.signature.toString('base64')
  })));
});

module.exports = router;
