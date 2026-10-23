/**
 * Cryptographically signed administrator session manager.
 * Uses Web Crypto API (HMAC-SHA256) compatible with both Edge runtime and Node.js serverless.
 */

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

function getSecretKey(): string {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_INITIAL_PASSWORD ||
    "lnmcbm-codethon-2026-master-admin-secret-salt-secure";
  return secret;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  let normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token for an authenticated administrator.
 */
export async function createSignedAdminToken(
  payload: Omit<AdminSessionPayload, "issuedAt" | "expiresAt"> & {
    issuedAt?: number;
    expiresAt?: number;
  }
): Promise<string> {
  const now = Date.now();
  const session: AdminSessionPayload = {
    ...payload,
    role: "admin",
    issuedAt: payload.issuedAt || now,
    expiresAt: payload.expiresAt || now + 8 * 60 * 60 * 1000, // 8 hours duration
  };

  const jsonStr = JSON.stringify(session);
  const dataB64 = toBase64Url(jsonStr);

  const secret = getSecretKey();
  const key = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(dataB64));
  const signatureHex = bufferToHex(signatureBuffer);

  return `${dataB64}.${signatureHex}`;
}

/**
 * Cryptographically verifies an administrator session token:
 * 1. Validates format (data.signature).
 * 2. Re-computes HMAC-SHA256 signature using the server-side private secret.
 * 3. Enforces expiration timestamp and role check.
 * Returns null immediately if forged, tampered, or expired.
 */
export async function verifySignedAdminToken(
  tokenString?: string | null
): Promise<AdminSessionPayload | null> {
  if (!tokenString || typeof tokenString !== "string") {
    return null;
  }

  const parts = tokenString.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [dataB64, providedSigHex] = parts;
  if (!dataB64 || !providedSigHex) {
    return null;
  }

  try {
    const secret = getSecretKey();
    const key = await getCryptoKey(secret);
    const encoder = new TextEncoder();

    // Verify signature
    const expectedSigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(dataB64));
    const expectedSigHex = bufferToHex(expectedSigBuffer);

    // Constant-time length and value check
    if (providedSigHex.length !== expectedSigHex.length) {
      return null;
    }

    let diff = 0;
    for (let i = 0; i < expectedSigHex.length; i++) {
      diff |= providedSigHex.charCodeAt(i) ^ expectedSigHex.charCodeAt(i);
    }
    if (diff !== 0) {
      return null;
    }

    // Parse payload
    const jsonStr = fromBase64Url(dataB64);
    const payload = JSON.parse(jsonStr) as AdminSessionPayload;

    if (!payload || payload.role !== "admin") {
      return null;
    }

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    console.warn("verifySignedAdminToken failure:", err);
    return null;
  }
}

