import { randomBytes, pbkdf2Sync } from "crypto";

/**
 * Secure password hashing utility for local development fallback.
 * Plaintext passwords are NEVER stored in memory or database storage.
 */

export function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 64, "sha256").toString("hex");
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = hashPassword(password, salt);
  return hash === expectedHash;
}

