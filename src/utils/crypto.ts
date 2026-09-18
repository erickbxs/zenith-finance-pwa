/**
 * Security & Encryption Engine - Web Crypto API (Client-Side Only)
 * 
 * Standards:
 * - Cipher: AES-GCM 256-bit
 * - Key Derivation Function: PBKDF2 with SHA-256 and 100,000 iterations
 * - Cryptographically Secure Random Salt (16 bytes) & IV (12 bytes)
 * - Zero Network Transmission (100% Air-Gapped)
 */

export interface EncryptedPayload {
  cipherText: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
  iterations: number;
  algorithm: 'AES-GCM-256';
  kdf: 'PBKDF2-SHA256';
  timestamp: string;
}

/**
 * Derives an AES-GCM 256-bit CryptoKey from a user password and salt using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary text or serialized JSON using AES-GCM 256-bit with PBKDF2 key derivation.
 */
export async function encryptData(plainText: string, masterPassword: string): Promise<EncryptedPayload> {
  if (!masterPassword || masterPassword.length < 6) {
    throw new Error('A chave mestra/senha deve ter no mínimo 6 caracteres.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt);

  const enc = new TextEncoder();
  const encodedData = enc.encode(plainText);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData
  );

  // Convert binary buffers to Base64 strings for portable JSON storage
  const cipherTextBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const saltBase64 = btoa(String.fromCharCode(...salt));

  return {
    cipherText: cipherTextBase64,
    iv: ivBase64,
    salt: saltBase64,
    iterations: 100000,
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA256',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decrypts an EncryptedPayload using the provided master password.
 */
export async function decryptData(payload: EncryptedPayload, masterPassword: string): Promise<string> {
  if (!payload || !payload.cipherText || !payload.iv || !payload.salt) {
    throw new Error('Estrutura de dados criptografados inválida.');
  }

  // Decode Base64 components
  const cipherBytes = Uint8Array.from(atob(payload.cipherText), (c) => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const saltBytes = Uint8Array.from(atob(payload.salt), (c) => c.charCodeAt(0));

  const key = await deriveKey(masterPassword, saltBytes, payload.iterations || 100000);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes as unknown as BufferSource,
      },
      key,
      cipherBytes as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Falha na descriptografia: Senha incorreta ou dados corrompidos.');
  }
}
