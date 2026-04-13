/**
 * Tests para AutoFixReport
 * @module SecurityAutoFix/Tests/AutoFixReport
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AutoFixReportGenerator } from '../AutoFixReport';
import type { FixResult, AutoFixConfig, SecurityIssue } from '../types';

// Helpers
const createMockIssue = (overrides: Partial<SecurityIssue> = {}): SecurityIssue => ({
  id: `issue_${Math.random().toString(36).substr(2, 9)}`,
  type: 'console_sensitive_data',
  severity: 'HIGH',
  filePath: 'src/test.ts',
  line: 10,
  column: 5,
  originalCode: '',
  message: 'Test issue',
  confidence: 0.9,
  ...overrides,
});

const createMockResult = (overrides: Partial<FixResult> = {}): FixResult => ({
  issue: createMockIssue(),
  status: 'applied',
  appliedFix: 'auditLogger.security("REDACTED");',
  timestamp: new Date(),
  executionTimeMs: 50,
  ...overrides,
});

const mockConfig: AutoFixConfig = {
  include: ['src/**/*.ts'],
  exclude: ['node_modules'],
  extensions: ['.ts'],
  autoFixHigh: true,
  autoFixMedium: false,
  autoFixLow: true,
  requireConfirmation: false,
  createBackup: true,
  minConfidenceThreshold: 0.75,
  enableLearning: true,
};

describe('AutoFixReportGenerator', () => {
  let generator: AutoFixReportGenerator;
  let results: FixResult[];
  let startTime: Date;

  beforeEach(() => {
    startTime = new Date();
    results = [
      createMockResult({ status: 'applied' }),
      createMockResult({ 
        status: 'applied',
        issue: createMockIssue({ 
          type: 'as_any_cast',
          severity: 'MEDIUM',
          filePath: 'src/other.ts'
        })
      }),
      createMockResult({ 
        status: 'failed',
        error: 'Error de sintaxis',
        issue: createMockIssue({ severity: 'LOW' })
      }),
      createMockResult({ 
        status: 'manual_review',
        issue: createMockIssue({ type: 'sql_injection_risk' })
      }),
    ];
    generator = new AutoFixReportGenerator(mockConfig, results, startTime);
  });

  describe('Generación básica', () => {
    it('debe generar reporte en formato JSON', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.id).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.statistics.totalIssues).toBe(4);
    });

    it('debe generar reporte en formato Markdown', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'markdown'
      });
      const markdown = generator.export();
      
      expect(markdown).toContain('# Reporte de Auto-Corrección');
      expect(markdown).toContain('Total de issues detectados:');
    });

    it('debe generar reporte en formato Console', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'console'
      });
      const console = generator.export();
      
      expect(console).toContain('SECURITY AUTO-FIX REPORT');
      expect(console).toContain('TOTAL ISSUES:');
    });

    it('debe generar reporte en formato HTML', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'html'
      });
      const html = generator.export();
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Reporte de Auto-Corrección');
    });
  });

  describe('Estadísticas', () => {
    it('debe calcular estadísticas correctamente', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.statistics.totalIssues).toBe(4);
      expect(parsed.statistics.fixedAutomatically).toBe(2);
      expect(parsed.statistics.failed).toBe(1);
      expect(parsed.statistics.pendingReview).toBe(1);
    });

    it('debe calcular tasa de éxito', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      // 2 aplicados de 4 totales = 50%
      expect(parsed.statistics.successRate).toBe(0.5);
    });

    it('debe agrupar por severidad', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.statistics.issuesBySeverity.HIGH).toBe(2);
      expect(parsed.statistics.issuesBySeverity.MEDIUM).toBe(1);
      expect(parsed.statistics.issuesBySeverity.LOW).toBe(1);
    });
  });

  describe('Filtrado', () => {
    it('debe filtrar por severidad mínima', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json',
        minSeverity: 'MEDIUM'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      // LOW debería ser filtrado
      expect(parsed.statistics.totalIssues).toBe(3);
    });

    it('debe filtrar solo errores', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json',
        errorsOnly: true
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.statistics.totalIssues).toBe(1);
      expect(parsed.results[0].status).toBe('failed');
    });
  });

  describe('Archivos modificados', () => {
    it('debe listar archivos modificados', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'json'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.filesModified).toContain('src/test.ts');
      expect(parsed.filesModified).toContain('src/other.ts');
      expect(parsed.filesModified.length).toBe(2);
    });
  });

  describe('Resumen', () => {
    it('debe generar resumen ejecutivo', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'markdown'
      });
      const markdown = generator.export();
      
      expect(markdown).toContain('## Resumen de Auto-Corrección');
      expect(markdown).toContain('Total de issues detectados:');
      expect(markdown).toContain('Corregidos automáticamente:');
    });
  });

  describe('Recomendaciones', () => {
    it('debe generar recomendaciones', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'markdown'
      });
      const markdown = generator.export();
      
      expect(markdown).toContain('## Recomendaciones');
    });

    it('debe sugerir revisión manual si hay issues HIGH', () => {
      const highResults = [
        createMockResult({ 
          issue: createMockIssue({ severity: 'HIGH' })
        }),
      ];
      generator = new AutoFixReportGenerator(mockConfig, highResults, startTime, {
        format: 'markdown'
      });
      const markdown = generator.export();
      
      expect(markdown).toContain('Prioridad Alta');
    });
  });

  describe('Inclusión de código', () => {
    it('debe incluir código si se solicita', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'markdown',
        includeCode: true
      });
      const markdown = generator.export();
      
      expect(markdown).toContain('Código original');
      expect(markdown).toContain('Código corregido');
    });

    it('no debe incluir código por defecto', () => {
      generator = new AutoFixReportGenerator(mockConfig, results, startTime, {
        format: 'markdown'
      });
      const markdown = generator.export();
      
      expect(markdown).not.toContain('Código original');
    });
  });

  describe('Reporte vacío', () => {
    it('debe manejar reporte sin resultados', () => {
      generator = new AutoFixReportGenerator(mockConfig, [], startTime, {
        format: 'json'
      });
      const json = generator.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.statistics.totalIssues).toBe(0);
      expect(parsed.statistics.successRate).toBe(0);
    });
  });
});
