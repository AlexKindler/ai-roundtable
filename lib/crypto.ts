const SALT_PREFIX = "ai-roundtable-v1";
const ITERATIONS = 100_000;
const KEY_LENGTH = 256;

function getEncoder() {
  return new TextEncoder();
}

function getDecoder() {
  return new TextDecoder();
}

async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = getEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const salt = encoder.encode(`${SALT_PREFIX}:${userId}`);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptApiKey(
  plainKey: string,
  userId: string
): Promise<{ encrypted: string; iv: string }> {
  const key = await deriveKey(userId);
  const encoder = getEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainKey)
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptApiKey(
  encrypted: string,
  iv: string,
  userId: string
): Promise<string> {
  const key = await deriveKey(userId);
  const decoder = getDecoder();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(base64ToArrayBuffer(iv)) },
    key,
    base64ToArrayBuffer(encrypted)
  );

  return decoder.decode(decrypted);
}
