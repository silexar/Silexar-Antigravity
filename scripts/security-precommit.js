#!/usr/bin/env node
/**
 * Silexar Pulse - Security Pre-commit Hook
 * 
 * Este script escanea archivos staged en busca de:
 * - Secretos expuestos (API keys, tokens, passwords)
 * - Código vulnerable (eval, innerHTML, etc.)
 * - Archivos sensibles que no deben ser commiteados
 * 
 * Uso: node scripts/security-precommit.js
 * Bypass: git commit --no-verify (solo emergencias)
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para terminal (cross-platform)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

// Iconos
const icons = {
  shield: '🔒',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  search: '🔍',
  lock: '🔐',
  bug: '🐛',
  fire: '🔥',
  stop: '🛑'
};

// Cargar patrones de seguridad
let patterns;
try {
  const patternsPath = resolve(__dirname, 'security-patterns.json');
  patterns = JSON.parse(readFileSync(patternsPath, 'utf8'));
} catch (error) {
  console.error(`${icons.cross} Error cargando security-patterns.json:`, error.message);
  process.exit(1);
}

// Estado del escaneo
const findings = {
  CRITICAL: [],
  HIGH: [],
  MEDIUM: [],
  LOW: []
};

let filesScanned = 0;
let filesSkipped = 0;

/**
 * Obtiene la lista de archivos staged para commit
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { 
      encoding: 'utf8',
      cwd: resolve(__dirname, '..')
    });
    return output.trim().split('\n').filter(f => f.length > 0);
  } catch (error) {
    console.error(`${icons.cross} Error obteniendo archivos staged:`, error.message);
    return [];
  }
}

/**
 * Obtiene el contenido staged de un archivo
 */
function getStagedContent(filepath) {
  try {
    return execSync(`git show :"${filepath}"`, { 
      encoding: 'utf8',
      cwd: resolve(__dirname, '..')
    });
  } catch (error) {
    // Si falla, intentar leer el archivo directamente
    try {
      return readFileSync(resolve(__dirname, '..', filepath), 'utf8');
    } catch {
      return null;
    }
  }
}

/**
 * Verifica si un archivo debe ser ignorado
 */
function shouldIgnoreFile(filepath) {
  const ignorePatterns = patterns.ignore_patterns || [];
  
  for (const pattern of ignorePatterns) {
    const regex = new RegExp(pattern);
    if (regex.test(filepath)) {
      return true;
    }
  }
  return false;
}

/**
 * Verifica extensiones de archivo bloqueadas
 */
function checkBlockedFiles(filepath) {
  const blockedFiles = patterns.file_patterns?.blocked_files || [];
  const suspiciousExtensions = patterns.file_patterns?.suspicious_extensions || [];
  
  const results = [];
  
  // Verificar archivos bloqueados
  for (const blocked of blockedFiles) {
    const regex = new RegExp(blocked.pattern, 'i');
    if (regex.test(filepath)) {
      results.push({
        type: 'BLOCKED_FILE',
        severity: blocked.severity,
        description: blocked.description,
        pattern: blocked.pattern,
        line: 0,
        match: filepath
      });
    }
  }
  
  // Verificar extensiones sospechosas
  for (const suspicious of suspiciousExtensions) {
    const regex = new RegExp(suspicious.pattern, 'i');
    if (regex.test(filepath)) {
      results.push({
        type: 'SUSPICIOUS_FILE',
        severity: suspicious.severity,
        description: suspicious.description,
        pattern: suspicious.pattern,
        line: 0,
        match: filepath
      });
    }
  }
  
  return results;
}

/**
 * Escanea el contenido en busca de patrones de secretos
 */
function scanForSecrets(content, filepath) {
  const results = [];
  const lines = content.split('\n');
  
  const allPatterns = [
    ...(patterns.secrets?.api_keys?.patterns || []),
    ...(patterns.secrets?.tokens?.patterns || []),
    ...(patterns.secrets?.passwords?.patterns || [])
  ];
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    
    for (const pattern of allPatterns) {
      try {
        const flags = pattern.flags || '';
        const regex = new RegExp(pattern.regex, flags);
        
        if (regex.test(line)) {
          // Verificar falsos positivos comunes
          if (isFalsePositive(line, pattern.name)) {
            continue;
          }
          
          results.push({
            type: 'SECRET',
            severity: pattern.severity,
            description: pattern.description,
            pattern: pattern.name,
            line: lineNum + 1,
            match: line.trim().substring(0, 80) + (line.length > 80 ? '...' : ''),
            filepath
          });
        }
      } catch (error) {
        // Ignorar errores de regex inválidos
      }
    }
  }
  
  return results;
}

/**
 * Escanea el contenido en busca de código vulnerable
 */
