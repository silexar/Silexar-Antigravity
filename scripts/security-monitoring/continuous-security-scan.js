#!/usr/bin/env node
/**
 * @fileoverview Continuous Security Scanner
 * 
 * Script de monitoreo continuo de seguridad para desarrollo.
 * Se ejecuta cada 5 minutos para detectar:
 * - Nuevos console.log/debug en el código
 * - Archivos sin validación de inputs
 * - Cambios en archivos críticos de seguridad
 * 
 * Uso:
 *   node scripts/security-monitoring/continuous-security-scan.js [watch]
 *   npm run security:watch (configurado en package.json)
 * 
 * @author SILEXAR Security Team
 * @version 1.0.0
 * @cross-platform Windows/Mac/Linux
 */

import { promises as fs, watch, createReadStream } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, relative, sep, posix } from 'path';
import { spawn } from 'child_process';
import { createInterface } from 'readline';

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  // Directorios a escanear
  scanDirs: [
    'src/app',
    'src/components',
    'src/lib',
    'src/cortex',
    'src/modules',
    'src/utils'
  ],
  
  // Extensiones de archivos a analizar
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Archivos críticos de seguridad que deben ser monitoreados
  criticalFiles: [
    'src/lib/security/auth-middleware.ts',
    'src/lib/security/rate-limiter.ts',
    'src/lib/security/input-validation.ts',
    'src/lib/security/audit-logger.ts',
    'src/lib/security/rbac.ts',
    'src/lib/security/password-security.ts',
    'src/lib/api/jwt.ts',
    'src/lib/auth/better-auth-config.ts',
    'src/middleware.ts',
    '.env.local',
    'next.config.js'
  ],
  
  // Patrones de console.log a detectar
  consolePatterns: [
    /console\.log\s*\(/gi,
    /console\.debug\s*\(/gi,
    /console\.warn\s*\(/gi,
    /console\.info\s*\(/gi,
    /console\.trace\s*\(/gi
  ],
  
  // Patrones de validación (deben existir en archivos de API/rutas)
  validationPatterns: [
    /zod/i,
    /z\./i,
    /validate/i,
    /schema/i,
    /sanitize/i,
    /DOMPurify/i,
    /escapeHtml/i
  ],
  
  // Intervalo de escaneo en ms (5 minutos por defecto)
  scanInterval: 5 * 60 * 1000,
  
  // Archivo para guardar estado entre ejecuciones
  stateFile: '.security-scan-state.json',
  
  // Colores para terminal (cross-platform)
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m'
  }
};

// ============================================
// UTILIDADES
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..', '..');

// Helper para colores
const c = (color, text) => `${CONFIG.colors[color] || ''}${text}${CONFIG.colors.reset}`;

// Cross-platform path normalization
const toPosixPath = (filepath) => filepath.replace(/\\/g, '/');

// Obtener timestamp formateado
const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

// Mostrar notificación en terminal
function notify(title, message, type = 'info') {
  const icons = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' };
  const colors = { info: 'blue', warn: 'yellow', error: 'red', success: 'green' };
  
  console.log(`\n${c('bold', `${icons[type]} [${timestamp()}] ${title}`)}`);
  console.log(`${c(colors[type], message)}`);
  
  // Intentar notificación nativa del sistema (solo si está disponible)
  if (process.platform === 'win32' && process.env.POWERSHELL_DISTRIBUTION_CHANNEL) {
    // Windows notification via PowerShell (opcional)
    try {
      spawn('powershell', [
        '-Command',
        `Add-Type -AssemblyName System.Windows.Forms; ` +
        `[System.Windows.Forms.MessageBox]::Show('${message.replace(/'/g, "''")}', '${title}')`
      ], { stdio: 'ignore', detached: true });
    } catch (e) {
      // Silently fail
    }
  }
}

// ============================================
// FUNCIONES DE ARCHIVOS
// ============================================

// Obtener todos los archivos de forma recursiva
async function getFiles(dir, extensions, exclude = ['node_modules', '.next', 'dist', 'coverage']) {
  const files = [];
  
  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!exclude.includes(entry.name)) {
          await traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = entry.name.slice(entry.name.lastIndexOf('.'));
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  try {
    await traverse(dir);
  } catch (e) {
    // Directorio no existe, ignorar
  }
  
  return files;
}

// Calcular hash de archivo para detectar cambios
async function getFileHash(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  } catch (e) {
    return null;
  }
}

// ============================================
// DETECTORES DE SEGURIDAD
// ============================================

// Detectar console.log statements
async function detectConsoleLogs(filepath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    CONFIG.consolePatterns.forEach(pattern => {
      if (pattern.test(line)) {
        // Ignorar líneas que ya son logger.* o están comentadas
        if (line.trim().startsWith('//') || 
            line.trim().startsWith('*') || 
            line.includes('logger.') ||
            line.includes('// eslint-disable')) {
          return;
        }
        
        issues.push({
          line: index + 1,
          code: line.trim(),
          type: 'console.log'
        });
      }
    });
  });
  
  return issues;
}

