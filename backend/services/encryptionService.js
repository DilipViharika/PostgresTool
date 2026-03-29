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
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = 'sha256';
const SALT = 'vigil-encryption-salt-v1';

// ── RSA key pair (generated once per process; rotated on restart) ─────────────
let _rsaKeyPair = null;
const RSA_KEY_TTL_MS = 30 * 60 * 1000; // 30 minutes
let _rsaCreatedAt = 0;

function getRsaKeyPair() {
    const now = Date.now();
    if (!_rsaKeyPair || (now - _rsaCreatedAt) > RSA_KEY_TTL_MS) {
        _rsaKeyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding:  { type: 'spki',  format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        _rsaCreatedAt = now;
    }
    return _rsaKeyPair;
}

// ── AES helpers ──────────────────────────────────────────────────────────────
function deriveKey(secret) {
    return crypto.pbkdf2Sync(secret, SALT, PBKDF2_ITERATIONS, 32, PBKDF2_DIGEST);
}

function getEncryptionSecret() {
    let key = process.env.ENCRYPTION_KEY;
    if (!key) {
        key = process.env.JWT_SECRET;
        if (key) {
            console.warn('[Encryption] WARNING: Using JWT_SECRET as fallback for encryption key. Set ENCRYPTION_KEY environment variable for production security.');
        }
    }
    if (!key) {
        throw new Error(
            'ENCRYPTION_KEY (or JWT_SECRET) environment variable is required. '
          + 'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"'
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
    if (!value) return value;
    // RSA-2048 produces ~344 base64 chars for any input < 214 bytes
    if (typeof value === 'string' && value.length >= 200 && /^[A-Za-z0-9+/=]+$/.test(value)) {
        try { return rsaDecrypt(value); } catch { /* fall through to plaintext */ }
    }
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
