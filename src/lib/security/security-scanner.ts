/**
 * 🔍 SILEXAR PULSE — Security Scanner
 * 
 * Escanea la configuración del sistema para detectar vulnerabilidades
 * y malas prácticas de seguridad.
 * 
 * @version 2026.3.0
 * @security OWASP A05 — Security Misconfiguration
 */

import { validateSecrets } from './secret-manager';
import { enforceMilitaryGrade } from './military-grade';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  remediation: string;
}

export interface ScanResult {
  vulnerabilities: Vulnerability[];
  score: number; // 0-100
  scannedAt: string;
  duration: number; // ms
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES
// ═══════════════════════════════════════════════════════════════

/**
 * Ejecutar escaneo completo de seguridad
 */
export async function scanSecurity(): Promise<ScanResult> {
  const startTime = performance.now();
  const vulnerabilities: Vulnerability[] = [];

  // 1. Verificar secretos
  const secretsResult = await validateSecrets();
  
  for (const missing of secretsResult.missing) {
    vulnerabilities.push({
      id: `SEC-SECRETS-${missing}`,
      severity: 'critical',
      category: 'Secrets Management',
      title: `Secret faltante: ${missing}`,
      description: `El secret ${missing} es requerido pero no está configurado en las variables de entorno.`,
      remediation: `Definir ${missing} en .env.local (desarrollo) o en variables de entorno del servidor (producción).`,
    });
  }

  for (const weak of secretsResult.weak) {
    vulnerabilities.push({
      id: `SEC-SECRETS-WEAK-${weak.split(':')[0]}`,
      severity: 'high',
      category: 'Secrets Management',
      title: `Secret débil: ${weak}`,
      description: `El secret está definido pero no cumple con los requisitos mínimos de seguridad.`,
      remediation: `Generar un secret más fuerte con: openssl rand -hex 32`,
    });
  }

  // 2. Verificar configuración de seguridad
  const gradeAssessment = enforceMilitaryGrade();
  
  for (const check of gradeAssessment.checks.filter(c => !c.passed)) {
    vulnerabilities.push({
      id: `SEC-CONFIG-${check.check.replace(/\s+/g, '-').toUpperCase()}`,
      severity: check.severity,
      category: 'Security Configuration',
      title: `Check fallido: ${check.check}`,
      description: check.details,
      remediation: `Configurar ${check.check} según nivel ${gradeAssessment.level}`,
    });
  }

  // 3. Verificar entorno
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && process.env.COOKIE_SECURE !== 'true') {
    vulnerabilities.push({
      id: 'SEC-ENV-COOKIE-INSECURE',
      severity: 'high',
      category: 'Environment',
      title: 'Cookies no securizadas en producción',
      description: 'COOKIE_SECURE no está en true en producción.',
      remediation: 'Definir COOKIE_SECURE=true en variables de producción.',
    });
  }

  if (isProduction && process.env.DATABASE_SSL !== 'true') {
    vulnerabilities.push({
      id: 'SEC-ENV-DB-NO-SSL',
      severity: 'high',
      category: 'Environment',
      title: 'Base de datos sin SSL en producción',
      description: 'DATABASE_SSL no está activado en producción.',
      remediation: 'Definir DATABASE_SSL=true y configurar certificados.',
    });
  }

  // Calcular score
  const weights = { critical: 25, high: 15, medium: 5, low: 2, info: 0 };
  const totalPenalty = vulnerabilities.reduce((sum, v) => sum + weights[v.severity], 0);
  const score = Math.max(0, 100 - totalPenalty);

  const summary = {
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length,
    info: vulnerabilities.filter(v => v.severity === 'info').length,
  };

  return {
    vulnerabilities,
    score,
    scannedAt: new Date().toISOString(),
    duration: performance.now() - startTime,
    summary,
  };
}

export default { scanSecurity };