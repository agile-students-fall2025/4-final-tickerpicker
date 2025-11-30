import crypto from 'crypto';
// node built-in module for cryptographic functions

// CONFIGURATION CONSTANTS

// runs hash ITERATIONS times to slow down brute-force attacks
const ITERATIONS = 100000;

// key = hashed password of 32-Byte length
const KEYLEN = 32;

// hashing algorithm
const DIGEST = 'sha256';

// plain = user-provided password
export function hashPassword(plain) {
  // random 16-Byte hex string, prevents same passwords from having same hash
  const salt = crypto.randomBytes(16).toString('hex');
  
  // provides a synchronous Password-Based Key Derivation Function 2 (PBKDF2) implementation. 
  // A selected HMAC digest algorithm specified by 'DIGEST' is applied to derive a 
  // key of the requested byte length ('KEYLEN') from the password, salt and 'ITERATIONS'.
  const derivedKey = crypto.pbkdf2Sync(
    plain, salt, 
    ITERATIONS, KEYLEN, DIGEST
  ).toString('hex');
  
  // store this object into user document in DB
  return { 
    salt, 
    hash: derivedKey, 
    iterations: ITERATIONS, 
    keylen: KEYLEN, 
    digest: DIGEST 
  };
}
// plain = user-provided password
export function verifyPassword(plain, userRecord) {
  const { salt, hash, iterations = ITERATIONS, keylen = KEYLEN, digest = DIGEST } = userRecord;
  const derived = crypto.pbkdf2Sync(plain, salt, iterations, keylen, digest).toString('hex');
  
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}
