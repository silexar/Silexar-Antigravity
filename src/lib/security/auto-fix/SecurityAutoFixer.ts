/**
 * Sistema de Auto-Corrección Inteligente de Seguridad
 * @module SecurityAutoFix/SecurityAutoFixer
 * 
 * Clase principal que coordina detección y corrección de issues de seguridad
 */

import { promises as fs } from 'fs';
import { resolve, relative } from 'path';
import { glob } from 'glob';
import type {
  AutoFixConfig,
  SecurityIssue,
  FixResult,
  FixStatus,
  ScanResult,
  ScannerOptions,
} from './types';
import { FixStrategies, getAllStrategies, isAutoFixable } from './FixStrategies';
import { SecurityLearning } from './SecurityLearning';
import { AutoFixReportGenerator, type ReportOptions } from './AutoFixReport';

/** Configuración por defecto */
const DEFAULT_CONFIG: AutoFixConfig = {
  include: ['src/**/*.{ts,tsx,js,jsx}'],
  exclude: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'coverage/**',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/__tests__/**',
    '**/__mocks__/**',
  ],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  autoFixHigh: true,
  autoFixMedium: false,
  autoFixLow: true,
  requireConfirmation: false,
  createBackup: true,
  minConfidenceThreshold: 0.75,
  enableLearning: true,
};

/** Resultado de una operación de auto-fix */
export interface AutoFixOperationResult {
  success: boolean;
  report: string;
  filesModified: string[];
  issuesFixed: number;
  issuesFailed: number;
  durationMs: number;
}

/**
 * Clase principal del sistema de auto-corrección de seguridad
 */
export class SecurityAutoFixer {
  private config: AutoFixConfig;
  private learning: SecurityLearning;
  private results: FixResult[] = [];
  private startTime: Date;

  constructor(config: Partial<AutoFixConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.learning = new SecurityLearning({
      knowledgeBasePath: this.config.knowledgeBasePath,
    });
    this.startTime = new Date();
  }

  /**
   * Inicializa el sistema de auto-fix
   */
  async initialize(): Promise<void> {
    if (this.config.enableLearning) {
      await this.learning.initialize();
    }
  }

  /**
   * Escanea archivos en busca de issues de seguridad
   */
  async scan(options: ScannerOptions = {}): Promise<ScanResult[]> {
    const files = await this.getFilesToScan();
    const results: ScanResult[] = [];

    // Procesar en paralelo con límite
    const batchSize = options.threads ?? 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => this.scanFile(file, options))
      );
      results.push(...batchResults);
    }

    return results.filter(r => r.issues.length > 0);
  }

  /**
   * Escanea un archivo individual
   */
  private async scanFile(
    filePath: string,
    options: ScannerOptions
  ): Promise<ScanResult> {
    const scanStart = Date.now();
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Verificar tamaño máximo
      if (options.maxFileSize && content.length > options.maxFileSize) {
        return {
          filePath,
          issues: [],
          scannedAt: new Date(),
          durationMs: Date.now() - scanStart,
        };
      }

      const issues: SecurityIssue[] = [];
      const strategies = options.quickScan 
        ? FixStrategies.HIGH 
        : getAllStrategies();

      for (const strategy of strategies) {
        try {
          const detected = strategy.detect(filePath, content);
          issues.push(...detected);
        } catch (error) {
          }
      }

      return {
        filePath,
        issues,
        scannedAt: new Date(),
        durationMs: Date.now() - scanStart,
      };
    } catch (error) {
      return {
        filePath,
        issues: [],
        scannedAt: new Date(),
        durationMs: Date.now() - scanStart,
      };
    }
  }

  /**
   * Obtiene lista de archivos a escanear
   */
  private async getFilesToScan(): Promise<string[]> {
    const files: string[] = [];
    
    for (const pattern of this.config.include) {
      const matches = await glob(pattern, {
        ignore: this.config.exclude,
        absolute: true,
      });
      files.push(...matches);
    }

    // Eliminar duplicados y filtrar por extensión
    return [...new Set(files)].filter(file =>
      this.config.extensions.some(ext => file.endsWith(ext))
    );
  }

  /**
   * Ejecuta auto-fix en todos los archivos
   */
  async run(options: {
    dryRun?: boolean;
    severity?: ('HIGH' | 'MEDIUM' | 'LOW')[];
    reportFormat?: ReportOptions['format'];
    reportPath?: string;
  } = {}): Promise<AutoFixOperationResult> {
    this.startTime = new Date();
    this.results = [];

    await this.initialize();

    // Escanear
    const scanResults = await this.scan();
    // Agrupar issues
    const allIssues = scanResults.flatMap(r => r.issues);
    // Filtrar por severidad si se especifica
    const issuesToFix = options.severity
      ? allIssues.filter(i => options.severity?.includes(i.severity))
      : allIssues;

    // Aplicar fixes
    for (const issue of issuesToFix) {
      const result = await this.fixIssue(issue, options.dryRun ?? false);
      this.results.push(result);
    }

    // Generar reporte
    const report = await this.generateReport(options.reportFormat);

    // Guardar reporte si se especifica ruta
    if (options.reportPath) {
      await this.saveReport(options.reportPath, options.reportFormat);
    }

    const durationMs = Date.now() - this.startTime.getTime();
    const filesModified = [...new Set(
      this.results
        .filter(r => r.status === 'applied')
        .map(r => r.issue.filePath)
    )];

    return {
      success: this.results.every(r => r.status !== 'failed'),
      report,
      filesModified,
      issuesFixed: this.results.filter(r => r.status === 'applied').length,
      issuesFailed: this.results.filter(r => r.status === 'failed').length,
      durationMs,
    };
  }

  /**
   * Corrige un issue específico
   */
  private async fixIssue(
    issue: SecurityIssue,
    dryRun: boolean
  ): Promise<FixResult> {
    const fixStart = Date.now();
    let status: FixStatus = 'pending';
    let appliedFix: string | undefined;
    let error: string | undefined;

    try {
      // Verificar si es auto-fixeable
      if (!isAutoFixable(issue.type)) {
        status = 'manual_review';
        return {
          issue,
          status,
          timestamp: new Date(),
          executionTimeMs: Date.now() - fixStart,
        };
      }

      // Verificar umbral de confianza
      if (issue.confidence < this.config.minConfidenceThreshold) {
        status = 'manual_review';
        return {
          issue,
          status,
          timestamp: new Date(),
          executionTimeMs: Date.now() - fixStart,
        };
      }

      // Verificar configuración de auto-fix por severidad
      const shouldAutoFix = {
        HIGH: this.config.autoFixHigh,
        MEDIUM: this.config.autoFixMedium,
        LOW: this.config.autoFixLow,
      }[issue.severity];

      if (!shouldAutoFix) {
        status = 'manual_review';
        return {
          issue,
          status,
          timestamp: new Date(),
          executionTimeMs: Date.now() - fixStart,
        };
      }

      // Intentar obtener fix del sistema de aprendizaje
      let fixContent = await this.learning.getSuggestion(issue);

      // Si no hay sugerencia, usar estrategia
      if (!fixContent) {
        const strategies = getAllStrategies();
        const strategy = strategies.find(s => {
          const typeMap: Record<string, string> = {
            console_sensitive_data: 'console-sensitive-data',
            as_any_cast: 'as-any-cast',
            unused_import: 'unused-imports',
            unused_variable: 'unused-variables',
            hardcoded_secret: 'hardcoded-secret',
            insecure_random: 'insecure-random',
            weak_crypto: 'weak-crypto',
          };
          return s.name === typeMap[issue.type];
        });

        if (strategy) {
          const content = await fs.readFile(issue.filePath, 'utf-8');
          fixContent = strategy.fix(issue, content);
        }
      }

      if (!fixContent) {
        status = 'failed';
        error = 'No se pudo generar corrección';
      } else if (dryRun) {
        status = 'pending';
        appliedFix = fixContent;
      } else {
        // Crear backup si está habilitado
        if (this.config.createBackup) {
          await this.createBackup(issue.filePath);
        }

        // Aplicar fix
        await fs.writeFile(issue.filePath, fixContent, 'utf-8');
        status = 'applied';
        appliedFix = fixContent;

        // Registrar éxito en sistema de aprendizaje
        if (this.config.enableLearning) {
          const originalContent = await fs.readFile(issue.filePath, 'utf-8');
          await this.learning.recordSuccess(
            issue,
            issue.originalCode,
            fixContent,
            { filePath: issue.filePath }
          );
        }
      }
    } catch (err) {
      status = 'failed';
      error = err instanceof Error ? err.message : String(err);

      // Registrar fallo
      if (this.config.enableLearning) {
        await this.learning.recordFailure(issue, error);
      }
    }

    return {
      issue,
      status,
      appliedFix,
      error,
      timestamp: new Date(),
      executionTimeMs: Date.now() - fixStart,
    };
  }

  /**
   * Crea backup de un archivo
   */
  private async createBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    const content = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, content, 'utf-8');
  }

  /**
   * Genera reporte de la operación
   */
  private async generateReport(
    format: ReportOptions['format'] = 'markdown'
  ): Promise<string> {
    const generator = new AutoFixReportGenerator(
      this.config,
      this.results,
      this.startTime,
      { format }
    );
    return generator.export();
  }

  /**
   * Guarda reporte a archivo
   */
  private async saveReport(
    outputPath: string,
    format: ReportOptions['format'] = 'markdown'
  ): Promise<void> {
    const generator = new AutoFixReportGenerator(
      this.config,
      this.results,
      this.startTime,
      { format }
    );
    await generator.saveToFile(outputPath);
  }

  /**
   * Verifica issues sin aplicar fixes
   */
  async check(): Promise<{
    hasIssues: boolean;
    issues: SecurityIssue[];
    summary: string;
  }> {
    const scanResults = await this.scan();
    const issues = scanResults.flatMap(r => r.issues);

    const summary = [
      `Total issues: ${issues.length}`,
      `HIGH: ${issues.filter(i => i.severity === 'HIGH').length}`,
      `MEDIUM: ${issues.filter(i => i.severity === 'MEDIUM').length}`,
      `LOW: ${issues.filter(i => i.severity === 'LOW').length}`,
    ].join(', ');

    return {
      hasIssues: issues.length > 0,
      issues,
      summary,
    };
  }

  /**
   * Obtiene estadísticas del sistema de aprendizaje
   */
  async getLearningStats(): Promise<{
    totalPatterns: number;
    totalCorrections: number;
    averageConfidence: number;
  } | null> {
    if (!this.config.enableLearning) return null;
    return this.learning.getStatistics();
  }

  /**
   * Exporta base de conocimiento
   */
  async exportKnowledgeBase(outputPath: string): Promise<void> {
    if (!this.config.enableLearning) {
      throw new Error('El sistema de aprendizaje no está habilitado');
    }
    const json = await this.learning.exportKnowledgeBase();
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  /**
   * Importa base de conocimiento
   */
  async importKnowledgeBase(inputPath: string): Promise<void> {
    if (!this.config.enableLearning) {
      throw new Error('El sistema de aprendizaje no está habilitado');
    }
    const json = await fs.readFile(inputPath, 'utf-8');
    await this.learning.importKnowledgeBase(json);
  }

  /**
   * Limpia backups antiguos
   */
  async cleanupBackups(maxAgeHours = 24): Promise<number> {
    const files = await glob('src/**/*.backup-*', { absolute: true });
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    let cleaned = 0;

    for (const file of files) {
      const stat = await fs.stat(file);
      if (now - stat.mtime.getTime() > maxAgeMs) {
        await fs.unlink(file);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Restaura archivos desde backup
   */
  async restoreFromBackup(filePath: string): Promise<boolean> {
    const backups = await glob(`${filePath}.backup-*`, { absolute: true });
    if (backups.length === 0) return false;

    // Ordenar por fecha (más reciente primero)
    backups.sort().reverse();
    const latestBackup = backups[0];

    const content = await fs.readFile(latestBackup, 'utf-8');
    await fs.writeFile(filePath, content, 'utf-8');
    
    return true;
  }
}

// Singleton para CLI
let globalFixer: SecurityAutoFixer | null = null;

export const getSecurityAutoFixer = (
  config?: Partial<AutoFixConfig>
): SecurityAutoFixer => {
  if (!globalFixer) {
    globalFixer = new SecurityAutoFixer(config);
  }
  return globalFixer;
};

export default SecurityAutoFixer;
