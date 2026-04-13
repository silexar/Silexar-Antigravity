#!/usr/bin/env node
/**
 * Silexar Pulse - Test de Detección de Seguridad
 * 
 * Este script prueba que el sistema de detección de seguridad funciona correctamente
 * creando archivos temporales con patrones de riesgo y verificando que se detecten.
 * 
 * Uso: node scripts/test-security-detection.js
 */

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const TEST_DIR = join(ROOT_DIR, 'tests', 'security-detections');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const icons = {
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  search: '🔍',
  broom: '🧹'
};

console.log('');
console.log(`${colors.cyan}${colors.bright}🧪 ==========================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}🧪  SILEXAR PULSE SECURITY DETECTION TEST${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}🧪 ==========================================${colors.reset}`);
console.log('');

// Casos de prueba
const testCases = [
  {
    name: 'AWS Access Key ID',
    content: 'const awsKey = "AKIAIOSFODNN7EXAMPLE";',
    shouldDetect: true,
    severity: 'CRITICAL'
  },
  {
    name: 'JWT Token',
    content: 'const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";',
    shouldDetect: true,
    severity: 'CRITICAL'
  },
  {
    name: 'Password hardcodeado',
    content: 'const password = "mySecretPassword123";',
    shouldDetect: true,
    severity: 'HIGH'
  },
  {
    name: 'eval() usage',
    content: 'eval(userInput);',
    shouldDetect: true,
    severity: 'CRITICAL'
  },
  {
    name: 'innerHTML assignment',
    content: 'element.innerHTML = userContent;',
    shouldDetect: true,
    severity: 'HIGH'
  },
  {
    name: 'Código seguro - no debe detectar',
    content: 'const greeting = "Hello World";\nconsole.log(greeting);',
    shouldDetect: false,
    severity: null
  },
  {
    name: 'Placeholder password - no debe detectar',
    content: 'const password = process.env.DB_PASSWORD;',
    shouldDetect: false,
    severity: null
  }
];

// Crear directorio de prueba
if (!existsSync(TEST_DIR)) {
  mkdirSync(TEST_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

// Ejecutar casos de prueba
for (const testCase of testCases) {
  const testFile = join(TEST_DIR, `test-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.js`);
  
  try {
    // Crear archivo de prueba
    writeFileSync(testFile, testCase.content, 'utf8');
    
    // Stage el archivo
    execSync(`git add "${testFile}"`, { cwd: ROOT_DIR, stdio: 'ignore' });
    
    // Ejecutar security scan
    let detected = false;
    let detectedSeverity = null;
    
    try {
      const output = execSync('node scripts/security-precommit.js', { 
        cwd: ROOT_DIR, 
        encoding: 'utf8',
        timeout: 30000
      });
      
      // Si el comando tiene éxito, no se detectaron problemas CRITICAL/HIGH
      detected = false;
    } catch (error) {
      // Si el comando falla, se detectaron problemas
      const output = error.stdout || error.message || '';
      detected = true;
      
      // Determinar severidad detectada
      if (output.includes('CRITICAL')) {
        detectedSeverity = 'CRITICAL';
      } else if (output.includes('HIGH')) {
        detectedSeverity = 'HIGH';
      } else if (output.includes('MEDIUM')) {
        detectedSeverity = 'MEDIUM';
      }
    }
    
    // Verificar resultado
    const testPassed = testCase.shouldDetect === detected;
    
    if (testPassed) {
      console.log(`${colors.green}${icons.check} PASS: ${testCase.name}${colors.reset}`);
      if (testCase.shouldDetect) {
        console.log(`   ${colors.dim}Detectado: ${detectedSeverity}${colors.reset}`);
      }
      passed++;
    } else {
      console.log(`${colors.red}${icons.cross} FAIL: ${testCase.name}${colors.reset}`);
      console.log(`   Esperado: ${testCase.shouldDetect ? 'DETECTAR' : 'NO DETECTAR'}`);
      console.log(`   Obtenido: ${detected ? 'DETECTADO' : 'NO DETECTADO'}`);
      failed++;
    }
    
    // Unstage y eliminar archivo
    execSync(`git reset HEAD "${testFile}"`, { cwd: ROOT_DIR, stdio: 'ignore' });
    
  } catch (error) {
    console.log(`${colors.red}${icons.cross} ERROR: ${testCase.name} - ${error.message}${colors.reset}`);
    failed++;
  }
}

// Limpiar directorio de prueba
try {
  rmSync(TEST_DIR, { recursive: true, force: true });
} catch {
  // Ignorar errores de limpieza
}

// Resumen
console.log('');
console.log(`${colors.cyan}${colors.bright}🧪 ==========================================${colors.reset}`);
console.log(`${colors.bright}Resultados:${colors.reset}`);
console.log(`  ${colors.green}${icons.check} Pasaron: ${passed}/${testCases.length}${colors.reset}`);
console.log(`  ${colors.red}${icons.cross} Fallaron: ${failed}/${testCases.length}${colors.reset}`);
console.log('');

if (failed === 0) {
  console.log(`${colors.green}${colors.bright}✅ TODOS LOS TESTS PASARON${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.red}${colors.bright}❌ ALGUNOS TESTS FALLARON${colors.reset}`);
  process.exit(1);
}
