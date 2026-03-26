/**
 * Utility functions — pure helpers with no side-effects.
 * Keep all business-logic-free helpers here.
 */

interface UserForm {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
}

interface PasswordStrengthResult {
  label: 'Strong' | 'Medium' | 'Weak';
  color: string;
}

interface RiskScoreInput {
  failedLogins?: number;
  lastLogin?: string;
}

interface ColorConfig {
  success: string;
  warning: string;
  danger: string;
}

/**
 * Returns a human-readable relative time string.
 * @param iso - ISO 8601 date string
 * @returns Human-readable time string
 */
export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Validate a user form object.
 * @param form - User form data
 * @param isEdit - Skip username/password checks when editing
 * @returns Errors object (empty = valid)
 */
export function validateUserForm(form: UserForm, isEdit = false): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name?.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) {
    errors.email = 'Valid email required';
  }
  if (!isEdit) {
    if (!form.username?.trim() || form.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(form.username.trim())) {
      errors.username = 'Username may only contain letters, numbers, dots, underscores, or hyphens';
    }
    if (!form.password || form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  }
  return errors;
}

/**
 * Generate a cryptographically-safe random password.
 * Uses window.crypto.getRandomValues when available; falls back to Math.random.
 * @param length - Password length
 * @returns Generated password
 */
export function generatePassword(length = 14): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  const bytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => charset[b % charset.length]).join('');
}

/**
 * Evaluate the strength of a password.
 * @param pw - Password string
 * @param colors - Color configuration
 * @returns Strength result with label and color
 */
export function passwordStrength(pw: string, colors: ColorConfig): PasswordStrengthResult {
  const strong =
    pw.length >= 12 && /[!@#$%^&*]/.test(pw) && /[0-9]/.test(pw) && /[A-Z]/.test(pw);
  const medium = pw.length >= 8;
  if (strong) return { label: 'Strong', color: colors.success };
  if (medium) return { label: 'Medium', color: colors.warning };
  return { label: 'Weak', color: colors.danger };
}

/**
 * Compute a risk score from raw user data.
 * Centralised here so the formula stays consistent across the UI and tests.
 * @param data - User data with failedLogins and lastLogin
 * @returns Risk score 0–100
 */
export function computeRiskScore(data: RiskScoreInput): number {
  const daysSinceLogin =
    (Date.now() - new Date(data.lastLogin || Date.now()).getTime()) / 86_400_000;
  return Math.min(
    100,
    (data.failedLogins || 0) * 7 + (daysSinceLogin > 14 ? 20 : 0) + Math.floor(Math.random() * 20)
  );
}

/**
 * Safely copy text to clipboard; returns a promise.
 * @param text - Text to copy
 * @returns Promise that resolves when copy completes
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers / non-HTTPS
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}
