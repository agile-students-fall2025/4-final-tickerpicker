// From ecosystem
import { Router } from 'express';
import dotenv from "dotenv";
dotenv.config();
// From codebase
import { User } from '../data/users.js';
import { verifyPassword, hashPassword } from '../auth/password.js';
import { signJWT } from '../auth/jwt.js';
import { requireAuth } from '../middleware/AuthRequirement.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

//helper: normalize email adress
function norm(email) {
  return String(email || '').trim().toLowerCase();
}

// POST /api/auth/login
// body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  
  if (!email || !password ) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const normEmail = norm(email);
  
  if (!EMAIL_REGEX.test(normEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // verify 'user' and 'password'
  const user = await User.findOne({email: normEmail});
  // if 'user' with 'username' not in DB
  if (!user || !verifyPassword(password, user)) {
    return res.status(401).json({ error: 'Invalid email or password' });
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
    user: { id: user.id, username: user.username, email: user.email, roles: user.roles || [] },
  });
});

// POST /api/auth/register
// body: { username, password }
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body || {};
  const normEmail = norm(email);

  if (!normEmail || !username || !password) {
    return res.status(400).json({ error: 'email, username and password are required' });
  }

  if (!EMAIL_REGEX.test(normEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include a letter, a number, and a special character',
    });
  }

  // if 'username' already in DB
  if (await User.findOne({email: normEmail})) {
    return res.status(409).json({ error: 'email already exists' });
  }

  // register 'newUser' in DB
  const { salt, hash, iterations, keylen, digest } = hashPassword(password);
  const newUser = new User({
    id: 'u' + (await User.countDocuments() + 1),
    email: normEmail,
    username: username.trim(),
    password: password,
    // cryptographic password fields
    salt: salt, hash: hash, iterations: iterations, keylen: keylen, digest: digest,
    // end of cryptographic password fields
  });

  // save 'newUser' to DB
  await newUser.save();
  console.log('registered new user:', newUser.toJSON());//TEST
  
  return res.status(201).json({ message: 'registered', user: { id: newUser.id, username: newUser.username, email: newUser.email, roles: newUser.roles || [] } });
});

// PUT /api/auth/email
// body: { newEmail }
router.put('/email', requireAuth, async (req, res) => {
  const { newEmail } = req.body || {};
  const userId = req.user?.sub;

  // find 'me' in DB
  const me = await User.findOne({id: userId});
  if (!me) return res.status(404).json({ error: 'User not found' });
  
  // verify argument
  if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ error: 'newEmail is required' });
  }
  
  const normNewEmail = norm(newEmail);
  
  if (!EMAIL_REGEX.test(normNewEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (me.email === normNewEmail) {
    return res.status(409).json({ error: 'Email/username already in use' });
  }
  
  // update 'me' email/username in DB
  me.email = normNewEmail.trim();
  await me.save();

  const accessToken = signJWT(
    { sub: me.id, username: me.username, roles: me.roles || [] },
    JWT_SECRET,
    { expiresInSec: 2 * 60 * 60 }
  );

  return res.json({
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 7200,
    user: { id: me.id, username: me.username, email: me.email, roles: me.roles || [] },
  });
});

// PUT /api/auth/password
// body: { oldPassword, newPassword }
router.put('/password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  const userId = req.user?.sub;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'oldPassword and newPassword are required' });
  }
  if (oldPassword === newPassword) {
    return res.status(400).json({ error: 'New password cannot be the old password' });
  }

  const me = await User.findOne({id: userId});
  if (!me) return res.status(404).json({ error: 'User not found' });

  if (!verifyPassword(oldPassword, me)) {
    return res.status(401).json({ error: 'Old password incorrect' });
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include a letter, a number, and a special character',
    });
  }

  // update credentials in DB
  const { salt, hash, iterations, keylen, digest } = hashPassword(newPassword);
  me.password = newPassword;
  me.salt = salt;
  me.hash = hash;
  me.iterations = iterations;
  me.keylen = keylen;
  me.digest = digest;
  
  await me.save();

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
    user: { id: me.id, username: me.username, email: me.email, roles: me.roles || [] },
  });
});

export default router;