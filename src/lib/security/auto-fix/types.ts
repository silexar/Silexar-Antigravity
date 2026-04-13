/**
 * Tipos compartidos para el sistema de auto-corrección de seguridad
 * @module SecurityAutoFix/Types
 */

/** Nivel de severidad de un problema */
export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/** Estado de una corrección */
export type FixStatus = 'pending' | 'applied' | 'failed' | 'skipped' | 'manual_review';

/** Tipo de problema detectado */
export type IssueType = 
  | 'console_sensitive_data'
  | 'as_any_cast'
  | 'unused_import'
  | 'unused_variable'
  | 'missing_validation'
  | 'hardcoded_secret'
  | 'insecure_random'
  | 'unsafe_regex'
  | 'prototype_pollution'
  | 'sql_injection_risk'
  | 'xss_vulnerability'
  | 'weak_crypto';

/** Información de un problema detectado */
export interface SecurityIssue {
  id: string;
  type: IssueType;
  severity: SeverityLevel;
  filePath: string;
  line: number;
  column: number;
  originalCode: string;
  message: string;
  suggestedFix?: string;
  confidence: number; // 0-1, probabilidad de que el fix sea correcto
  metadata?: Record<string, unknown>;
}

/** Resultado de aplicar una corrección */
export interface FixResult {
  issue: SecurityIssue;
  status: FixStatus;
  appliedFix?: string;
  error?: string;
  timestamp: Date;
  executionTimeMs: number;
}

/** Configuración del auto-fixer */
export interface AutoFixConfig {
  /** Directorios a escanear */
  include: string[];
  /** Directorios a ignorar */
  exclude: string[];
  /** Extensiones de archivo a procesar */
  extensions: string[];
  /** Auto-fix para severidad HIGH */
  autoFixHigh: boolean;
  /** Auto-fix para severidad MEDIUM */
  autoFixMedium: boolean;
  /** Auto-fix para severidad LOW */
  autoFixLow: boolean;
  /** Requerir confirmación para cambios */
  requireConfirmation: boolean;
  /** Crear backup antes de modificar */
  createBackup: boolean;
  /** Umbral de confianza mínimo (0-1) */
  minConfidenceThreshold: number;
  /** Habilitar aprendizaje automático */
  enableLearning: boolean;
  /** Ruta a la base de conocimiento */
  knowledgeBasePath?: string;
}

/** Estrategia de corrección */
export interface FixStrategy {
  name: string;
  description: string;
  severity: SeverityLevel;
  autoFixable: boolean;
  requiresConfirmation: boolean;
  detect: (filePath: string, content: string) => SecurityIssue[];
  fix: (issue: SecurityIssue, content: string) => string | null;
}

/** Patrón aprendido */
export interface LearnedPattern {
  id: string;
  issueType: IssueType;
  pattern: string; // Regex o string exacto
  context: string; // Contexto donde aplica
  fix: string; // Template del fix
  successCount: number;
  failureCount: number;
  createdAt: Date;
  lastUsed: Date;
  confidence: number;
}

/** Entrada del historial de correcciones */
export interface FixHistoryEntry {
  id: string;
  issueType: IssueType;
  filePath: string;
  originalCode: string;
  fixedCode: string;
  success: boolean;
  timestamp: Date;
  userFeedback?: 'positive' | 'negative' | 'neutral';
}

/** Estadísticas del sistema */
export interface AutoFixStatistics {
  totalIssues: number;
  fixedAutomatically: number;
  fixedManually: number;
  failed: number;
  skipped: number;
  pendingReview: number;
  issuesBySeverity: Record<SeverityLevel, number>;
  issuesByType: Record<IssueType, number>;
  averageFixTimeMs: number;
  successRate: number;
  timestamp: Date;
}

/** Reporte completo de auto-fix */
export interface AutoFixReport {
  id: string;
  timestamp: Date;
  durationMs: number;
  config: AutoFixConfig;
  results: FixResult[];
  statistics: AutoFixStatistics;
  filesModified: string[];
  filesCreated: string[];
  summary: string;
}

/** Opciones para el scanner */
export interface ScannerOptions {
  quickScan?: boolean;
  maxFileSize?: number; // bytes
  maxFiles?: number;
  parallelProcessing?: boolean;
  threads?: number;
}

/** Resultado del escaneo */
export interface ScanResult {
  filePath: string;
  issues: SecurityIssue[];
  scannedAt: Date;
  durationMs: number;
}

/** Contexto de corrección */
export interface FixContext {
  projectRoot: string;
  filePath: string;
  imports: string[];
  exports: string[];
  dependencies: string[];
  ast?: unknown; // AST si está disponible
}

/** Configuración de reglas personalizadas */
export interface CustomRule {
  id: string;
  name: string;
  pattern: string;
  severity: SeverityLevel;
  fixTemplate?: string;
  enabled: boolean;
}
