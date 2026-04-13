#!/usr/bin/env node
/**
 * @fileoverview Security Health Check
 * 
 * Verificación completa del estado de seguridad del sistema.
 * Retorna código de salida apropiado para CI/CD:
 *   0 = Todos los checks pasaron ✅
 *   1 = Uno o más checks fallaron ❌
 * 
 * Checks realizados:
 * - Variables de entorno configuradas
 * - Headers de seguridad funcionando
 * - Conexión a Redis (rate limiting)
 * - Integridad de archivos de seguridad
 * 
 * Uso:
 *   node scripts/security-monitoring/security-health-check.js
 *   npm run security:health (configurado en package.json)
 * 
 * Para CI/CD:
 *   node scripts/security-monitoring/security-health-check.js --ci
 * 
 * @author SILEXAR Security Team
 * @version 1.0.0
 * @cross-platform Windows/Mac/Linux
 */

import { promises as fs, access } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { createHash } from 'crypto';
import { createConnection } from 'net';

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  // Variables de entorno requeridas
  requiredEnvVars: [
    // JWT y Seguridad
    { name: 'JWT_SECRET', minLength: 32, critical: true },
    { name: 'NEXTAUTH_SECRET', minLength: 32, critical: true },
    
    // Base de datos
    { name: 'DATABASE_URL', pattern: /^postgresql:\/\//, critical: true },
    
    // Redis (para rate limiting)
    { name: 'REDIS_URL', pattern: /^redis:\/\//, critical: false },
    { name: 'REDIS_HOST', critical: false },
    
    // OAuth (al menos uno debe estar configurado)
    { name: 'GOOGLE_CLIENT_ID', critical: false },
    { name: 'GITHUB_CLIENT_ID', critical: false },
  ],
  
  // Archivos de seguridad críticos que deben existir
  requiredSecurityFiles: [
    'src/lib/security/auth-middleware.ts',
    'src/lib/security/rate-limiter.ts',
    'src/lib/security/input-validation.ts',
    'src/lib/security/rbac.ts',
    'src/middleware.ts',
    'src/lib/auth/better-auth-config.ts'
  ],
  
  // Headers de seguridad esperados
  expectedSecurityHeaders: [
    'x-content-type-options',
    'x-frame-options',
    'content-security-policy',
    'strict-transport-security'
  ],
  
  // URLs a verificar
  checkUrls: {
    local: 'http://localhost:3000',
    health: '/api/health'
  },
  
  // Colores para terminal
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
  }
};

// ============================================
// UTILIDADES
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..', '..');

const c = (color, text) => `${CONFIG.colors[color] || ''}${text}${CONFIG.colors.reset}`;

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

