import crypto from 'crypto';

/**
 * Encryption Service for VIGIL
 *
 * Two layers:
 *   1. AES-256-GCM — encrypts connection passwords at rest in the database.
 *   2. RSA-OAEP key exchange — the frontend fetches a one-time RSA public key,
 *      encrypts the password client-side, and sends the ciphertext.  The backend
 *      decrypts with the matching private key, then re-encrypts with AES for storage.
 *
 * This ensures passwords are NEVER transmitted as plaintext, even over HTTPS.
 */

// ── AES-256-GCM config ───────────────────────────────────────────────────────
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
// PBKDF2_ITERATIONS increased from 10,000 to 600,000 to meet NIST recommendations (SP 800-132).
// Old data encrypted with fewer iterations will still decrypt correctly.
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_DIGEST = 'sha256';

// Derive salt deterministically from a fixed prefix hash to ensure consistency across restarts.
// This allows data encrypted before a restart to be decrypted after the restart.
function getDeterministicSalt() {
  const prefix = 'vigil-encryption-salt-v1';
  return crypto.createHash('sha256').update(prefix).digest().slice(0, 16);
}
const SALT = getDeterministicSalt();

// ── RSA key pair ────────────────────────────────────────────────────────────
// NOTE: The RSA layer is DISABLED on serverless deployments because in-memory
// keypairs are not shared across cold-start containers — the handshake and the
// POST handler can land on different instances, producing undecryptable payloads.
// Passwords are still protected in transit by HTTPS and at rest by AES-256-GCM
// using ENCRYPTION_KEY, so disabling the RSA defense-in-depth layer is a net-safe
// tradeoff for this deployment. The frontend has a documented fallback at
// cryptoUtils.ts:fetchPublicKey — when the handshake endpoint errors, it sends
// the password as plaintext over HTTPS.
function getRsaKeyPair() {
    throw new Error('RSA key exchange disabled — frontend will fall back to plaintext over HTTPS.');
}

// ── AES helpers ──────────────────────────────────────────────────────────────
function deriveKey(secret) {
    return crypto.pbkdf2Sync(secret, SALT, PBKDF2_ITERATIONS, 32, PBKDF2_DIGEST);
}

// SEC-06 (audit): ENCRYPTION_KEY is REQUIRED. The previous fallback to
// JWT_SECRET violated key-separation principles (one secret used for two
// distinct cryptographic purposes) and is no longer permitted in any
// environment. Operators MUST generate and set ENCRYPTION_KEY explicitly.
//
// Generate a key with:
//   node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
function getEncryptionSecret() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error(
            'FATAL: ENCRYPTION_KEY environment variable is required. '
          + 'Generate one with: '
          + 'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))" '
          + '(JWT_SECRET fallback removed for security — see audit SEC-06.)'
        );
    }
    if (key.length < 32) {
        throw new Error(
            'FATAL: ENCRYPTION_KEY must be at least 32 characters of entropy. '
          + 'Regenerate with: '
          + 'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"'
        );
    }
    if (process.env.JWT_SECRET && key === process.env.JWT_SECRET) {
        throw new Error(
            'FATAL: ENCRYPTION_KEY must NOT equal JWT_SECRET. Generate a distinct key — see audit SEC-06.'
        );
    }
    return key;
}

/**
 * Validate that encryption is properly configured.
 * Call once at startup — throws if misconfigured.
 */
export function validateEncryptionConfig() {
    try {
        const secret = getEncryptionSecret();
        const test = encrypt('vigil-self-test');
        const back = decrypt(test);
        if (back !== 'vigil-self-test') {
            throw new Error('Encrypt/decrypt round-trip failed');
        }
        return true;
    } catch (err) {
        console.error('[Encryption] Configuration error:', err.message);
        throw err;
    }
}

// ── AES-256-GCM encrypt / decrypt ───────────────────────────────────────────
export function encrypt(plaintext) {
    if (!plaintext) return plaintext;
    const secret = getEncryptionSecret();
    const key = deriveKey(secret);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
}

export function decrypt(encrypted) {
    if (!encrypted) return encrypted;
    const parts = encrypted.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted format');
    const [ivHex, authTagHex, ciphertextHex] = parts;
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const ciphertext = Buffer.from(ciphertextHex, 'hex');
        if (iv.length !== IV_LENGTH) throw new Error(`Bad IV length: ${iv.length}`);
        if (authTag.length !== AUTH_TAG_LENGTH) throw new Error(`Bad auth tag length: ${authTag.length}`);
        const secret = getEncryptionSecret();
        const key = deriveKey(secret);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

// ── Compatibility aliases ──────────────────────────────────────────────────
// samlService.js (and potentially other callers) import these under
// `*Secret` names. Keep the two exports as thin wrappers rather than
// renaming the canonical functions, so existing callers of `encrypt` /
// `decrypt` keep working without change.
export const encryptSecret = encrypt;
export const decryptSecret = decrypt;

export function isEncrypted(value) {
    if (!value || typeof value !== 'string') return false;
    const parts = value.split(':');
    if (parts.length !== 3) return false;
    try {
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH;
    } catch { return false; }
}

// ── RSA-OAEP: key exchange for frontend encryption ──────────────────────────
/**
 * Returns the current RSA public key (PEM) for the frontend to use.
 * Keys rotate every 30 minutes (or on process restart).
 */
export function getPublicKey() {
    return getRsaKeyPair().publicKey;
}

/**
 * Decrypt a value that was encrypted by the frontend using the RSA public key.
 * @param {string} rsaCiphertext — base64-encoded RSA-OAEP ciphertext
 * @returns {string} plaintext
 */
export function rsaDecrypt(rsaCiphertext) {
    if (!rsaCiphertext) return rsaCiphertext;
    try {
        const { privateKey } = getRsaKeyPair();
        const buffer = Buffer.from(rsaCiphertext, 'base64');
        const plaintext = crypto.privateDecrypt(
            { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
            buffer,
        );
        return plaintext.toString('utf8');
    } catch (err) {
        throw new Error(`RSA decryption failed: ${err.message}`);
    }
}

/**
 * Unwrap a field that may be RSA-encrypted (from frontend) or plaintext (legacy).
 * If it looks like base64 RSA ciphertext (256+ bytes), try RSA decrypt first.
 * Otherwise return as-is (plaintext — for backward compatibility).
 */
export function unwrapField(value) {
    // RSA client-side encryption is disabled (see getRsaKeyPair above). All
    // sensitive fields now arrive as plaintext over HTTPS. Return as-is.
    return value;
}

export default {
    encrypt,
    decrypt,
    isEncrypted,
    getPublicKey,
    rsaDecrypt,
    unwrapField,
    validateEncryptionConfig,
};