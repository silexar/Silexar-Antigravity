/**
 * Sistema de Auto-Corrección de Seguridad - Silexar Pulse
 * @module SecurityAutoFix
 *
 * Exporta todos los componentes del sistema de auto-fix
 */

import { SecurityAutoFixer } from './SecurityAutoFixer';

// Tipos
export type {
  AutoFixConfig,
  SecurityIssue,
  FixResult,
  FixStrategy,
  LearnedPattern,
  FixHistoryEntry,
  AutoFixStatistics,
  AutoFixReport,
  ScannerOptions,
  ScanResult,
  FixContext,
  CustomRule,
  SeverityLevel,
  FixStatus,
  IssueType,
} from './types';

// Clases principales
export { SecurityAutoFixer, getSecurityAutoFixer } from './SecurityAutoFixer';
export type { AutoFixOperationResult } from './SecurityAutoFixer';

export { SecurityLearning, getSecurityLearning } from './SecurityLearning';

export { 
  AutoFixReportGenerator,
  type ReportOptions,
} from './AutoFixReport';

// Estrategias
export {
  FixStrategies,
  getAllStrategies,
  getStrategiesBySeverity,
  getStrategyByName,
  isAutoFixable,
} from './FixStrategies';

/** Versión del sistema */
export const VERSION = '1.0.0';

/** Descripción del sistema */
export const DESCRIPTION = 
  'Sistema de auto-corrección inteligente para issues de seguridad en Silexar Pulse';

/** Autor */
export const AUTHOR = 'Silexar Security Team';

/** 
 * Información del sistema 
 */
export const getSystemInfo = () => ({
  version: VERSION,
  description: DESCRIPTION,
  author: AUTHOR,
  features: [
    'Detección automática de issues de seguridad',
    'Corrección automática con aprendizaje',
    'Reportes detallados en múltiples formatos',
    'Sistema de aprendizaje de patrones',
    'Integración con CI/CD',
    'Backups automáticos',
  ],
  severityLevels: ['HIGH', 'MEDIUM', 'LOW'] as const,
  supportedIssueTypes: [
    'console_sensitive_data',
    'as_any_cast',
    'unused_import',
    'unused_variable',
    'missing_validation',
    'hardcoded_secret',
    'insecure_random',
    'unsafe_regex',
    'prototype_pollution',
    'sql_injection_risk',
    'xss_vulnerability',
    'weak_crypto',
  ] as const,
});

export default SecurityAutoFixer;
