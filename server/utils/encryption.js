import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

const secret = process.env.ENCRYPTION_SECRET;
if (!secret) {
  throw new Error('ENCRYPTION_SECRET is not set in the environment variables');
}

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync(secret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
}

export function decrypt(encryptedHex) {
  const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
  
  const salt = encryptedBuffer.subarray(0, SALT_LENGTH);
  const iv = encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = crypto.pbkdf2Sync(secret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
} 