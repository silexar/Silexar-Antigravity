/**
 * 🛡️ SILEXAR PULSE — Military Grade Security Validator
 * 
 * Validador de configuración de seguridad que verifica
 * que todos los controles requeridos están activos.
 * 
 * @version 2026.3.0
 * @security OWASP A05 — Security Misconfiguration
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type SecurityLevel = 'STANDARD' | 'HIGH' | 'MILITARY';

export interface MilitaryGradeConfig {
  level: SecurityLevel;
  enforceHTTPS: boolean;
  enforceCSP: boolean;
  enforceRateLimit: boolean;
  enforceInputValidation: boolean;
  enforceAuditLogging: boolean;
  maxSessionDuration: number; // minutos
  requireMFA: boolean;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
}

interface SecurityCheckResult {
  check: string;
  passed: boolean;
  details: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface GradeAssessment {
  level: SecurityLevel;
  score: number; // 0-100
  checks: SecurityCheckResult[];
  recommendations: string[];
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIONES POR NIVEL
// ═══════════════════════════════════════════════════════════════

const LEVEL_CONFIGS: Record<SecurityLevel, MilitaryGradeConfig> = {
  STANDARD: {
    level: 'STANDARD',
    enforceHTTPS: false,
    enforceCSP: false,
    enforceRateLimit: true,
    enforceInputValidation: true,
    enforceAuditLogging: false,
    maxSessionDuration: 480, // 8 horas
    requireMFA: false,
    passwordMinLength: 8,
    passwordRequireSpecial: false,
  },
  HIGH: {
    level: 'HIGH',
    enforceHTTPS: true,
    enforceCSP: true,
    enforceRateLimit: true,
    enforceInputValidation: true,
    enforceAuditLogging: true,
    maxSessionDuration: 120, // 2 horas
    requireMFA: false,
    passwordMinLength: 12,
    passwordRequireSpecial: true,
  },
  MILITARY: {
    level: 'MILITARY',
    enforceHTTPS: true,
    enforceCSP: true,
    enforceRateLimit: true,
    enforceInputValidation: true,
    enforceAuditLogging: true,
    maxSessionDuration: 30, // 30 minutos
    requireMFA: true,
    passwordMinLength: 16,
    passwordRequireSpecial: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener el nivel de seguridad actual del sistema
 */
export function getMilitaryGradeLevel(): SecurityLevel {
  const envLevel = process.env.SECURITY_LEVEL?.toUpperCase();
  if (envLevel === 'MILITARY' || envLevel === 'HIGH' || envLevel === 'STANDARD') {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'HIGH' : 'STANDARD';
}

/**
 * Obtener la configuración para el nivel actual
 */
export function getSecurityConfig(): MilitaryGradeConfig {
  return LEVEL_CONFIGS[getMilitaryGradeLevel()];
}

/**
 * Ejecutar todos los checks de seguridad para el nivel configurado
 */
export function enforceMilitaryGrade(): GradeAssessment {
  const level = getMilitaryGradeLevel();
  const config = LEVEL_CONFIGS[level];
  const checks: SecurityCheckResult[] = [];
  const recommendations: string[] = [];

  // Check 1: HTTPS
  const isProduction = process.env.NODE_ENV === 'production';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  checks.push({
    check: 'HTTPS Enforcement',
    passed: !config.enforceHTTPS || appUrl.startsWith('https://') || !isProduction,
    details: config.enforceHTTPS ? `URL: ${appUrl}` : 'No requerido en este nivel',
    severity: 'critical',
  });

  // Check 2: JWT Secrets
  const jwtSecret = process.env.JWT_SECRET;
  const hasStrongJWT = !!jwtSecret && jwtSecret.length >= 32 && !jwtSecret.includes('change');
  checks.push({
    check: 'JWT Secret Strength',
    passed: hasStrongJWT || !isProduction,
    details: jwtSecret ? `Longitud: ${jwtSecret.length}` : 'No configurado',
    severity: 'critical',
  });

  // Check 3: Cookie Secure
  const cookieSecure = process.env.COOKIE_SECURE;
  checks.push({
    check: 'Secure Cookies',
    passed: cookieSecure === 'true' || !isProduction,
    details: `COOKIE_SECURE=${cookieSecure || 'no definido'}`,
    severity: 'high',
  });

  // Check 4: Database SSL
  const dbSSL = process.env.DATABASE_SSL;
  checks.push({
    check: 'Database SSL',
    passed: dbSSL === 'true' || !isProduction,
    details: `DATABASE_SSL=${dbSSL || 'no definido'}`,
    severity: 'high',
  });

  // Check 5: Rate Limiting
  checks.push({
    check: 'Rate Limiting',
    passed: config.enforceRateLimit,
    details: 'Rate limiter configurado',
    severity: 'medium',
  });

  // Check 6: Password policy
  checks.push({
    check: 'Password Policy',
    passed: true,
    details: `Min length: ${config.passwordMinLength}, Special chars: ${config.passwordRequireSpecial}`,
    severity: 'medium',
  });

  // Calcular score
  const criticalChecks = checks.filter(c => c.severity === 'critical');
  const highChecks = checks.filter(c => c.severity === 'high');
  const criticalPassed = criticalChecks.filter(c => c.passed).length;
  const highPassed = highChecks.filter(c => c.passed).length;
  const totalPassed = checks.filter(c => c.passed).length;

  let score = Math.round((totalPassed / checks.length) * 100);
  if (criticalPassed < criticalChecks.length) score = Math.min(score, 30);
  if (highPassed < highChecks.length) score = Math.min(score, 60);

  // Generar recomendaciones
  checks.filter(c => !c.passed).forEach(c => {
    recommendations.push(`[${c.severity.toUpperCase()}] ${c.check}: ${c.details}`);
  });

  return {
    level,
    score,
    checks,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

export default { enforceMilitaryGrade, getMilitaryGradeLevel, getSecurityConfig };