// Check si archivo existe
async function fileExists(filepath) {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// CHECKS DE SALUD
// ============================================

// Check 1: Variables de entorno
async function checkEnvironmentVariables() {
  const results = {
    name: 'Environment Variables',
    status: 'pass',
    details: [],
    critical: true
  };
  
  const missing = [];
  const warnings = [];
  
  for (const envVar of CONFIG.requiredEnvVars) {
    const value = process.env[envVar.name];
    
    if (!value || value.trim() === '' || value.startsWith('your-')) {
      if (envVar.critical) {
        missing.push(envVar.name);
        results.details.push({
          status: 'fail',
          message: `❌ ${envVar.name}: No configurada o valor por defecto`
        });
      } else {
        warnings.push(envVar.name);
        results.details.push({
          status: 'warn',
          message: `⚠️  ${envVar.name}: No configurada (opcional)`
        });
      }
      continue;
    }
    
    // Validar longitud mínima
    if (envVar.minLength && value.length < envVar.minLength) {
      results.details.push({
        status: 'fail',
        message: `❌ ${envVar.name}: Muy corta (${value.length} chars, mínimo ${envVar.minLength})`
      });
      if (envVar.critical) missing.push(envVar.name);
      continue;
    }
    
    // Validar patrón
    if (envVar.pattern && !envVar.pattern.test(value)) {
      results.details.push({
        status: 'warn',
        message: `⚠️  ${envVar.name}: Formato incorrecto`
      });
      warnings.push(envVar.name);
      continue;
    }
    
    // Verificar que no sea un placeholder
    const placeholders = ['change-me', 'placeholder', 'example', 'test', '123456'];
    if (placeholders.some(p => value.toLowerCase().includes(p))) {
      results.details.push({
        status: 'warn',
        message: `⚠️  ${envVar.name}: Parece ser un valor de placeholder`
      });
      warnings.push(envVar.name);
      continue;
    }
    
    results.details.push({
      status: 'pass',
      message: `✅ ${envVar.name}: Configurada correctamente`
    });
  }
  
  if (missing.length > 0) {
    results.status = 'fail';
  } else if (warnings.length > 0) {
    results.status = 'warn';
  }
  
  results.summary = {
    total: CONFIG.requiredEnvVars.length,
    configured: CONFIG.requiredEnvVars.length - missing.length - warnings.length,
    missing: missing.length,
    warnings: warnings.length
  };
  
  return results;
}

// Check 2: Headers de seguridad
async function checkSecurityHeaders() {
  const results = {
    name: 'Security Headers',
    status: 'pass',
    details: [],
    critical: false
  };
  
  const baseUrl = process.env.TEST_URL || CONFIG.checkUrls.local;
  
  try {
    // Intentar hacer fetch a la app
    const response = await fetch(`${baseUrl}${CONFIG.checkUrls.health}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const headers = response.headers;
    const missing = [];
    
    for (const header of CONFIG.expectedSecurityHeaders) {
      const value = headers.get(header);
      if (!value) {
        missing.push(header);
        results.details.push({
          status: 'warn',
          message: `⚠️  ${header}: No presente`
        });
      } else {
        results.details.push({
          status: 'pass',
          message: `✅ ${header}: ${value.slice(0, 50)}${value.length > 50 ? '...' : ''}`
        });
      }
    }
    
    // Verificar X-Powered-By no está presente
    if (headers.get('x-powered-by')) {
      results.details.push({
        status: 'warn',
        message: `⚠️  X-Powered-By: Debería ser removido (information disclosure)`
      });
    }
    
    if (missing.length > 0) {
      results.status = 'warn';
    }
    
    results.summary = {
      total: CONFIG.expectedSecurityHeaders.length,
      present: CONFIG.expectedSecurityHeaders.length - missing.length,
      missing: missing.length
    };
    
  } catch (error) {
    results.status = 'fail';
    results.details.push({
      status: 'fail',
      message: `❌ No se pudo conectar a ${baseUrl}: ${error.message}`
    });
    results.summary = { error: error.message };
  }
  
  return results;
}

// Check 3: Conexión a Redis (para rate limiting)
async function checkRedisConnection() {
  const results = {
    name: 'Redis Connection (Rate Limiting)',
    status: 'pass',
    details: [],
    critical: false
  };
  
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT) || 6379;
  
  if (!redisUrl && !redisHost) {
    results.status = 'warn';
    results.details.push({
      status: 'warn',
      message: '⚠️  REDIS_URL/REDIS_HOST no configurado - usando fallback en memoria'
    });
    results.summary = { mode: 'in-memory-fallback' };
    return results;
  }
  
  // Intentar conexión TCP simple a Redis
  return new Promise((resolve) => {
    const socket = createConnection({ host: redisHost, port: redisPort });
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      results.details.push({
        status: 'pass',
        message: `✅ Redis conectado en ${redisHost}:${redisPort}`
      });
      socket.end();
      resolve(results);
    });
    
    socket.on('error', (error) => {
      results.status = 'warn';
      results.details.push({
        status: 'warn',
        message: `⚠️  Redis no disponible (${error.message}) - usando fallback en memoria`
      });
      results.summary = { mode: 'in-memory-fallback', error: error.message };
      resolve(results);
    });
    
    socket.on('timeout', () => {
      results.status = 'warn';
      results.details.push({
        status: 'warn',
        message: '⚠️  Redis timeout - usando fallback en memoria'
      });
      socket.destroy();
      resolve(results);
    });
  });
}

// Check 4: Integridad de archivos de seguridad
async function checkSecurityFileIntegrity() {
  const results = {
    name: 'Security File Integrity',
    status: 'pass',
    details: [],
    critical: true
  };
  
  const missing = [];
  const present = [];
  
  for (const file of CONFIG.requiredSecurityFiles) {
    const fullPath = join(rootDir, file);
    const exists = await fileExists(fullPath);
    
    if (!exists) {
      missing.push(file);
      results.details.push({
        status: 'fail',
        message: `❌ ${file}: No encontrado`
      });
    } else {
      present.push(file);
      results.details.push({
        status: 'pass',
        message: `✅ ${file}: Presente`
      });
    }
  }
  
  if (missing.length > 0) {
    results.status = 'fail';
  }
  
  results.summary = {
    total: CONFIG.requiredSecurityFiles.length,
    present: present.length,
    missing: missing.length,
    missingFiles: missing
  };
  
  return results;
}

// Check 5: Verificar .env files no estén en git
async function checkEnvFilesInGit() {
  const results = {
    name: 'Environment Files Security',
    status: 'pass',
    details: [],
    critical: true
  };
  
  const gitignorePath = join(rootDir, '.gitignore');
  
  try {
    const gitignore = await fs.readFile(gitignorePath, 'utf-8');
    const lines = gitignore.split('\n');
    
    const envPatterns = ['.env', '.env.local', '.env.*', '*.pem', '*.key'];
    const missingPatterns = [];
    
    for (const pattern of envPatterns) {
      const hasPattern = lines.some(line => 
        line.trim() === pattern || 
        line.trim().startsWith(pattern) ||
        line.includes(pattern)
      );
      
      if (!hasPattern) {
        missingPatterns.push(pattern);
        results.details.push({
          status: 'warn',
          message: `⚠️  .gitignore no incluye: ${pattern}`
        });
      }
    }
    
    if (missingPatterns.length === 0) {
      results.details.push({
        status: 'pass',
        message: '✅ .gitignore protege archivos sensibles'
      });
    } else {
      results.status = 'warn';
    }
    
    results.summary = { protected: missingPatterns.length === 0, missing: missingPatterns };
    
  } catch (error) {
    results.status = 'warn';
    results.details.push({
      status: 'warn',
      message: `⚠️  No se pudo leer .gitignore`
    });
  }
  
  return results;
}

// ============================================
// EJECUCIÓN PRINCIPAL
// ============================================

async function runHealthCheck() {
  const isCI = process.argv.includes('--ci');
  
  if (!isCI) {
    console.clear();
    console.log(c('blue', '\n╔══════════════════════════════════════════════════════════╗'));
    console.log(c('blue', '║         🔐 SECURITY HEALTH CHECK v1.0.0                  ║'));
    console.log(c('blue', '║         Silexar Pulse - Enterprise Security              ║'));
    console.log(c('blue', '╚══════════════════════════════════════════════════════════╝\n'));
  }
  
  console.log(c('dim', `⏰ Ejecutado: ${timestamp()}\n`));
  
  // Ejecutar todos los checks
  const checks = [
    checkEnvironmentVariables(),
    checkSecurityFileIntegrity(),
    checkEnvFilesInGit(),
    checkSecurityHeaders(),
    checkRedisConnection()
  ];
  
  const results = await Promise.all(checks);
  
  // Calcular estado general
  let allPassed = true;
  let hasFailures = false;
  
  for (const result of results) {
    if (result.status === 'fail' && result.critical) {
      hasFailures = true;
      allPassed = false;
    } else if (result.status !== 'pass') {
      allPassed = false;
    }
    
    // Imprimir resultado del check
    const icon = result.status === 'pass' ? '✅' : 
                 result.status === 'warn' ? '⚠️' : '❌';
    const color = result.status === 'pass' ? 'green' : 
                  result.status === 'warn' ? 'yellow' : 'red';
    
    console.log(c('bold', `${icon} ${result.name}`));
    
    if (!isCI) {
      for (const detail of result.details) {
        console.log(`   ${detail.message}`);
      }
      if (result.summary) {
        console.log(c('dim', `   Resumen: ${JSON.stringify(result.summary)}`));
      }
      console.log('');
    }
  }
  
  // Resumen final
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.status === 'pass').length;
  const warningChecks = results.filter(r => r.status === 'warn').length;
  const failedChecks = results.filter(r => r.status === 'fail').length;
  
  if (!isCI) {
    console.log(c('blue', '\n╔══════════════════════════════════════════════════════════╗'));
    console.log(c('blue', '║                      RESUMEN                             ║'));
    console.log(c('blue', '╚══════════════════════════════════════════════════════════╝'));
    console.log(c('green', `   ✅ Checks pasados: ${passedChecks}/${totalChecks}`));
    console.log(c('yellow', `   ⚠️  Advertencias: ${warningChecks}`));
    console.log(c('red', `   ❌ Fallos críticos: ${failedChecks}`));
    
    if (allPassed) {
      console.log(c('green', '\n   🎉 Todos los checks de seguridad pasaron\n'));
    } else if (hasFailures) {
      console.log(c('red', '\n   🚨 Hay fallos críticos que deben ser corregidos\n'));
    } else {
      console.log(c('yellow', '\n   ⚠️  Hay advertencias que deberían revisarse\n'));
    }
  }
  
  // Retornar código de salida apropiado
  return {
    success: !hasFailures,
    allPassed,
    summary: { passed: passedChecks, warnings: warningChecks, failed: failedChecks },
    results
  };
}

// ============================================
// MAIN
// ============================================

async function main() {
  try {
    const result = await runHealthCheck();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(c('red', `\n❌ Error en health check: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runHealthCheck, checkEnvironmentVariables, checkSecurityHeaders };
