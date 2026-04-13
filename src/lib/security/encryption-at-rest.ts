/**
 * 🔐 SILEXAR PULSE — Encryption at Rest
 * 
 * Cifrado real de datos en reposo usando AES-256-GCM.
 * Para datos sensibles almacenados en BD (contraseñas de API, tokens, etc.)
 * 
 * @version 2026.3.0
 * @security OWASP A02 — Cryptographic Failures
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

export interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyRotationDays: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
}

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyRotationDays: 90,
  ivLength: 16,
  tagLength: 16,
  saltLength: 32,
};

interface EncryptedPayload {
  /** Texto cifrado en hex */
  ciphertext: string;
  /** Vector de inicialización en hex */
  iv: string;
  /** Authentication tag en hex */
  tag: string;
  /** Salt para derivación de clave en hex */
  salt: string;
  /** Versión del algoritmo */
  version: number;
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE CIFRADO
// ═══════════════════════════════════════════════════════════════

/**
 * Derivar clave de cifrado a partir del master secret + salt
 */
function deriveKey(masterSecret: string, salt: Buffer): Buffer {
  return scryptSync(masterSecret, salt, 32);
}

/**
 * Obtener master secret de variables de entorno
 */
function getMasterSecret(): string {
  const secret = process.env.ENCRYPTION_MASTER_KEY || process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.includes('change-in-production') || secret.length < 32) {
    throw new Error(
      'ENCRYPTION_MASTER_KEY or BETTER_AUTH_SECRET must be set with a strong secret (min 32 chars)'
    );
  }
  return secret;
}

/**
 * Cifrar datos sensibles con AES-256-GCM
 * 
 * @param plaintext - Texto a cifrar
 * @returns Payload cifrado serializable
 */
export async function encryptAtRest(plaintext: string): Promise<string> {
  const config = DEFAULT_CONFIG;
  const masterSecret = getMasterSecret();

  // Generar salt e IV aleatorios para cada operación
  const salt = randomBytes(config.saltLength);
  const iv = randomBytes(config.ivLength);

  // Derivar clave única para esta operación
  const key = deriveKey(masterSecret, salt);

  // Cifrar con AES-256-GCM
  const cipher = createCipheriv(config.algorithm, key, iv, {
    authTagLength: config.tagLength,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Empaquetar todo el payload
  const payload: EncryptedPayload = {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex'),
    version: 1,
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Descifrar datos cifrados con AES-256-GCM
 * 
 * @param encryptedBase64 - Payload cifrado en base64
 * @returns Texto descifrado
 */
export async function decryptAtRest(encryptedBase64: string): Promise<string> {
  const config = DEFAULT_CONFIG;
  const masterSecret = getMasterSecret();

  // Decodificar payload
  const payloadStr = Buffer.from(encryptedBase64, 'base64').toString('utf8');
  const payload: EncryptedPayload = JSON.parse(payloadStr);

  if (payload.version !== 1) {
    throw new Error(`Unsupported encryption version: ${payload.version}`);
  }

  // Reconstruir componentes
  const salt = Buffer.from(payload.salt, 'hex');
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const ciphertext = Buffer.from(payload.ciphertext, 'hex');

  // Derivar la misma clave
  const key = deriveKey(masterSecret, salt);

  // Descifrar con AES-256-GCM
  const decipher = createDecipheriv(config.algorithm, key, iv, {
    authTagLength: config.tagLength,
  });

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Verificar integridad de datos cifrados sin descifrar
 */
export async function verifyIntegrity(encryptedBase64: string): Promise<boolean> {
  try {
    const payloadStr = Buffer.from(encryptedBase64, 'base64').toString('utf8');
    const payload: EncryptedPayload = JSON.parse(payloadStr);
    
    return (
      payload.version === 1 &&
      typeof payload.ciphertext === 'string' &&
      typeof payload.iv === 'string' &&
      typeof payload.tag === 'string' &&
      typeof payload.salt === 'string' &&
      payload.iv.length === DEFAULT_CONFIG.ivLength * 2 &&
      payload.tag.length === DEFAULT_CONFIG.tagLength * 2
    );
  } catch {
    return false;
  }
}

export default { encryptAtRest, decryptAtRest, verifyIntegrity };
