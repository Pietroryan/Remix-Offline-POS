/**
 * Cryptographic Utility for Offline POS Application
 * Implements standard SHA-256 hashing for user credentials using js-sha256.
 */
import { sha256 } from 'js-sha256';

/**
 * Standard pre-computed SHA-256 hashes:
 * admin123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
 * kasir123 -> f02b7c1e519e4fa436147f7e1399974f9510aa9c8e0cb8be29151eb540f9d214
 */
export const DEFAULT_ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
export const DEFAULT_KASIR_HASH = 'f02b7c1e519e4fa436147f7e1399974f9510aa9c8e0cb8be29151eb540f9d214';
export const DEFAULT_USER_HASH = DEFAULT_KASIR_HASH;

/**
 * Synchronous hash method for offline instant storage access.
 */
export function hashPasswordSync(password: string): string {
  if (!password) return '';
  return sha256(password);
}

/**
 * Async password hash method.
 */
export async function hashPassword(password: string): Promise<string> {
  return hashPasswordSync(password);
}

/**
 * Verify a plain text password against a stored SHA-256 hash or fallback.
 */
export function verifyPasswordSync(password: string, hash: string): boolean {
  if (!password) return false;
  if (!hash) return false;

  const cleanPass = password.trim();
  const computed = hashPasswordSync(cleanPass).toLowerCase();
  const targetHash = hash.trim().toLowerCase();

  // 1. Direct SHA-256 match
  if (computed === targetHash) return true;

  // 2. Direct plain-text match (for testing or legacy fallback)
  if (cleanPass === hash.trim()) return true;

  // 3. Known default password fallbacks to prevent lockout
  if (cleanPass === 'admin123' && targetHash === DEFAULT_ADMIN_HASH) return true;
  if (cleanPass === 'kasir123' && targetHash === DEFAULT_KASIR_HASH) return true;

  return false;
}

/**
 * Async password verification.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verifyPasswordSync(password, hash);
}
