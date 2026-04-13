/**
 * Ejemplos de uso del Sistema de Auto-Corrección de Seguridad
 * @module SecurityAutoFix/Examples
 */

/* eslint-disable no-console */

import {
  SecurityAutoFixer,
  SecurityLearning,
  FixStrategies,
  getAllStrategies,
} from '../index';

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 1: Uso Básico
// ═══════════════════════════════════════════════════════════════

export async function ejemploBasico(): Promise<void> {
  // Crear instancia con configuración por defecto
  const fixer = new SecurityAutoFixer();

  // Inicializar
  await fixer.initialize();

  // Escanear archivos
  const scanResults = await fixer.scan();

  for (const scanResult of scanResults) {
    console.log(`Found issues in: ${scanResult.filePath}`);
  }

  // Aplicar correcciones
  const result = await fixer.run({
    dryRun: false,           // Aplicar cambios reales
    reportFormat: 'console', // Formato de reporte
  });

  console.log(`Auto-fix complete: ${result.issuesFixed} issues fixed`);
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 2: Configuración Personalizada
// ═══════════════════════════════════════════════════════════════

export async function ejemploConfiguracionPersonalizada(): Promise<void> {
  const fixer = new SecurityAutoFixer({
    // Directorios específicos
    include: ['src/lib/**/*.ts', 'api/**/*.ts'],
    
    // Ignorar tests y mocks
    exclude: [
      '**/*.test.ts',
      '**/__tests__/**',
      '**/__mocks__/**',
    ],
    
    // Comportamiento por severidad
    autoFixHigh: true,    // Auto-fix HIGH
    autoFixMedium: false, // Solo sugerir MEDIUM
    autoFixLow: true,     // Auto-fix LOW
    
    // Opciones avanzadas
    requireConfirmation: true,    // Preguntar antes de aplicar
    createBackup: true,           // Crear backups
    minConfidenceThreshold: 0.8,  // 80% de confianza mínima
    enableLearning: true,         // Aprender de correcciones
  });

  await fixer.initialize();
  const result = await fixer.run({ dryRun: true });

  console.log(`Dry run complete: ${result.issuesFixed} issues would be fixed`);
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 3: Sistema de Aprendizaje
// ═══════════════════════════════════════════════════════════════

export async function ejemploAprendizaje(): Promise<void> {
  const learning = new SecurityLearning({
    knowledgeBasePath: '.security/kb.json',
    historyPath: '.security/history.json',
  });

  await learning.initialize();

  // Simular una corrección exitosa
  const mockIssue = {
    id: 'example-1',
    type: 'as_any_cast' as const,
    severity: 'MEDIUM' as const,
    filePath: 'src/example.ts',
    line: 10,
    column: 5,
    originalCode: 'const data = response as unknown;',
    message: 'Uso de as unknown',
    confidence: 0.95,
  };

  // Registrar éxito
  await learning.recordSuccess(
    mockIssue,
    mockIssue.originalCode,
    'const data = response /* @ts-expect-error */;'
  );

  // Obtener sugerencia
  const suggestion = await learning.getSuggestion(mockIssue);
  console.log(`Suggestion: ${suggestion}`);

  // Ver estadísticas
  const stats = await learning.getStatistics();
  console.log(`Total patterns: ${stats.totalPatterns}`);
  console.log(`Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);

  // Top patrones
  stats.topPatterns.forEach((p, i) => {
    console.log(`${i + 1}. ${p.issueType} (${(p.confidence * 100).toFixed(0)}%)`);
  });
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 4: Generación de Reportes
// ═══════════════════════════════════════════════════════════════

export async function ejemploReportes(): Promise<void> {
  const fixer = new SecurityAutoFixer();
  await fixer.initialize();

  // Ejecutar y generar reporte
  const _result = await fixer.run({
    dryRun: true,
    reportFormat: 'markdown',
    reportPath: 'security-report.md',
  });

  // Diferentes formatos
  const formats = ['json', 'html', 'console'] as const;
  
  for (const format of formats) {
    const _formatResult = await fixer.run({
      dryRun: true,
      reportFormat: format,
      reportPath: `security-report.${format === 'html' ? 'html' : format === 'json' ? 'json' : 'txt'}`,
    });
    console.log(`Report generated in ${format} format`);
  }
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 5: Uso en CI/CD
// ═══════════════════════════════════════════════════════════════

export async function ejemploCI(): Promise<void> {
  const fixer = new SecurityAutoFixer({
    include: ['src/**/*.ts'],
    autoFixHigh: false, // En CI solo verificamos
  });

  // Verificar sin aplicar cambios
  const { hasIssues, issues, summary: _summary } = await fixer.check();

  if (hasIssues) {
    const highIssues = issues.filter(i => i.severity === 'HIGH');
    if (highIssues.length > 0) {
      process.exit(1); // Fallar el build
    }
  } else {
    process.exit(0);
  }
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 6: Estrategias de Corrección
// ═══════════════════════════════════════════════════════════════

export function ejemploEstrategias(): void {
  // Obtener todas las estrategias
  const allStrategies = getAllStrategies();
  // Agrupar por severidad
  const bySeverity = {
    HIGH: FixStrategies.HIGH,
    MEDIUM: FixStrategies.MEDIUM,
    LOW: FixStrategies.LOW,
  };

  for (const [severity, strategies] of Object.entries(bySeverity)) {
    console.log(`${severity}:`);
    strategies.forEach(s => {
      const icon = s.autoFixable ? '🤖' : '👤';
      console.log(`  ${icon} ${s.name}`);
    });
  }

  // Ejemplo de detección manual
  const code = `
    function test() {
      const x = data as unknown;
    }
  `;

  for (const strategy of allStrategies.slice(0, 3)) {
    const issues = strategy.detect('example.ts', code);
    if (issues.length > 0) {
      issues.forEach(issue => {
        console.log(`Found issue: ${issue.message}`);
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 7: Gestión de Backups
// ═══════════════════════════════════════════════════════════════

export async function ejemploBackups(): Promise<void> {
  const fixer = new SecurityAutoFixer({
    createBackup: true,
  });

  // Después de aplicar fixes, limpiar backups antiguos
  const _cleaned = await fixer.cleanupBackups(24); // Eliminar > 24h
  // Restaurar un archivo desde backup
  const restored = await fixer.restoreFromBackup('src/example.ts');
  if (restored) {
    console.log('File restored successfully');
  } else {
    console.log('No backup found for file');
  }
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 8: Exportar/Importar Base de Conocimiento
// ═══════════════════════════════════════════════════════════════

export async function ejemploExportImport(): Promise<void> {
  const fixer = new SecurityAutoFixer({
    enableLearning: true,
  });
  await fixer.initialize();

  // Exportar
  await fixer.exportKnowledgeBase('.security/kb-export.json');
  // Importar (útil para compartir entre equipos)
  await fixer.importKnowledgeBase('.security/kb-export.json');
  console.log('Knowledge base imported successfully');
}

// ═══════════════════════════════════════════════════════════════
// EJECUTAR TODOS LOS EJEMPLOS
// ═══════════════════════════════════════════════════════════════

export async function ejecutarTodosLosEjemplos(): Promise<void> {
  console.log('=== Running Security AutoFix Examples ===\n');
  console.log('Running strategies example...\n');

  try {
    await ejemploEstrategias();
    console.log('\nStrategies example completed successfully.\n');

    // Estos requieren sistema de archivos
    // await ejemploBasico();
    // await ejemploConfiguracionPersonalizada();
    // await ejemploAprendizaje();
    // await ejemploReportes();
    // await ejemploBackups();
    // await ejemploExportImport();

    console.log('All examples completed.');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  ejecutarTodosLosEjemplos();
}

export default {
  ejemploBasico,
  ejemploConfiguracionPersonalizada,
  ejemploAprendizaje,
  ejemploReportes,
  ejemploCI,
  ejemploEstrategias,
  ejemploBackups,
  ejemploExportImport,
  ejecutarTodosLosEjemplos,
};
