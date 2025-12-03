import { Router } from 'express';
import { User } from '../data/users.js';
import { verifyPassword, hashPassword } from '../auth/password.js';
import { signJWT } from '../auth/jwt.js';
import { requireAuth } from '../middleware/AuthRequirement.js';
import dotenv from "dotenv";
dotenv.config();

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
  const normEmail = norm(email);
  if (!normEmail || !password ) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  if (!EMAIL_REGEX.test(normEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // DB MODIFICATION INTEGRATION
  const user = await User.findOne({email: normEmail});
  // if 'user' with 'username' not in DB
  if (!user || !verifyPassword(password, user)) { //<-- see password.js/verifyPassword()
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  // END OF DB MODIFICATION INTEGRATION

  // ??
  const accessToken = signJWT(
    { sub: user.id, username: user.username, roles: user.roles || [] },
    JWT_SECRET,
    { expiresInSec: 2 * 60 * 60 } // 2h
  );

  return res.json({
    // ??
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 7200,
    user: { id: user.id, username: user.username, email: user.email, roles: user.roles || [] },
  });
});

// POST /api/auth/register (temporarily for development, will change after connecting to db)
// body: { username, password }
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body || {};
  const normEmail = norm(email);

  if (!normEmail||!username || !password) {
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

  // DB MODIFICATION INTEGRATION
  // if 'username' already in DB
  if (await User.findOne({email: normEmail})) {
    console.log('email already exists:', email);//TEST
    return res.status(409).json({ error: 'email already exists' });
  }

  // register 'newUser' in DB
  const { salt, hash, iterations, keylen, digest } = hashPassword(password); // <-- see password.js/hashPassword()
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

  /*const newUser = { id: 'u' + (USERS.length + 1), username, roles: ['user'], salt, hash, iterations, keylen, digest };
  USERS.push(newUser);*/
  // END OF DB MODIFICATION INTEGRATION
  
  return res.status(201).json({ message: 'registered', user: { id: newUser.id, username: newUser.username, email: newUser.email, roles: newUser.roles || [] } });
});

// MODIFIED FOR DB INTEGRATION
// PUT /api/auth/email
// body: { newEmail }
router.put('/email', requireAuth, async (req, res) => {
  const { newEmail } = req.body || {};
  const userId = req.user?.sub; //<-- userId === null handler??

  // MODIFY FOR DB INTEGRATION
  //const me = USERS.find(u => u.id === userId);
  // find 'me' in DB
  const me = await User.findOne({id: userId});
  if (!me) return res.status(404).json({ error: 'User not found' });

  const normNewEmail = norm(newEmail);
  if (!normNewEmail || typeof newEmail !== 'string') {
    return res.status(400).json({ error: 'newEmail is required' });
  }

  if (!EMAIL_REGEX.test(normNewEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  //const exists = USERS.find(u => u.username === newEmail && u.id !== userId);
  if (me.email === normNewEmail) return res.status(409).json({ error: 'Email/username already in use' });
  
  // update 'me' email/username in DB
  me.email = normNewEmail.trim();
  await me.save();
  // END OF DB INTEGRATION MODIFICATION

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

// MODIFIED FOR DB INTEGRATION
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

  // MODIFY FOR DB INTEGRATION
  //const me = USERS.find(u => u.id === userId);
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
  me.password = newPassword;//<-- do we store the plain password??
  me.salt = salt;
  me.hash = hash;
  me.iterations = iterations;
  me.keylen = keylen;
  me.digest = digest;
  // END OF DB INTEGRATION MODIFICATION
  
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