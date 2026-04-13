/**
 * 🔐 SILEXAR PULSE — Enterprise Encryption
 * 
 * Funciones de cifrado enterprise para datos en tránsito y almacenamiento.
 * Wrapper de alto nivel sobre encryption-at-rest con helpers adicionales.
 * 
 * @version 2026.3.0
 * @security OWASP A02 — Cryptographic Failures
 */

import { encryptAtRest, decryptAtRest, verifyIntegrity } from './encryption-at-rest';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface EncryptionKey {
  id: string;
  algorithm: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE CIFRADO
// ═══════════════════════════════════════════════════════════════

/**
 * Cifrar un campo sensible (API key, token externo, etc.)
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext || plaintext.trim() === '') {
    throw new Error('Cannot encrypt empty data');
  }
  return encryptAtRest(plaintext);
}

/**
 * Descifrar un campo sensible
 */
export async function decrypt(ciphertext: string): Promise<string> {
  if (!ciphertext || ciphertext.trim() === '') {
    throw new Error('Cannot decrypt empty data');
  }
  return decryptAtRest(ciphertext);
}

/**
 * Generar hash SHA-256 de un valor (one-way, no reversible)
 * Útil para comparar valores sin almacenar el original
 */
export function hashSHA256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Generar hash HMAC-SHA256 con salt
 */
export function hashHMAC(value: string, salt?: string): string {
  const actualSalt = salt || process.env.ENCRYPTION_MASTER_KEY || 'default-salt';
  return createHmac('sha256', actualSalt).update(value).digest('hex');
}

/**
 * Generar un token aleatorio seguro
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Comparar dos strings de forma segura (timing-safe)
 * Previene timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verificar integridad de datos cifrados
 */
export async function verify(ciphertext: string): Promise<boolean> {
  return verifyIntegrity(ciphertext);
}

/**
 * Cifrar un objeto JSON completo
 */
export async function encryptJSON(data: Record<string, unknown>): Promise<string> {
  const json = JSON.stringify(data);
  return encrypt(json);
}

/**
 * Descifrar un objeto JSON
 */
export async function decryptJSON<T = Record<string, unknown>>(ciphertext: string): Promise<T> {
  const json = await decrypt(ciphertext);
  return JSON.parse(json) as T;
}

export default {
  encrypt,
  decrypt,
  hashSHA256,
  hashHMAC,
  generateSecureToken,
  secureCompare,
  verify,
  encryptJSON,
  decryptJSON,
};