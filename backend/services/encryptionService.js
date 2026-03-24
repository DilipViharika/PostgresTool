import crypto from 'crypto';

/**
 * Encryption Service for VIGIL
 * Provides AES-256-GCM encryption for sensitive connection details
 * Uses Node.js built-in crypto module (no external dependencies)
 */

// Configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;        // 12 bytes for GCM
const AUTH_TAG_LENGTH = 16;  // 16 bytes for GCM
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = 'sha256';
const SALT = 'vigil-encryption-salt-v1'; // Fixed salt for consistent key derivation

/**
 * Derive a 256-bit key from the secret using PBKDF2
 * @param {string} secret - The secret key (from ENCRYPTION_KEY or JWT_SECRET)
 * @returns {Buffer} - 32-byte derived key
 */
function deriveKey(secret) {
    return crypto.pbkdf2Sync(
        secret,
        SALT,
        PBKDF2_ITERATIONS,
        32, // 256 bits / 8
        PBKDF2_DIGEST
    );
}

/**
 * Get the encryption secret from environment
 * Falls back to JWT_SECRET if ENCRYPTION_KEY is not set
 * @returns {string}
 */
function getEncryptionSecret() {
    return process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'vigil-change-me-in-production';
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param {string} plaintext - The text to encrypt
 * @returns {string} - Format: "iv:authTag:ciphertext" (all hex-encoded)
 */
export function encrypt(plaintext) {
    if (!plaintext) return plaintext; // Don't encrypt empty values

    const secret = getEncryptionSecret();
    const key = deriveKey(secret);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    // Return in format: iv:authTag:ciphertext (all hex-encoded)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
}

/**
 * Decrypt ciphertext encrypted with encrypt()
 * @param {string} encrypted - Encrypted string in format "iv:authTag:ciphertext"
 * @returns {string} - The original plaintext
 * @throws {Error} If decryption fails or format is invalid
 */
export function decrypt(encrypted) {
    if (!encrypted) return encrypted; // Don't decrypt empty values

    const parts = encrypted.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format: expected "iv:authTag:ciphertext"');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;

    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const ciphertext = Buffer.from(ciphertextHex, 'hex');

        if (iv.length !== IV_LENGTH) {
            throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
        }
        if (authTag.length !== AUTH_TAG_LENGTH) {
            throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`);
        }

        const secret = getEncryptionSecret();
        const key = deriveKey(secret);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        const plaintext = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]).toString('utf8');

        return plaintext;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

/**
 * Check if a value is in the encrypted format (iv:authTag:ciphertext)
 * This allows backward compatibility with legacy plaintext values
 * @param {string} value - The value to check
 * @returns {boolean} - True if value matches the encrypted format
 */
export function isEncrypted(value) {
    if (!value || typeof value !== 'string') return false;

    const parts = value.split(':');
    if (parts.length !== 3) return false;

    // Check if each part is valid hex and has the expected length
    const [ivHex, authTagHex, ciphertextHex] = parts;

    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH;
    } catch {
        return false;
    }
}

export default {
    encrypt,
    decrypt,
    isEncrypted,
};
