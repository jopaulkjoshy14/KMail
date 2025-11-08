import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const authJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'Authentication required' } });

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ error: { code: 'INVALID_TOKEN', message: 'Token invalid or expired' } });
    req.user = decoded;
    next();
  });
};
