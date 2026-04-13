/**
 * Tests para SecurityAutoFixer
 * @module SecurityAutoFix/Tests/SecurityAutoFixer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SecurityAutoFixer } from '../SecurityAutoFixer';
import { promises as fs } from 'fs';
import { resolve } from 'path';

// Mock de fs
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
  },
}));

// Mock de glob
vi.mock('glob', () => ({
  glob: vi.fn(),
}));

import { glob } from 'glob';

describe('SecurityAutoFixer', () => {
  let fixer: SecurityAutoFixer;

  beforeEach(() => {
    vi.resetAllMocks();
    fixer = new SecurityAutoFixer({
      include: ['src/**/*.ts'],
      exclude: [],
      autoFixHigh: true,
      autoFixLow: true,
      createBackup: false,
      enableLearning: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Inicialización', () => {
    it('debe crear instancia con config por defecto', () => {
      const defaultFixer = new SecurityAutoFixer();
      expect(defaultFixer).toBeDefined();
    });

    it('debe permitir configuración personalizada', () => {
      const customFixer = new SecurityAutoFixer({
        autoFixHigh: false,
        minConfidenceThreshold: 0.9,
      });
      expect(customFixer).toBeDefined();
    });
  });

  describe('Escaneo', () => {
    it('debe escanear archivos y encontrar issues', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `
        function test() {
          const x = data as any;
        }
      `;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const results = await fixer.scan();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].issues.length).toBeGreaterThan(0);
    });

    it('debe respetar patrones de exclusión', async () => {
      const mockFiles = ['src/test.ts', 'node_modules/pkg/index.ts'];
      
      vi.mocked(glob).mockImplementation(async (pattern) => {
        if (pattern === 'src/**/*.ts') return ['src/test.ts'];
        return mockFiles;
      });

      const results = await fixer.scan();
      
      expect(results.every(r => !r.filePath.includes('node_modules'))).toBe(true);
    });

    it('debe manejar errores de lectura', async () => {
      vi.mocked(glob).mockResolvedValue(['src/test.ts']);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      const results = await fixer.scan();

      expect(results.length).toBe(0);
    });
  });

  describe('Ejecución de fixes', () => {
    it('debe ejecutar en modo dry-run sin modificar archivos', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `const x = data as any;`;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await fixer.run({ dryRun: true });

      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(result.issuesFixed).toBeGreaterThan(0);
    });

    it('debe aplicar fixes cuando no es dry-run', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `const x = data as any;`;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await fixer.run({ dryRun: false });

      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('debe generar reporte', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `const x = data as any;`;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await fixer.run({ reportFormat: 'json' });

      expect(result.report).toBeDefined();
      expect(result.report.length).toBeGreaterThan(0);
    });
  });

  describe('Verificación', () => {
    it('debe verificar issues sin aplicar fixes', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `const x = data as any;`;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await fixer.check();

      expect(result.hasIssues).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('debe retornar hasIssues false cuando no hay issues', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `const x = 1;`; // Código limpio

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await fixer.check();

      expect(result.hasIssues).toBe(false);
    });
  });

  describe('Backups', () => {
    it('debe crear backups cuando está habilitado', async () => {
      const fixerWithBackup = new SecurityAutoFixer({
        include: ['src/**/*.ts'],
        createBackup: true,
        autoFixHigh: true,
      });

      const mockFiles = ['src/test.ts'];
      const mockContent = `console.log(password, user);`;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await fixerWithBackup.run({ dryRun: false });

      expect(fs.writeFile).toHaveBeenCalled();
      // El backup se escribe con extensión .backup-
      const backupCalls = vi.mocked(fs.writeFile).mock.calls.filter(
        call => call[0].toString().includes('.backup-')
      );
      expect(backupCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Filtrado por severidad', () => {
    it('debe filtrar fixes por severidad', async () => {
      const mockFiles = ['src/test.ts'];
      const mockContent = `
        // HIGH
        const x = data as any; // MEDIUM
      `;

      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      // Solo HIGH
      const highFixer = new SecurityAutoFixer({
        include: ['src/**/*.ts'],
        autoFixHigh: true,
        autoFixMedium: false,
        autoFixLow: false,
      });

      const result = await highFixer.run({ severity: ['HIGH'] });
      
      // Solo debería contar HIGH issues
      const report = JSON.parse(result.report);
      expect(report.statistics.issuesBySeverity.MEDIUM).toBe(0);
    });
  });

  describe('Limpieza de backups', () => {
    it('debe eliminar backups antiguos', async () => {
      const mockFiles = ['src/test.ts.backup-1234567890'];
      
      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.stat).mockResolvedValue({
        mtime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 horas atrás
      } as unknown);

      const cleaned = await fixer.cleanupBackups(24);

      expect(cleaned).toBe(1);
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('no debe eliminar backups recientes', async () => {
      const mockFiles = ['src/test.ts.backup-1234567890'];
      
      vi.mocked(glob).mockResolvedValue(mockFiles);
      vi.mocked(fs.stat).mockResolvedValue({
        mtime: new Date(), // Ahora
      } as unknown);

      const cleaned = await fixer.cleanupBackups(24);

      expect(cleaned).toBe(0);
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });
});
