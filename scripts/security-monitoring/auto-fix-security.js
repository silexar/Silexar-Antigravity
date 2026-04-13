#!/usr/bin/env node
/**
 * @fileoverview Auto-Fix Security Issues
 * 
 * Script de auto-corrección de problemas menores de seguridad:
 * - Eliminar console.log de debug
 * - Formatear código con prettier (si está disponible)
 * - Agregar validaciones simples faltantes
 * 
 * IMPORTANTE: No modifica lógica de negocio, solo estilo/debug.
 * Crea un reporte de todos los cambios aplicados.
 * 
 * Uso:
 *   node scripts/security-monitoring/auto-fix-security.js
 *   npm run security:fix (configurado en package.json)
 * 
 * Opciones:
 *   --dry-run    : Solo mostrar cambios sin aplicarlos
 *   --verbose    : Mostrar información detallada
 *   --no-format  : No ejecutar prettier después de los cambios
 * 
 * @author SILEXAR Security Team
 * @version 1.0.0
 * @cross-platform Windows/Mac/Linux
 */

import { promises as fs, access } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, relative } from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  // Directorios a procesar
  scanDirs: [
    'src/app',
    'src/components',
    'src/lib',
    'src/cortex',
    'src/modules',
    'src/utils'
  ],
  
  // Extensiones de archivos a procesar
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Patrones de console.log a eliminar/reemplazar
  consolePatterns: [
    { pattern: /console\.log\s*\([^)]*\)\s*;?/g, replacement: '' },
    { pattern: /console\.debug\s*\([^)]*\)\s*;?/g, replacement: '' },
    { pattern: /console\.trace\s*\([^)]*\)\s*;?/g, replacement: '' },
    { pattern: /console\.info\s*\([^)]*\)\s*;?/g, replacement: '' },
    { pattern: /console\.warn\s*\([^)]*\)\s*;?/g, replacement: '' }
  ],
  
  // Archivos a excluir
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'coverage',
    '__tests__',
    '.test.',
    '.spec.',
    '.stories.',
    'observability.ts',
    'logger.ts'
  ],
  
  // Plantilla de validación simple para API routes
  validationTemplate: `import { z } from 'zod';

// Schema de validación para esta ruta
const RequestSchema = z.object({
  // TODO: Definir schema según los requerimientos
}).strict();
`,
  
  // Colores para terminal
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
  },
  
  // Reporte
  reportFile: 'security-fix-report.json'
};

// ============================================
// UTILIDADES
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..', '..');

const c = (color, text) => `${CONFIG.colors[color] || ''}${text}${CONFIG.colors.reset}`;

// Parsear argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    noFormat: args.includes('--no-format'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// Verificar si prettier está disponible
async function hasPrettier() {
  try {
    await access(join(rootDir, 'node_modules/.bin/prettier'));
    return true;
  } catch {
    return false;
  }
}

// Obtener archivos recursivamente
async function getFiles(dir, extensions) {
  const files = [];
  
  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!CONFIG.excludePatterns.some(p => entry.name.includes(p))) {
          await traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = entry.name.slice(entry.name.lastIndexOf('.'));
        if (extensions.includes(ext) && 
            !CONFIG.excludePatterns.some(p => entry.name.includes(p))) {
          files.push(fullPath);
        }
      }
    }
  }
  
  try {
    await traverse(dir);
  } catch (e) {
    // Directorio no existe
  }
  
  return files;
}

// ============================================
// CORRECCIONES DE SEGURIDAD
// ============================================

// Fix 1: Eliminar console.logs de debug
async function fixConsoleLogs(content, filepath) {
  let newContent = content;
  const changes = [];
  
  // No procesar archivos de logging
  if (filepath.includes('observability') || filepath.includes('logger')) {
    return { content, changes };
  }
  
  for (const { pattern, replacement } of CONFIG.consolePatterns) {
    const matches = newContent.match(pattern);
    if (matches) {
      changes.push({
        type: 'console.log',
        count: matches.length,
        lines: matches.map(m => {
          const lineIndex = content.substring(0, content.indexOf(m)).split('\n').length;
          return lineIndex;
        })
      });
      newContent = newContent.replace(pattern, replacement);
    }
  }
  
  // Limpiar líneas vacías múltiples
  const originalContent = newContent;
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (originalContent !== newContent && changes.length > 0) {
    changes.push({ type: 'cleanup', description: 'Removed extra blank lines' });
  }
  
  return { content: newContent, changes };
}

