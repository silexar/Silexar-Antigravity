/**
 * Tests para SecurityLearning
 * @module SecurityAutoFix/Tests/SecurityLearning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecurityLearning } from '../SecurityLearning';
import type { SecurityIssue, IssueType } from '../types';

// Helper para crear issues de prueba
const createTestIssue = (type: IssueType, code: string): SecurityIssue => ({
  id: `test_${Date.now()}`,
  type,
  severity: 'MEDIUM',
  filePath: 'test.ts',
  line: 1,
  column: 1,
  originalCode: code,
  message: 'Test issue',
  confidence: 0.9,
});

describe('SecurityLearning', () => {
  let learning: SecurityLearning;

  beforeEach(() => {
    learning = new SecurityLearning({
      knowledgeBasePath: '.security/test-kb.json',
      historyPath: '.security/test-history.json',
    });
  });

  afterEach(async () => {
    await learning.reset();
  });

  describe('Inicialización', () => {
    it('debe inicializarse correctamente', async () => {
      await learning.initialize();
      const stats = await learning.getStatistics();
      expect(stats.totalPatterns).toBe(0);
    });
  });

  describe('Registro de correcciones', () => {
    it('debe registrar una corrección exitosa', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      
      await learning.recordSuccess(
        issue,
        issue.originalCode,
        'const x = y /* @ts-expect-error */;'
      );

      const stats = await learning.getStatistics();
      expect(stats.totalCorrections).toBe(1);
    });

    it('debe registrar una corrección fallida', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      
      await learning.recordFailure(issue, 'Error de sintaxis');

      const history = await learning.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].success).toBe(false);
    });
  });

  describe('Aprendizaje de patrones', () => {
    it('debe aprender de correcciones exitosas', async () => {
      const issue = createTestIssue('unused_import', "import { unused } from './mod';");
      
      await learning.recordSuccess(
        issue,
        issue.originalCode,
        '' // El fix elimina el import
      );

      const stats = await learning.getStatistics();
      expect(stats.totalPatterns).toBe(1);
    });

    it('debe incrementar confianza con éxitos repetidos', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      
      // Múltiples éxitos
      for (let i = 0; i < 5; i++) {
        await learning.recordSuccess(
          issue,
          issue.originalCode,
          'const x = y /* @ts-expect-error */;'
        );
      }

      const stats = await learning.getStatistics();
      expect(stats.averageConfidence).toBe(1); // 5/5 éxitos = 100%
    });

    it('debe disminuir confianza con fallos', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      
      // Éxito inicial
      await learning.recordSuccess(
        issue,
        issue.originalCode,
        'const x = y /* @ts-expect-error */;'
      );
      
      // Luego fallos
      await learning.recordFailure(issue, 'Error');
      await learning.recordFailure(issue, 'Error');

      const stats = await learning.getStatistics();
      expect(stats.averageConfidence).toBeLessThan(1);
    });
  });

  describe('Sugerencias', () => {
    it('debe sugerir fix aprendido', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      const fixedCode = 'const x = y /* @ts-expect-error */;';
      
      await learning.recordSuccess(issue, issue.originalCode, fixedCode);

      const suggestion = await learning.getSuggestion(issue);
      expect(suggestion).toBe(fixedCode);
    });

    it('debe retornar null si no hay patrón', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      
      const suggestion = await learning.getSuggestion(issue);
      expect(suggestion).toBeNull();
    });

    it('debe retornar null si confianza es baja', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      
      // Éxito inicial
      await learning.recordSuccess(
        issue,
        issue.originalCode,
        'const x = y /* @ts-expect-error */;'
      );
      
      // Muchos fallos
      for (let i = 0; i < 10; i++) {
        await learning.recordFailure(issue, 'Error');
      }

      const suggestion = await learning.getSuggestion(issue);
      expect(suggestion).toBeNull();
    });
  });

  describe('Estadísticas', () => {
    it('debe retornar estadísticas correctas', async () => {
      // Crear varios patrones
      const issues = [
        createTestIssue('as_any_cast', 'const x = y as unknown;'),
        createTestIssue('unused_import', "import { a } from 'b';"),
        createTestIssue('unused_variable', 'const unused = 1;'),
      ];

      for (const issue of issues) {
        await learning.recordSuccess(issue, issue.originalCode, 'fixed');
      }

      const stats = await learning.getStatistics();
      expect(stats.totalPatterns).toBe(3);
      expect(stats.totalCorrections).toBe(3);
      expect(stats.topPatterns.length).toBe(3);
    });
  });

  describe('Filtrado por tipo', () => {
    it('debe filtrar patrones por tipo de issue', async () => {
      const issue1 = createTestIssue('as_any_cast', 'const x = y as unknown;');
      const issue2 = createTestIssue('unused_import', "import { a } from 'b';");
      
      await learning.recordSuccess(issue1, issue1.originalCode, 'fixed');
      await learning.recordSuccess(issue2, issue2.originalCode, 'fixed');

      const asAnyPatterns = await learning.getPatternsByIssueType('as_any_cast');
      expect(asAnyPatterns.length).toBe(1);
      expect(asAnyPatterns[0].issueType).toBe('as_any_cast');
    });
  });

  describe('Historial', () => {
    it('debe retornar historial limitado', async () => {
      // Crear múltiples entradas
      for (let i = 0; i < 10; i++) {
        const issue = createTestIssue('as_any_cast', `const x${i} = y as unknown;`);
        await learning.recordSuccess(issue, issue.originalCode, 'fixed');
      }

      const history = await learning.getHistory({ limit: 5 });
      expect(history.length).toBe(5);
    });

    it('debe filtrar historial por tipo', async () => {
      const issue1 = createTestIssue('as_any_cast', 'const x = y as unknown;');
      const issue2 = createTestIssue('unused_import', "import { a } from 'b';");
      
      await learning.recordSuccess(issue1, issue1.originalCode, 'fixed');
      await learning.recordSuccess(issue2, issue2.originalCode, 'fixed');

      const history = await learning.getHistory({ issueType: 'as_any_cast' });
      expect(history.length).toBe(1);
      expect(history[0].issueType).toBe('as_any_cast');
    });
  });

  describe('Exportación e importación', () => {
    it('debe exportar base de conocimiento', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      await learning.recordSuccess(issue, issue.originalCode, 'fixed');

      const exported = await learning.exportKnowledgeBase();
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBeDefined();
      expect(parsed.patterns).toHaveLength(1);
    });

    it('debe importar base de conocimiento', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      await learning.recordSuccess(issue, issue.originalCode, 'fixed');

      const exported = await learning.exportKnowledgeBase();
      
      // Reset y reimportar
      await learning.reset();
      await learning.importKnowledgeBase(exported);

      const stats = await learning.getStatistics();
      expect(stats.totalPatterns).toBe(1);
    });
  });

  describe('Reset', () => {
    it('debe limpiar todos los datos', async () => {
      const issue = createTestIssue('as_any_cast', 'const x = y as unknown;');
      await learning.recordSuccess(issue, issue.originalCode, 'fixed');

      await learning.reset();

      const stats = await learning.getStatistics();
      expect(stats.totalPatterns).toBe(0);
      expect(stats.totalCorrections).toBe(0);
    });
  });
});
