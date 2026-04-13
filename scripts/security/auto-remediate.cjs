#!/usr/bin/env node
/**
 * 🔧 SILEXAR PULSE - AUTO-REMEDIATION ENGINE
 * 
 * Sistema de auto-corrección de errores de seguridad con aprendizaje.
 * Aprende de cada error corregido para prevenir futuras ocurrencias.
 * 
 * @version 1.0.0
 * @tier TIER_0_PENTAGON++
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  learningDatabase: '.security-learning-db.json',
  backupDir: '.security-backups',
  logFile: 'security-remediation.log',
  maxRetries: 3
};

// ═══════════════════════════════════════════════════════════════
// BASE DE DATOS DE APRENDIZAJE
// ═══════════════════════════════════════════════════════════════
class LearningDatabase {
  constructor() {
    this.dbPath = path.join(process.cwd(), CONFIG.learningDatabase);
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      }
    } catch (e) {
      console.error('⚠️  Error loading learning database:', e.message);
    }
    return {
      errors: {},
      fixes: {},
      patterns: {},
      statistics: {
        totalFixed: 0,
        totalPrevented: 0,
        lastUpdate: null
      }
    };
  }

  save() {
    this.data.statistics.lastUpdate = new Date().toISOString();
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  recordError(errorType, filePath, details) {
    if (!this.data.errors[errorType]) {
      this.data.errors[errorType] = [];
    }
    
    this.data.errors[errorType].push({
      file: filePath,
      details,
      timestamp: new Date().toISOString(),
      fixed: false
    });
    
    this.save();
  }

  recordFix(errorType, filePath, fixApplied) {
    if (!this.data.fixes[errorType]) {
      this.data.fixes[errorType] = [];
    }
    
    this.data.fixes[errorType].push({
      file: filePath,
      fix: fixApplied,
      timestamp: new Date().toISOString()
    });
    
    // Marcar error como corregido
    if (this.data.errors[errorType]) {
      const error = this.data.errors[errorType].find(e => e.file === filePath && !e.fixed);
      if (error) error.fixed = true;
    }
    
    this.data.statistics.totalFixed++;
    this.save();
  }

  learnPattern(errorType, pattern, solution) {
    this.data.patterns[errorType] = {
      pattern: pattern.toString(),
      solution,
      occurrences: (this.data.patterns[errorType]?.occurrences || 0) + 1
    };
    this.save();
  }

  hasPattern(errorType, content) {
    const patternData = this.data.patterns[errorType];
    if (!patternData) return false;
    
    const pattern = new RegExp(patternData.pattern.slice(1, -1));
    return pattern.test(content);
  }

  getStats() {
    return this.data.statistics;
  }
}

// ═══════════════════════════════════════════════════════════════
// MOTOR DE REMEDIACIÓN
// ═══════════════════════════════════════════════════════════════
class RemediationEngine {
  constructor() {
    this.db = new LearningDatabase();
    this.fixes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    // Guardar en log
    fs.appendFileSync(
      path.join(process.cwd(), CONFIG.logFile),
      `[${timestamp}] ${type.toUpperCase()}: ${message}\n`
    );
  }

  backup(filePath) {
    const backupPath = path.join(process.cwd(), CONFIG.backupDir);
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    const fileName = path.basename(filePath);
    const timestamp = Date.now();
    const backupFile = path.join(backupPath, `${fileName}.${timestamp}.backup`);
    
    fs.copyFileSync(filePath, backupFile);
    this.log(`Backup created: ${backupFile}`);
    return backupFile;
  }

  // ═══════════════════════════════════════════════════════════════
  // FIX 1: Eliminar console.log
  // ═══════════════════════════════════════════════════════════════
  fixConsoleLogs(content, filePath) {
    const originalContent = content;
    
    // Patrones de console.log a remover
    const patterns = [
      /console\.log\([^)]+\);?\s*\n?/g,
      /console\.warn\([^)]+\);?\s*\n?/g,
      /console\.error\([^)]+\);?\s*\n?/g,
      /console\.info\([^)]+\);?\s*\n?/g
    ];
    
    let modified = content;
    patterns.forEach(pattern => {
      modified = modified.replace(pattern, '');
    });
    
    if (modified !== originalContent) {
      this.db.recordFix('console-log', filePath, 'Removed console statements');
      this.db.learnPattern('console-log', /console\.(log|warn|error|info)/, 'Remove console statements');
      this.log(`Fixed console statements in ${filePath}`, 'success');
      return modified;
    }
    
    return content;
  }

  // ═══════════════════════════════════════════════════════════════
  // FIX 2: Reemplazar 'any' por tipos seguros
  // ═══════════════════════════════════════════════════════════════
  fixAnyTypes(content, filePath) {
    const originalContent = content;
    
    // Reemplazar ': any' con ': unknown' (más seguro)
    let modified = content.replace(/:\s*any\b/g, ': unknown');
    modified = modified.replace(/as\s+any\b/g, 'as unknown');
    
    if (modified !== originalContent) {
      this.db.recordFix('any-type', filePath, 'Replaced any with unknown');
      this.db.learnPattern('any-type', /:\s*any\b/, 'Replace any with unknown');
      this.log(`Fixed 'any' types in ${filePath}`, 'success');
      return modified;
    }
    
    return content;
  }

  // ═══════════════════════════════════════════════════════════════
  // FIX 3: Agregar validación de errores
  // ═══════════════════════════════════════════════════════════════
  fixErrorHandling(content, filePath) {
    const originalContent = content;
    
    // Detectar try-catch sin manejo de error
    const tryCatchPattern = /try\s*\{[^}]+\}\s*catch\s*\(\s*\)\s*\{\s*\}/g;
    
    let modified = content.replace(tryCatchPattern, (match) => {
      return match.replace('catch ()', 'catch (error)').replace('{}', '{\n    console.error("Error:", error);\n  }');
    });
    
    if (modified !== originalContent) {
      this.db.recordFix('empty-catch', filePath, 'Added error handling to empty catch blocks');
      this.log(`Fixed empty catch blocks in ${filePath}`, 'success');
      return modified;
    }
    
    return content;
  }

  // ═══════════════════════════════════════════════════════════════
  // FIX 4: Sanitizar stack traces en respuestas API
  // ═══════════════════════════════════════════════════════════════
  fixStackTraces(content, filePath) {
    const originalContent = content;
    
    // Detectar stack traces expuestos en respuestas JSON
    const stackPattern = /(stack|stackTrace)\s*:\s*error(?: instanceof Error)?\s*\?\s*error\.stack\s*:\s*undefined/g;
    
    let modified = content.replace(stackPattern, (match) => {
      return `// SECURITY: Stack traces removed from response\n    // ${match.split(':')[0]}: '[REDACTED]'`;
    });
    
    if (modified !== originalContent) {
      this.db.recordFix('exposed-stack', filePath, 'Removed stack traces from API responses');
      this.db.learnPattern('exposed-stack', /stack.*error\.stack/, 'Remove stack traces from responses');
      this.log(`Fixed exposed stack traces in ${filePath}`, 'success');
      return modified;
    }
    
    return content;
  }

  // ═══════════════════════════════════════════════════════════════
  // FIX 5: Agregar validación de inputs
  // ═══════════════════════════════════════════════════════════════
  fixInputValidation(content, filePath) {
    const originalContent = content;
    
    // Detectar uso de req.body sin validación
    const reqBodyPattern = /const\s+(\w+)\s*=\s*req\.body\.(\w+);?\s*\n(?!\s*if\s*\(\s*!\1)/g;
    
    let modified = content.replace(reqBodyPattern, (match, varName, prop) => {
      return `const ${varName} = req.body.${prop};
  if (!${varName}) {
    return res.status(400).json({ error: '${prop} is required' });
  }`;
    });
    
    if (modified !== originalContent) {
      this.db.recordFix('input-validation', filePath, 'Added input validation');
      this.log(`Added input validation in ${filePath}`, 'success');
      return modified;
    }
    
    return content;
  }

  // ═══════════════════════════════════════════════════════════════
  // ESCANEAR Y REPARAR ARCHIVOS
  // ═══════════════════════════════════════════════════════════════
  scanAndFix(filePath) {
    if (!fs.existsSync(filePath)) {
      this.log(`File not found: ${filePath}`, 'error');
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    
    // Aplicar fixes secuencialmente
    modified = this.fixConsoleLogs(modified, filePath);
    modified = this.fixAnyTypes(modified, filePath);
    modified = this.fixErrorHandling(modified, filePath);
    modified = this.fixStackTraces(modified, filePath);
    modified = this.fixInputValidation(modified, filePath);
    
    if (modified !== content) {
      this.backup(filePath);
      fs.writeFileSync(filePath, modified, 'utf8');
      this.log(`File repaired: ${filePath}`, 'success');
      return true;
    }
    
    return false;
  }

  // ═══════════════════════════════════════════════════════════════
  // ESCANEAR DIRECTORIO
  // ═══════════════════════════════════════════════════════════════
  scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = fs.readdirSync(dirPath);
    let fixedCount = 0;
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        fixedCount += this.scanDirectory(fullPath, extensions);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        if (this.scanAndFix(fullPath)) {
          fixedCount++;
        }
      }
    });
    
    return fixedCount;
  }

  // ═══════════════════════════════════════════════════════════════
  // MOSTRAR ESTADÍSTICAS
  // ═══════════════════════════════════════════════════════════════
  showStats() {
    const stats = this.db.getStats();
    console.log('\n📊 REMEDIATION STATISTICS');
    console.log('========================');
    console.log(`Total errors fixed: ${stats.totalFixed}`);
    console.log(`Total errors prevented: ${stats.totalPrevented}`);
    console.log(`Last update: ${stats.lastUpdate || 'Never'}`);
    console.log('========================\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════
function main() {
  const engine = new RemediationEngine();
  
  console.log('🔧 Silexar Pulse - Auto-Remediation Engine');
  console.log('==========================================\n');
  
  // Parsear argumentos
  const args = process.argv.slice(2);
  const target = args[0] || 'src';
  
  if (args.includes('--stats')) {
    engine.showStats();
    return;
  }
  
  if (args.includes('--help')) {
    console.log('Usage: node auto-remediate.js [target] [options]');
    console.log('');
    console.log('Options:');
    console.log('  --stats    Show remediation statistics');
    console.log('  --help     Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node auto-remediate.js src/app/api');
    console.log('  node auto-remediate.js --stats');
    return;
  }
  
  const targetPath = path.resolve(process.cwd(), target);
  
  console.log(`🎯 Target: ${targetPath}\n`);
  
  let fixedCount = 0;
  
  if (fs.statSync(targetPath).isDirectory()) {
    fixedCount = engine.scanDirectory(targetPath);
  } else {
    fixedCount = engine.scanAndFix(targetPath) ? 1 : 0;
  }
  
  console.log('\n==========================================');
  console.log(`✅ Remediation complete: ${fixedCount} files fixed`);
  console.log('==========================================\n');
  
  engine.showStats();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { RemediationEngine, LearningDatabase };
