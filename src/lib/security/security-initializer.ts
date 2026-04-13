/**
 * 🚀 SILEXAR PULSE — Security Initializer
 * 
 * Punto de entrada para inicializar todos los subsistemas de seguridad.
 * Ejecutar al arranque de la aplicación.
 * 
 * @version 2026.3.0
 */

import { SecurityFoundation } from './security-foundation';
import { logger } from '@/lib/observability';
import { scanSecurity } from './security-scanner';
import { validateSecrets } from './secret-manager';
import { enforceMilitaryGrade, getMilitaryGradeLevel } from './military-grade';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SecurityResult {
  initialized: boolean;
  level: string;
  score: number;
  criticalIssues: number;
  warnings: string[];
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Inicializar todo el sistema de seguridad
 */
export async function initializeSecurity(): Promise<SecurityResult> {
  const startTime = performance.now();
  const warnings: string[] = [];

  try {
    // 1. Inicializar Security Foundation
    const foundationStatus = await SecurityFoundation.initialize();
    
    if (!foundationStatus.secretsValid) {
      warnings.push(`Secrets inválidos: ${foundationStatus.missingSecrets.join(', ')}`);
    }

    // 2. Ejecutar Military Grade Assessment
    const gradeAssessment = enforceMilitaryGrade();
    
    if (gradeAssessment.recommendations.length > 0) {
      warnings.push(...gradeAssessment.recommendations);
    }

    // 3. Ejecutar scan de seguridad
    const scanResult = await scanSecurity();

    // 4. Validate secrets and add to warnings if needed
    const secretsResult = await validateSecrets();
    if (secretsResult.warnings.length > 0) {
      warnings.push(...secretsResult.warnings);
    }

    const level = getMilitaryGradeLevel();
    const criticalIssues = scanResult.summary.critical;

    // Producción: fallar si hay issues críticos
    if (process.env.NODE_ENV === 'production' && criticalIssues > 0) {
      logger.error(`SECURITY: ${criticalIssues} critical issues detected`, new Error('Critical security issues found'), { count: criticalIssues });
    }

    const result: SecurityResult = {
      initialized: true,
      level,
      score: scanResult.score,
      criticalIssues,
      warnings,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      const duration = (performance.now() - startTime).toFixed(1);
      }

    return result;
  } catch (error) {
    logger.error('❌ Security initialization failed:', error instanceof Error ? error as Error : undefined);
    return {
      initialized: false,
      level: 'UNKNOWN',
      score: 0,
      criticalIssues: -1,
      warnings: [`Initialization failed: ${(error as Error).message}`],
      timestamp: new Date().toISOString(),
    };
  }
}

export default { initializeSecurity };