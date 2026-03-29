import { logger } from '@/lib/observability';
/**
 * 🔑 SILEXAR PULSE — Secret Manager
 * 
 * Gestión centralizada de secretos desde variables de entorno.
 * Valida presencia, formato, y fuerza de secretos requeridos.
 * 
 * @version 2026.3.0
 * @security OWASP A02 — Cryptographic Failures  
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface Secret {
  key: string;
  value: string;
  required: boolean;
  minLength?: number;
  description: string;
}

interface SecretValidationResult {
  valid: boolean;
  missing: string[];
  weak: string[];
  warnings: string[];
}

type SecretKey =
  | 'JWT_SECRET'
  | 'JWT_REFRESH_SECRET'
  | 'BETTER_AUTH_SECRET'
  | 'ENCRYPTION_MASTER_KEY'
  | 'DATABASE_PASSWORD'
  | 'DATABASE_URL'
  | 'REDIS_PASSWORD'
  | 'SENDGRID_API_KEY'
  | 'OPENAI_API_KEY'
  | 'VERCEL_TOKEN'
  | 'SENTRY_DSN';

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SECRETOS REQUERIDOS
// ═══════════════════════════════════════════════════════════════

const SECRET_DEFINITIONS: Record<SecretKey, { required: boolean; minLength: number; description: string }> = {
  JWT_SECRET: {
    required: true,
    minLength: 32,
    description: 'Clave para firmar JWT access tokens',
  },
  JWT_REFRESH_SECRET: {
    required: true,
    minLength: 32,
    description: 'Clave para firmar JWT refresh tokens',
  },
  BETTER_AUTH_SECRET: {
    required: true,
    minLength: 32,
    description: 'Clave principal de Better Auth',
  },
  ENCRYPTION_MASTER_KEY: {
    required: false,
    minLength: 32,
    description: 'Clave maestra para cifrado at-rest',
  },
  DATABASE_PASSWORD: {
    required: true,
    minLength: 8,
    description: 'Contraseña de PostgreSQL',
  },
  DATABASE_URL: {
    required: true,
    minLength: 20,
    description: 'URL de conexión a PostgreSQL',
  },
  REDIS_PASSWORD: {
    required: false,
    minLength: 8,
    description: 'Contraseña de Redis',
  },
  SENDGRID_API_KEY: {
    required: false,
    minLength: 10,
    description: 'API key de SendGrid para emails',
  },
  OPENAI_API_KEY: {
    required: false,
    minLength: 10,
    description: 'API key de OpenAI para IA',
  },
  VERCEL_TOKEN: {
    required: false,
    minLength: 10,
    description: 'Token de Vercel para deploy',
  },
  SENTRY_DSN: {
    required: false,
    minLength: 10,
    description: 'DSN de Sentry para error tracking',
  },
};

// Patrones de placeholder que indican que el secret no fue configurado
const PLACEHOLDER_PATTERNS = [
  'your-',
  'change-in-production',
  'changeme',
  'placeholder',
  'todo',
  'example',
  'xxx',
  'sk-your',
];

// ═══════════════════════════════════════════════════════════════
// FUNCIONES
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener un secreto de las variables de entorno
 * Retorna null si no está definido o es un placeholder
 */
export async function getSecret(key: SecretKey): Promise<string | null> {
  const value = process.env[key];
  if (!value || value.trim() === '') return null;

  // Verificar si es un placeholder
  const lower = value.toLowerCase();
  if (PLACEHOLDER_PATTERNS.some(pattern => lower.includes(pattern))) {
    if (process.env.NODE_ENV === 'production') {
      logger.error(`[SecretManager] ❌ Secret ${key} contains placeholder value in production!`);
      return null;
    }
  }

  return value;
}

/**
 * Establecer un secreto (solo para testing/desarrollo)
 */
export async function setSecret(key: SecretKey, value: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    logger.error('[SecretManager] ❌ Cannot set secrets dynamically in production');
    return false;
  }

  const definition = SECRET_DEFINITIONS[key];
  if (definition && value.length < definition.minLength) {
    logger.error(`[SecretManager] ❌ ${key} must be at least ${definition.minLength} characters`);
    return false;
  }

  process.env[key] = value;
  return true;
}

/**
 * Validar todos los secretos requeridos
 */
export async function validateSecrets(): Promise<SecretValidationResult> {
  const missing: string[] = [];
  const weak: string[] = [];
  const warnings: string[] = [];

  for (const [key, definition] of Object.entries(SECRET_DEFINITIONS)) {
    const value = process.env[key];

    // Verificar presencia
    if (!value || value.trim() === '') {
      if (definition.required) {
        missing.push(key);
      }
      continue;
    }

    // Verificar placeholder
    const lower = value.toLowerCase();
    if (PLACEHOLDER_PATTERNS.some(pattern => lower.includes(pattern))) {
      if (definition.required) {
        weak.push(`${key}: contiene valor de placeholder`);
      } else {
        warnings.push(`${key}: contiene valor de placeholder (no requerido)`);
      }
      continue;
    }

    // Verificar longitud mínima
    if (value.length < definition.minLength) {
      weak.push(`${key}: longitud ${value.length} < mínimo ${definition.minLength}`);
    }
  }

  return {
    valid: missing.length === 0 && weak.length === 0,
    missing,
    weak,
    warnings,
  };
}

/**
 * Verificar si un secreto específico existe y es válido
 */
export async function hasValidSecret(key: SecretKey): Promise<boolean> {
  const value = await getSecret(key);
  if (!value) return false;

  const definition = SECRET_DEFINITIONS[key];
  if (!definition) return true;

  return value.length >= definition.minLength;
}

export default { getSecret, setSecret, validateSecrets, hasValidSecret };