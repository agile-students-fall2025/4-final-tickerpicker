import crypto from 'crypto';

function base64url(input) {
  const str = Buffer.isBuffer(input) ? input.toString('base64') : Buffer.from(input).toString('base64');
  return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlJSON(obj) {
  return base64url(JSON.stringify(obj));
}

export function signJWT(payload, secret, { expiresInSec = 7200 } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };

  const headerPart = base64urlJSON(header);
  const payloadPart = base64urlJSON(body);
  const toSign = `${headerPart}.${payloadPart}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(toSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${toSign}.${signature}`;
}

export function verifyJWT(token, secret) {
  if (!token || typeof token !== 'string') throw new Error('No token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');

  const [headerPart, payloadPart, signature] = parts;
  const toSign = `${headerPart}.${payloadPart}`;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(toSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    throw new Error('Invalid signature');
  }

  const payloadJson = Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now >= payload.exp) throw new Error('Token expired');

  return payload;
}
