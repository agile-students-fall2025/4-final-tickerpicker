import { Router } from 'express';
import { USERS } from '../data/users.js';
import { verifyPassword, hashPassword } from '../auth/password.js';
import { signJWT } from '../auth/jwt.js';
import { requireAuth } from '../middleware/AuthRequirement.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// POST /api/auth/login
// body: { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = USERS.find(u => u.username === username);
  if (!user || !verifyPassword(password, user)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = signJWT(
    { sub: user.id, username: user.username, roles: user.roles || [] },
    JWT_SECRET,
    { expiresInSec: 2 * 60 * 60 } // 2h
  );

  return res.json({
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 7200,
    user: { id: user.id, username: user.username, roles: user.roles || [] },
  });
});

// POST /api/auth/register (temporarily for development, will change after connecting to db)
// body: { username, password }
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  if (USERS.find(u => u.username === username)) {
    return res.status(409).json({ error: 'username already exists' });
  }
  const { salt, hash, iterations, keylen, digest } = hashPassword(password);
  const newUser = { id: 'u' + (USERS.length + 1), username, roles: ['user'], salt, hash, iterations, keylen, digest };
  USERS.push(newUser);

  return res.status(201).json({ message: 'registered', user: { id: newUser.id, username } });
});

router.put('/email', requireAuth, (req, res) => {
  const { newEmail } = req.body || {};
  const userId = req.user?.sub;

  if (!newEmail || typeof newEmail !== 'string') {
    return res.status(400).json({ error: 'newEmail is required' });
  }

  const me = USERS.find(u => u.id === userId);
  if (!me) return res.status(404).json({ error: 'User not found' });

  const exists = USERS.find(u => u.username === newEmail && u.id !== userId);
  if (exists) return res.status(409).json({ error: 'Email/username already in use' });
  me.username = newEmail.trim();

  const accessToken = signJWT(
    { sub: me.id, username: me.username, roles: me.roles || [] },
    JWT_SECRET,
    { expiresInSec: 2 * 60 * 60 }
  );

  return res.json({
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 7200,
    user: { id: me.id, username: me.username, roles: me.roles || [] },
  });
});

router.put('/password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  const userId = req.user?.sub;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'oldPassword and newPassword are required' });
  }
  if (oldPassword === newPassword) {
    return res.status(400).json({ error: 'New password cannot be the old password' });
  }

  const me = USERS.find(u => u.id === userId);
  if (!me) return res.status(404).json({ error: 'User not found' });

  if (!verifyPassword(oldPassword, me)) {
    return res.status(401).json({ error: 'Old password incorrect' });
  }

  const { salt, hash, iterations, keylen, digest } = hashPassword(newPassword);
  me.salt = salt;
  me.hash = hash;
  me.iterations = iterations;
  me.keylen = keylen;
  me.digest = digest;

  const accessToken = signJWT(
    { sub: me.id, username: me.username, roles: me.roles || [] },
    JWT_SECRET,
    { expiresInSec: 2 * 60 * 60 }
  );

  return res.json({
    message: 'Password updated',
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 7200,
    user: { id: me.id, username: me.username, roles: me.roles || [] },
  });
});

export default router;