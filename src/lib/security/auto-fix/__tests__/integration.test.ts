/**
 * Tests de integración del sistema de auto-fix
 * @module SecurityAutoFix/Tests/Integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { SecurityAutoFixer } from '../SecurityAutoFixer';
import { SecurityLearning } from '../SecurityLearning';

const TEST_DIR = resolve('.test-security-autofix');

describe('Integration Tests', () => {
  beforeAll(async () => {
    // Crear directorio de pruebas
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    // Limpiar
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignorar errores de limpieza
    }
  });

  describe('Flujo completo', () => {
    it('debe detectar, aprender y corregir issues', async () => {
      // Crear archivo de prueba con issues
      const testFile = join(TEST_DIR, 'test.ts');
      const badCode = `
function processUser(data: unknown) {
  const x = data as any;
  const unused = 'variable';
  return x;
}
`;
      await fs.writeFile(testFile, badCode, 'utf-8');

      // 1. Inicializar sistema
      const fixer = new SecurityAutoFixer({
        include: [join(TEST_DIR, '*.ts')],
        exclude: [],
        autoFixHigh: true,
        autoFixLow: true,
        enableLearning: true,
      });
      await fixer.initialize();

      // 2. Escanear
      const scanResults = await fixer.scan();
      expect(scanResults.length).toBeGreaterThan(0);
      expect(scanResults[0].issues.length).toBeGreaterThan(0);

      // 3. Aplicar fixes (dry-run)
      const result = await fixer.run({ dryRun: true });
      expect(result.issuesFixed).toBeGreaterThan(0);

      // 4. Verificar que se genera reporte
      expect(result.report).toBeDefined();
      expect(result.report.length).toBeGreaterThan(0);
    });

    it('debe aprender de correcciones y aplicarlas después', async () => {
      const learning = new SecurityLearning({
        knowledgeBasePath: join(TEST_DIR, 'kb.json'),
        historyPath: join(TEST_DIR, 'history.json'),
      });

      // Crear un patrón de aprendizaje
      const testIssue = {
        id: 'test-1',
        type: 'as_any_cast' as const,
        severity: 'MEDIUM' as const,
        filePath: 'test.ts',
        line: 1,
        column: 1,
        originalCode: 'const x = y as unknown;',
        message: 'Test',
        confidence: 0.9,
      };

      // Registrar éxito
      await learning.recordSuccess(
        testIssue,
        testIssue.originalCode,
        'const x = y /* @ts-expect-error */;'
      );

      // Verificar que aprendió
      const suggestion = await learning.getSuggestion(testIssue);
      expect(suggestion).toBe('const x = y /* @ts-expect-error */;');

      // Verificar estadísticas
      const stats = await learning.getStatistics();
      expect(stats.totalPatterns).toBe(1);
      expect(stats.averageConfidence).toBe(1);
    });
  });

  describe('Manejo de archivos', () => {
    it('debe crear backups antes de modificar', async () => {
      const testFile = join(TEST_DIR, 'backup-test.ts');
      const code = `console.log(password, user);`;
      await fs.writeFile(testFile, code, 'utf-8');

      const fixer = new SecurityAutoFixer({
        include: [testFile],
        exclude: [],
        autoFixHigh: true,
        createBackup: true,
        enableLearning: false,
      });

      await fixer.run({ dryRun: false });

      // Verificar que existe backup
      const files = await fs.readdir(TEST_DIR);
      const backups = files.filter(f => f.includes('.backup-'));
      expect(backups.length).toBeGreaterThan(0);
    });
  });

  describe('Reportes', () => {
    it('debe generar reportes en múltiples formatos', async () => {
      const testFile = join(TEST_DIR, 'report-test.ts');
      await fs.writeFile(testFile, ``, 'utf-8');

      const fixer = new SecurityAutoFixer({
        include: [testFile],
        exclude: [],
      });

      // JSON
      const jsonResult = await fixer.run({ reportFormat: 'json', dryRun: true });
      const jsonReport = JSON.parse(jsonResult.report);
      expect(jsonReport.id).toBeDefined();
      expect(jsonReport.statistics).toBeDefined();

      // Markdown
      const mdResult = await fixer.run({ reportFormat: 'markdown', dryRun: true });
      expect(mdResult.report).toContain('# Reporte');

      // HTML
      const htmlResult = await fixer.run({ reportFormat: 'html', dryRun: true });
      expect(htmlResult.report).toContain('<!DOCTYPE html>');
    });
  });
});
