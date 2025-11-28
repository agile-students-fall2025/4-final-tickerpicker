import crypto from 'crypto';

const ITERATIONS = 100000;
const KEYLEN = 32;
const DIGEST = 'sha256';

export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { salt, hash: derivedKey, iterations: ITERATIONS, keylen: KEYLEN, digest: DIGEST };
}

export function verifyPassword(plain, userRecord) {
  const { salt, hash, iterations = ITERATIONS, keylen = KEYLEN, digest = DIGEST } = userRecord;
  const derived = crypto.pbkdf2Sync(plain, salt, iterations, keylen, digest).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}
