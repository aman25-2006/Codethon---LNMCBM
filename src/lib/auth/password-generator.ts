import { randomInt } from "crypto";

/**
 * Cryptographically Secure 8-Character Temporary Password Generator.
 * 
 * SECURITY & USABILITY MANDATES:
 * - Exactly 8 characters length.
 * - Cryptographically random using crypto.randomInt.
 * - Strictly excludes visually confusing characters:
 *   - No 'O' (uppercase O), 'o' (lowercase o), or '0' (zero).
 *   - No 'I' (uppercase i), 'l' (lowercase L), or '1' (one).
 * - Guarantees a balanced mix of uppercase, lowercase, and digits.
 * - Never derived from roll number, student name, or predictable metadata.
 */

const UPPERCASE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24 chars (excludes I, O)
const LOWERCASE_CHARS = "abcdefghijkmnpqrstuvwxyz"; // 24 chars (excludes l, o)
const DIGIT_CHARS     = "23456789";                 // 8 chars (excludes 0, 1)

const ALL_SAFE_CHARS = UPPERCASE_CHARS + LOWERCASE_CHARS + DIGIT_CHARS; // 56 chars

/**
 * Generates an 8-character unambiguous temporary password.
 */
export function generateTemporaryPassword(): string {
  const chars: string[] = [];

  // Guarantee at least 2 uppercase letters
  chars.push(UPPERCASE_CHARS[randomInt(0, UPPERCASE_CHARS.length)]);
  chars.push(UPPERCASE_CHARS[randomInt(0, UPPERCASE_CHARS.length)]);

  // Guarantee at least 2 lowercase letters
  chars.push(LOWERCASE_CHARS[randomInt(0, LOWERCASE_CHARS.length)]);
  chars.push(LOWERCASE_CHARS[randomInt(0, LOWERCASE_CHARS.length)]);

  // Guarantee at least 2 numbers
  chars.push(DIGIT_CHARS[randomInt(0, DIGIT_CHARS.length)]);
  chars.push(DIGIT_CHARS[randomInt(0, DIGIT_CHARS.length)]);

  // Fill remaining 2 characters from full safe pool
  chars.push(ALL_SAFE_CHARS[randomInt(0, ALL_SAFE_CHARS.length)]);
  chars.push(ALL_SAFE_CHARS[randomInt(0, ALL_SAFE_CHARS.length)]);

  // Cryptographically shuffle array using Fisher-Yates
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  const password = chars.join("");

  if (password.length !== 8) {
    throw new Error(`Generated password failed length invariant: expected 8, received ${password.length}`);
  }

  return password;
}

/**
 * Validates whether a candidate password complies with the safe 8-character format.
 */
export function validateTemporaryPasswordFormat(password: string): boolean {
  if (!password || password.length !== 8) return false;
  // Must only contain unambiguous characters
  const safeRegex = /^[A-HJ-NP-Za-km-z2-9]{8}$/;
  return safeRegex.test(password);
}