// Fix 2: Verificar y sugerir validaciones
async function suggestValidations(content, filepath) {
  const suggestions = [];
  
  // Solo para archivos de API
  if (!filepath.includes('/api/') && !filepath.includes('route.ts')) {
    return suggestions;
  }
  
  // Verificar si ya tiene validación
  const hasValidation = 
    content.includes('zod') || 
    content.includes('z.') ||
    content.includes('validate') ||
    content.includes('RequestSchema');
  
  // Verificar si usa request body
  const usesRequestBody = /req\.json|req\.body|request\.json/i.test(content);
  
  if (usesRequestBody && !hasValidation) {
    suggestions.push({
      file: filepath,
      issue: 'API route usa request body sin validación Zod',
      suggestion: 'Agregar schema de validación con zod',
      template: CONFIG.validationTemplate
    });
  }
  
  return suggestions;
}

// Fix 3: Formatear con prettier
async function runPrettier(files) {
  const prettierBin = join(rootDir, 'node_modules/.bin/prettier');
  
  try {
    // Verificar si prettier existe
    await access(prettierBin);
    
    // Ejecutar prettier en los archivos modificados
    const fileList = files.join(' ');
    const { stdout, stderr } = await execAsync(
      `"${prettierBin}" --write ${fileList}`,
      { cwd: rootDir, maxBuffer: 1024 * 1024 }
    );
    
    return { success: true, output: stdout || stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// PROCESAMIENTO PRINCIPAL
// ============================================

async function runAutoFix(options) {
  console.clear();
  console.log(c('cyan', '\n╔══════════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '║         🔧 AUTO-FIX SECURITY ISSUES v1.0.0               ║'));
  console.log(c('cyan', '║         Silexar Pulse - Enterprise Security              ║'));
  console.log(c('cyan', '╚══════════════════════════════════════════════════════════╝\n'));
  
  if (options.dryRun) {
    console.log(c('yellow', '⚠️  MODO DRY-RUN: No se aplicarán cambios\n'));
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    dryRun: options.dryRun,
    filesProcessed: 0,
    filesModified: 0,
    consoleLogsRemoved: 0,
    validationsSuggested: 0,
    changes: [],
    errors: []
  };
  
  const modifiedFiles = [];
  const allSuggestions = [];
  
  console.log(c('bold', '📁 Escaneando archivos...\n'));
  
  // Procesar cada directorio
  for (const scanDir of CONFIG.scanDirs) {
    const fullPath = join(rootDir, scanDir);
    const files = await getFiles(fullPath, CONFIG.extensions);
    
    for (const filepath of files) {
      report.filesProcessed++;
      const relativePath = relative(rootDir, filepath);
      
      try {
        const originalContent = await fs.readFile(filepath, 'utf-8');
        let newContent = originalContent;
        const fileChanges = [];
        
        // Aplicar fixes
        const consoleFix = await fixConsoleLogs(newContent, filepath);
        if (consoleFix.changes.length > 0) {
          newContent = consoleFix.content;
          fileChanges.push(...consoleFix.changes);
          report.consoleLogsRemoved += consoleFix.changes
            .filter(c => c.type === 'console.log')
            .reduce((sum, c) => sum + (c.count || 0), 0);
        }
        
        // Obtener sugerencias
        const suggestions = await suggestValidations(newContent, filepath);
        if (suggestions.length > 0) {
          allSuggestions.push(...suggestions);
          report.validationsSuggested += suggestions.length;
        }
        
        // Aplicar cambios si hay diferencias
        if (newContent !== originalContent) {
          report.filesModified++;
          modifiedFiles.push(filepath);
          
          report.changes.push({
            file: relativePath,
            changes: fileChanges
          });
          
          if (options.verbose) {
            console.log(c('blue', `  📝 ${relativePath}`));
            for (const change of fileChanges) {
              if (change.type === 'console.log') {
                console.log(c('green', `     - Eliminados ${change.count} console.log (líneas: ${change.lines.slice(0, 3).join(', ')}${change.lines.length > 3 ? '...' : ''})`));
              }
            }
          }
          
          if (!options.dryRun) {
            await fs.writeFile(filepath, newContent, 'utf-8');
          }
        }
        
      } catch (error) {
        report.errors.push({ file: relativePath, error: error.message });
        console.log(c('red', `  ❌ Error en ${relativePath}: ${error.message}`));
      }
    }
  }
  
  // Formatear con prettier si hay cambios y no está deshabilitado
  if (modifiedFiles.length > 0 && !options.dryRun && !options.noFormat) {
    console.log(c('bold', '\n🎨 Formateando código con Prettier...\n'));
    
    const prettierResult = await runPrettier(modifiedFiles);
    if (prettierResult.success) {
      console.log(c('green', '✅ Código formateado correctamente'));
    } else {
      console.log(c('yellow', `⚠️  Prettier: ${prettierResult.error}`));
    }
  }
  
  // ============================================
  // REPORTE
  // ============================================
  
  console.log(c('bold', '\n📊 REPORTE DE CAMBIOS\n'));
  console.log(c('blue', `Archivos procesados: ${report.filesProcessed}`));
  console.log(c('green', `Archivos modificados: ${report.filesModified}`));
  console.log(c('green', `Console.logs eliminados: ${report.consoleLogsRemoved}`));
  console.log(c('yellow', `Validaciones sugeridas: ${report.validationsSuggested}`));
  
  if (report.errors.length > 0) {
    console.log(c('red', `Errores: ${report.errors.length}`));
  }
  
  // Mostrar cambios detallados
  if (report.changes.length > 0 && !options.verbose) {
    console.log(c('bold', '\n📝 Archivos modificados:\n'));
    for (const change of report.changes.slice(0, 10)) {
      console.log(c('green', `  ✅ ${change.file}`));
    }
    if (report.changes.length > 10) {
      console.log(c('dim', `  ... y ${report.changes.length - 10} más`));
    }
  }
  
  // Mostrar sugerencias
  if (allSuggestions.length > 0) {
    console.log(c('bold', '\n💡 SUGERENCIAS DE VALIDACIÓN:\n'));
    for (const suggestion of allSuggestions.slice(0, 5)) {
      console.log(c('yellow', `  📄 ${suggestion.file}`));
      console.log(c('dim', `     ${suggestion.issue}`));
    }
    if (allSuggestions.length > 5) {
      console.log(c('dim', `  ... y ${allSuggestions.length - 5} más`));
    }
  }
  
  // Guardar reporte
  if (!options.dryRun) {
    const reportPath = join(rootDir, CONFIG.reportFile);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(c('dim', `\n📄 Reporte guardado: ${CONFIG.reportFile}`));
  }
  
  // Mensaje final
  if (report.filesModified === 0 && report.validationsSuggested === 0) {
    console.log(c('green', '\n✅ No se encontraron problemas para corregir\n'));
  } else if (options.dryRun) {
    console.log(c('yellow', '\n⚠️  MODO DRY-RUN: No se aplicaron cambios'));
    console.log(c('yellow', '   Ejecuta sin --dry-run para aplicar los cambios\n'));
  } else {
    console.log(c('green', '\n✅ Correcciones aplicadas exitosamente\n'));
  }
  
  return report;
}

// ============================================
// HELP
// ============================================

function showHelp() {
  console.log(`
${c('bold', 'Auto-Fix Security Issues - Silexar Pulse')}

${c('bold', 'Uso:')}
  node scripts/security-monitoring/auto-fix-security.js [opciones]

${c('bold', 'Opciones:')}
  --dry-run     Solo mostrar cambios sin aplicarlos
  --verbose     Mostrar información detallada
  --no-format   No ejecutar prettier después de los cambios
  -h, --help    Mostrar esta ayuda

${c('bold', 'Ejemplos:')}
  # Ver cambios sin aplicarlos
  node scripts/security-monitoring/auto-fix-security.js --dry-run

  # Aplicar cambios con detalle
  node scripts/security-monitoring/auto-fix-security.js --verbose

  # Solo eliminar console.logs sin formatear
  node scripts/security-monitoring/auto-fix-security.js --no-format

${c('bold', 'Nota:')}
  Este script solo modifica código de debug y estilo.
  No modifica la lógica de negocio.
`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  try {
    const report = await runAutoFix(options);
    process.exit(report.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(c('red', `\n❌ Error: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runAutoFix, fixConsoleLogs, suggestValidations };