function scanForVulnerabilities(content, filepath) {
  const results = [];
  const lines = content.split('\n');
  
  const allPatterns = [
    ...(patterns.vulnerable_code?.eval_functions?.patterns || []),
    ...(patterns.vulnerable_code?.xss_vulnerabilities?.patterns || []),
    ...(patterns.vulnerable_code?.insecure_practices?.patterns || [])
  ];
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    
    // Saltar comentarios
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
      continue;
    }
    
    for (const pattern of allPatterns) {
      try {
        const flags = pattern.flags || '';
        const regex = new RegExp(pattern.regex, flags);
        
        if (regex.test(line)) {
          // Verificar falsos positivos
          if (isFalsePositive(line, pattern.name)) {
            continue;
          }
          
          results.push({
            type: 'VULNERABILITY',
            severity: pattern.severity,
            description: pattern.description,
            pattern: pattern.name,
            line: lineNum + 1,
            match: line.trim().substring(0, 80) + (line.length > 80 ? '...' : ''),
            filepath
          });
        }
      } catch (error) {
        // Ignorar errores de regex inválidos
      }
    }
  }
  
  return results;
}

/**
 * Verifica si un match es un falso positivo
 */
function isFalsePositive(line, patternName) {
  const falsePositivePatterns = [
    // Variables de entorno placeholder
    /process\.env\.[A-Z_]+/,
    // Comentarios explicativos
    /\/\/.*ejemplo/i,
    /\/\/.*example/i,
    /\/\/.*sample/i,
    /#.*ejemplo/i,
    /#.*example/i,
    // Mock/test data obvios
    /['"]test['"]/.test(line) && /password/i.test(line),
    /['"]example['"]/.test(line) && /password/i.test(line),
    /['"]password['"]/.test(line) && /\*\*\*\*\*\*\*\*/,
    /YOUR_/i,
    /XXX+/,
    /fake/i,
    /mock/i,
    // Configuraciones de ejemplo
    /\.example\./i,
    /\.sample\./i,
    /\.template\./i
  ];
  
  // Patrones específicos por tipo
  const specificFalsePositives = {
    'JWT Token': [
      /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/, // JWT de ejemplo
      /eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9/ // JWT de ejemplo
    ],
    'Hardcoded Password': [
      /process\.env/,
      /process\.env\./,
      /import\.meta\.env/
    ]
  };
  
  // Verificar falsos positivos generales
  for (const fp of falsePositivePatterns) {
    if (typeof fp === 'function') {
      if (fp(line)) return true;
    } else if (fp.test(line)) {
      return true;
    }
  }
  
  // Verificar falsos positivos específicos
  if (specificFalsePositives[patternName]) {
    for (const fp of specificFalsePositives[patternName]) {
      if (fp.test(line)) return true;
    }
  }
  
  return false;
}

/**
 * Imprime el banner de inicio
 */
function printBanner() {
  console.log('');
  console.log(`${colors.cyan}${colors.bright}${icons.shield} ==========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}${icons.shield}  SILEXAR PULSE SECURITY SCANNER${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}${icons.shield}  Pre-commit Security Analysis${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}${icons.shield} ==========================================${colors.reset}`);
  console.log('');
}

/**
 * Imprime el resumen de hallazgos
 */
function printSummary() {
  console.log('');
  console.log(`${colors.bright}${icons.search} RESUMEN DEL ESCANEÓ:${colors.reset}`);
  console.log(`${colors.dim}Archivos escaneados: ${filesScanned}${colors.reset}`);
  console.log(`${colors.dim}Archivos omitidos: ${filesSkipped}${colors.reset}`);
  console.log('');
  
  const totalCritical = findings.CRITICAL.length;
  const totalHigh = findings.HIGH.length;
  const totalMedium = findings.MEDIUM.length;
  const totalLow = findings.LOW.length;
  
  if (totalCritical > 0) {
    console.log(`${colors.bgRed}${colors.white} ${icons.fire} CRÍTICO: ${totalCritical} problemas encontrados ${colors.reset}`);
  }
  if (totalHigh > 0) {
    console.log(`${colors.bgYellow}${colors.black} ${icons.warning} ALTO: ${totalHigh} problemas encontrados ${colors.reset}`);
  }
  if (totalMedium > 0) {
    console.log(`${colors.yellow}${icons.info} MEDIO: ${totalMedium} problemas encontrados${colors.reset}`);
  }
  if (totalLow > 0) {
    console.log(`${colors.blue}${icons.info} BAJO: ${totalLow} problemas encontrados${colors.reset}`);
  }
  
  if (totalCritical === 0 && totalHigh === 0 && totalMedium === 0 && totalLow === 0) {
    console.log(`${colors.green}${icons.check} No se encontraron problemas de seguridad${colors.reset}`);
  }
  
  console.log('');
}

/**
 * Imprime los hallazgos detallados
 */
function printFindings() {
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const severityColors = {
    CRITICAL: colors.bgRed + colors.white,
    HIGH: colors.red,
    MEDIUM: colors.yellow,
    LOW: colors.blue
  };
  
  for (const severity of severities) {
    const items = findings[severity];
    if (items.length === 0) continue;
    
    console.log('');
    console.log(`${severityColors[severity]}${icons.stop} PROBLEMAS ${severity} (${items.length}):${colors.reset}`);
    console.log('');
    
    // Agrupar por archivo
    const byFile = {};
    for (const item of items) {
      const key = item.filepath || 'Unknown';
      if (!byFile[key]) byFile[key] = [];
      byFile[key].push(item);
    }
    
    for (const [filepath, fileItems] of Object.entries(byFile)) {
      console.log(`  ${colors.cyan}📄 ${filepath}${colors.reset}`);
      
      for (const item of fileItems) {
        const icon = item.type === 'SECRET' ? icons.lock : icons.bug;
        console.log(`    ${icon} ${colors.bright}${item.pattern}${colors.reset}`);
        console.log(`       ${colors.dim}Línea ${item.line}: ${item.description}${colors.reset}`);
        if (item.match && item.line > 0) {
          console.log(`       ${colors.dim}> ${item.match}${colors.reset}`);
        }
      }
    }
  }
}

/**
 * Función principal
 */
async function main() {
  printBanner();
  
  // Verificar si estamos en un repositorio git
  try {
    execSync('git rev-parse --git-dir', { cwd: resolve(__dirname, '..') });
  } catch {
    console.error(`${icons.cross} Error: No es un repositorio git`);
    process.exit(1);
  }
  
  // Obtener archivos staged
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log(`${icons.info} No hay archivos staged para escanear`);
    process.exit(0);
  }
  
  console.log(`${icons.search} Escaneando ${stagedFiles.length} archivo(s) staged...\n`);
  
  // Escanear cada archivo
  for (const filepath of stagedFiles) {
    // Verificar si debe ser ignorado
    if (shouldIgnoreFile(filepath)) {
      filesSkipped++;
      continue;
    }
    
    // Verificar extensiones bloqueadas
    const blockedResults = checkBlockedFiles(filepath);
    for (const result of blockedResults) {
      result.filepath = filepath;
      findings[result.severity].push(result);
    }
    
    // Obtener contenido
    const content = getStagedContent(filepath);
    if (content === null) {
      filesSkipped++;
      continue;
    }
    
    filesScanned++;
    
    // Escanear solo archivos de texto
    const textExtensions = /\.(js|ts|jsx|tsx|json|yaml|yml|toml|ini|conf|config|sh|bash|zsh|ps1|py|rb|go|rs|java|kt|swift|c|cpp|h|hpp|cs|php|html|htm|css|scss|sass|less|md|txt|xml|sql|env)$/i;
    
    if (textExtensions.test(filepath) || content.length < 100000) {
      // Escanear secretos
      const secretResults = scanForSecrets(content, filepath);
      for (const result of secretResults) {
        findings[result.severity].push(result);
      }
      
      // Escanear vulnerabilidades
      const vulnResults = scanForVulnerabilities(content, filepath);
      for (const result of vulnResults) {
        findings[result.severity].push(result);
      }
    }
  }
  
  // Imprimir resultados
  printFindings();
  printSummary();
  
  // Determinar exit code
  const totalCritical = findings.CRITICAL.length;
  const totalHigh = findings.HIGH.length;
  
  if (totalCritical > 0) {
    console.log(`${colors.bgRed}${colors.white}${icons.fire} COMMIT BLOQUEADO: Se encontraron ${totalCritical} problemas CRÍTICOS${colors.reset}`);
    console.log(`${colors.dim}Para bypass (solo emergencias): git commit --no-verify${colors.reset}\n`);
    process.exit(1);
  }
  
  if (totalHigh > 0) {
    console.log(`${colors.red}${icons.warning} ADVERTENCIA: Se encontraron ${totalHigh} problemas de severidad ALTA${colors.reset}`);
    console.log(`${colors.dim}Revisa los problemas antes de continuar${colors.reset}\n`);
    // No bloqueamos pero advertimos fuertemente
  }
  
  console.log(`${colors.green}${icons.check} Escaneo de seguridad completado${colors.reset}\n`);
  process.exit(0);
}

// Ejecutar
main().catch(error => {
  console.error(`${icons.cross} Error inesperado:`, error);
  process.exit(1);
});