// Verificar si archivo tiene validación de inputs
async function hasInputValidation(content, filepath) {
  // Archivos que deberían tener validación (API routes, handlers)
  const shouldValidate = 
    filepath.includes('/api/') || 
    filepath.includes('route.ts') ||
    filepath.includes('action');
  
  if (!shouldValidate) return { required: false, hasValidation: true };
  
  // Verificar si tiene algún patrón de validación
  const hasValidation = CONFIG.validationPatterns.some(pattern => 
    pattern.test(content)
  );
  
  // Verificar si usa request body
  const usesRequestBody = /req\.json|req\.body|request\.json/i.test(content);
  
  return {
    required: usesRequestBody,
    hasValidation: hasValidation || !usesRequestBody
  };
}

// ============================================
// ESCANEO PRINCIPAL
// ============================================

async function runSecurityScan() {
  console.clear();
  console.log(c('cyan', '\n╔══════════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '║        🔒 CONTINUOUS SECURITY SCANNER v1.0.0             ║'));
  console.log(c('cyan', '║        Silexar Pulse - Enterprise Security               ║'));
  console.log(c('cyan', '╚══════════════════════════════════════════════════════════╝\n'));
  
  const results = {
    timestamp: new Date().toISOString(),
    consoleLogs: [],
    missingValidation: [],
    criticalChanges: [],
    summary: { totalFiles: 0, issues: 0, warnings: 0 }
  };
  
  // Cargar estado anterior
  let previousState = {};
  try {
    const stateContent = await fs.readFile(join(rootDir, CONFIG.stateFile), 'utf-8');
    previousState = JSON.parse(stateContent);
  } catch (e) {
    previousState = {};
  }
  
  const currentState = {};
  
  // Escanear directorios
  console.log(c('bold', '📁 Escaneando directorios...\n'));
  
  for (const scanDir of CONFIG.scanDirs) {
    const fullPath = join(rootDir, scanDir);
    const files = await getFiles(fullPath, CONFIG.extensions);
    
    results.summary.totalFiles += files.length;
    
    for (const filepath of files) {
      const relativePath = relative(rootDir, filepath);
      const posixPath = toPosixPath(relativePath);
      
      try {
        const content = await fs.readFile(filepath, 'utf-8');
        
        // Calcular hash para tracking de cambios
        const hash = createHash('sha256').update(content).digest('hex').slice(0, 16);
        currentState[posixPath] = hash;
        
        // Detectar console.logs
        const consoleIssues = await detectConsoleLogs(filepath, content);
        if (consoleIssues.length > 0) {
          results.consoleLogs.push({
            file: posixPath,
            issues: consoleIssues
          });
          results.summary.issues += consoleIssues.length;
        }
        
        // Verificar validación de inputs
        const validation = await hasInputValidation(content, filepath);
        if (validation.required && !validation.hasValidation) {
          results.missingValidation.push({
            file: posixPath,
            message: 'Archivo de API sin validación de inputs detectada'
          });
          results.summary.warnings++;
        }
        
      } catch (e) {
        // Error leyendo archivo, ignorar
      }
    }
  }
  
  // Verificar cambios en archivos críticos
  console.log(c('bold', '🔐 Verificando archivos críticos...\n'));
  
  for (const criticalFile of CONFIG.criticalFiles) {
    const fullPath = join(rootDir, criticalFile);
    const hash = await getFileHash(fullPath);
    
    if (hash) {
      const previousHash = previousState[criticalFile];
      
      if (previousHash && previousHash !== hash) {
        results.criticalChanges.push({
          file: criticalFile,
          previousHash: previousHash.slice(0, 8),
          currentHash: hash.slice(0, 8)
        });
        results.summary.warnings++;
      }
      
      currentState[criticalFile] = hash;
    }
  }
  
  // Guardar estado actual
  await fs.writeFile(
    join(rootDir, CONFIG.stateFile),
    JSON.stringify(currentState, null, 2)
  );
  
  // ============================================
  // REPORTE
  // ============================================
  
  console.log(c('bold', '\n📊 RESULTADOS DEL ESCANEO\n'));
  console.log(c('blue', `Total archivos escaneados: ${results.summary.totalFiles}`));
  console.log(c(results.summary.issues > 0 ? 'red' : 'green', 
    `Issues de console.log: ${results.summary.issues}`));
  console.log(c(results.summary.warnings > 0 ? 'yellow' : 'green', 
    `Advertencias: ${results.summary.warnings}`));
  
  // Mostrar console.logs encontrados
  if (results.consoleLogs.length > 0) {
    console.log(c('bold', '\n⚠️  CONSOLE.LOGS DETECTADOS:\n'));
    for (const item of results.consoleLogs) {
      console.log(c('yellow', `  📄 ${item.file}`));
      for (const issue of item.issues.slice(0, 3)) {
        console.log(c('white', `     Línea ${issue.line}: ${issue.code.slice(0, 60)}...`));
      }
      if (item.issues.length > 3) {
        console.log(c('white', `     ... y ${item.issues.length - 3} más`));
      }
    }
    notify('Console.logs detectados', 
      `Se encontraron ${results.summary.issues} console.logs en ${results.consoleLogs.length} archivos. Ejecuta: npm run fix:console`, 
      'warn');
  }
  
  // Mostrar archivos sin validación
  if (results.missingValidation.length > 0) {
    console.log(c('bold', '\n⚠️  ARCHIVOS SIN VALIDACIÓN:\n'));
    for (const item of results.missingValidation.slice(0, 5)) {
      console.log(c('yellow', `  📄 ${item.file}`));
      console.log(c('white', `     ${item.message}`));
    }
    if (results.missingValidation.length > 5) {
      console.log(c('white', `  ... y ${results.missingValidation.length - 5} más`));
    }
  }
  
  // Mostrar cambios en archivos críticos
  if (results.criticalChanges.length > 0) {
    console.log(c('bold', '\n🚨 CAMBIOS EN ARCHIVOS CRÍTICOS:\n'));
    for (const change of results.criticalChanges) {
      console.log(c('red', `  🔒 ${change.file}`));
      console.log(c('white', `     Hash anterior: ${change.previousHash} → Actual: ${change.currentHash}`));
    }
    notify('Cambios en archivos críticos', 
      `${results.criticalChanges.length} archivos de seguridad han sido modificados`, 
      'error');
  }
  
  // Mensaje si todo está bien
  if (results.summary.issues === 0 && results.summary.warnings === 0) {
    console.log(c('green', '\n✅ No se detectaron problemas de seguridad'));
    console.log(c('green', '   El código cumple con los estándares de seguridad de Silexar\n'));
  }
  
  console.log(c('cyan', `\n⏱️  Próximo escaneo: ${new Date(Date.now() + CONFIG.scanInterval).toLocaleTimeString()}`));
  console.log(c('gray', '   Presiona Ctrl+C para detener\n'));
  
  return results;
}

// ============================================
// MODO WATCH
// ============================================

async function watchMode() {
  console.log(c('cyan', '\n👁️  Modo WATCH activado - Monitoreando cambios...\n'));
  
  // Ejecutar escaneo inicial
  await runSecurityScan();
  
  // Configurar intervalo
  const intervalId = setInterval(runSecurityScan, CONFIG.scanInterval);
  
  // También observar cambios en archivos críticos en tiempo real
  const watchers = [];
  
  for (const criticalFile of CONFIG.criticalFiles) {
    const fullPath = join(rootDir, criticalFile);
    try {
      await fs.access(fullPath);
      const watcher = watch(fullPath, async (eventType) => {
        if (eventType === 'change') {
          notify('Archivo crítico modificado', 
            `${criticalFile} ha sido modificado. Ejecutando escaneo...`, 
            'warn');
          clearInterval(intervalId);
          await runSecurityScan();
          // Reiniciar intervalo
          setInterval(runSecurityScan, CONFIG.scanInterval);
        }
      });
      watchers.push(watcher);
    } catch (e) {
      // Archivo no existe
    }
  }
  
  // Manejar cierre graceful
  process.on('SIGINT', () => {
    console.log(c('yellow', '\n\n👋 Deteniendo security scanner...'));
    clearInterval(intervalId);
    watchers.forEach(w => w.close());
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    clearInterval(intervalId);
    watchers.forEach(w => w.close());
    process.exit(0);
  });
}

// ============================================
// EJECUCIÓN PRINCIPAL
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'single';
  
  try {
    if (mode === 'watch') {
      await watchMode();
    } else {
      const results = await runSecurityScan();
      process.exit(results.summary.issues > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error(c('red', `\n❌ Error en security scan: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runSecurityScan, watchMode, detectConsoleLogs };
