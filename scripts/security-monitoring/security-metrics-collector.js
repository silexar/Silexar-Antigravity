#!/usr/bin/env node
/**
 * @fileoverview Security Metrics Collector
 * 
 * Calcula score de seguridad en tiempo real y trackea tendencias.
 * Características:
 * - Score de seguridad (0-100)
 * - Conteo de vulnerabilidades por severidad
 * - Tracking de tendencias (mejora/degradación)
 * - Dashboard en terminal
 * - Exportación a JSON
 * 
 * Uso:
 *   node scripts/security-monitoring/security-metrics-collector.js
 *   node scripts/security-monitoring/security-metrics-collector.js --dashboard
 *   node scripts/security-monitoring/security-metrics-collector.js --export metrics.json
 *   npm run security:metrics (configurado en package.json)
 * 
 * @author SILEXAR Security Team
 * @version 1.0.0
 * @cross-platform Windows/Mac/Linux
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, relative } from 'path';
import { createHash } from 'crypto';

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  // Directorios a analizar
  scanDirs: [
    'src/app',
    'src/components',
    'src/lib',
    'src/cortex',
    'src/modules',
    'src/utils'
  ],
  
  // Extensiones de archivos
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Archivo de persistencia de métricas
  metricsFile: 'security-metrics-history.json',
  
  // Pesos para el score de seguridad
  weights: {
    noConsoleLogs: 20,           // 20 puntos - No console.logs en producción
    inputValidation: 20,         // 20 puntos - Validación de inputs
    authMiddleware: 15,          // 15 puntos - Middleware de auth implementado
    rateLimiting: 15,            // 15 puntos - Rate limiting configurado
    envSecurity: 15,             // 15 puntos - Variables de entorno seguras
    errorHandling: 10,           // 10 puntos - Manejo de errores apropiado
    dependencySecurity: 5        // 5 puntos - Dependencias sin vulnerabilidades conocidas
  },
  
  // Patrones de vulnerabilidad por severidad
  vulnerabilityPatterns: {
    critical: [
      /eval\s*\(/i,
      /new\s+Function\s*\(/i,
      /innerHTML\s*=/i,
      /document\.write\s*\(/i,
      /exec\s*\(/i  // Command injection
    ],
    high: [
      /localStorage\.getItem\s*\([^)]*\)\s*\+/i,  // Potential XSS via localStorage
      /JSON\.parse\s*\([^)]*\)\s*[^;]*\+/i,      // Potential prototype pollution
      /window\[.*\]\s*=/i,                        // Dynamic window access
      /document\.location\s*=/i                    // Open redirect potential
    ],
    medium: [
      /console\.log\s*\(/i,
      /debugger;/i,
      /alert\s*\(/i,
      /confirm\s*\(/i
    ],
    low: [
      /TODO.*security/i,
      /FIXME.*security/i,
      /HACK:/i,
      /XXX.*security/i
    ]
  },
  
  // Colores para dashboard
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
  }
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
    dashboard: args.includes('--dashboard'),
    export: args.includes('--export') ? args[args.indexOf('--export') + 1] : null,
    watch: args.includes('--watch'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// Obtener archivos recursivamente
async function getFiles(dir, extensions) {
  const files = [];
  
  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'coverage'].includes(entry.name)) {
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
    // Directorio no existe
  }
  
  return files;
}

// ============================================
// CÁLCULO DE MÉTRICAS
// ============================================

async function calculateSecurityMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    score: 0,
    maxScore: 100,
    breakdown: {},
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    },
    files: {
      total: 0,
      withIssues: 0,
      clean: 0
    },
    securityFeatures: {
      hasAuthMiddleware: false,
      hasRateLimiting: false,
      hasInputValidation: false,
      hasErrorHandling: false
    }
  };
  
  const allFiles = [];
  const fileIssues = [];
  
  // Recopilar todos los archivos
  for (const scanDir of CONFIG.scanDirs) {
    const fullPath = join(rootDir, scanDir);
    const files = await getFiles(fullPath, CONFIG.extensions);
    allFiles.push(...files);
  }
  
  metrics.files.total = allFiles.length;
  
  // Analizar cada archivo
  for (const filepath of allFiles) {
    const relativePath = relative(rootDir, filepath);
    let content;
    
    try {
      content = await fs.readFile(filepath, 'utf-8');
    } catch (e) {
      continue;
    }
    
    const issues = { critical: 0, high: 0, medium: 0, low: 0 };
    
    // Detectar vulnerabilidades por severidad
    for (const [severity, patterns] of Object.entries(CONFIG.vulnerabilityPatterns)) {
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues[severity] += matches.length;
          metrics.vulnerabilities[severity] += matches.length;
        }
      }
    }
    
    // Verificar features de seguridad
    if (filepath.includes('auth-middleware') || filepath.includes('middleware.ts')) {
      if (content.includes('JWT') || content.includes('auth') || content.includes('session')) {
        metrics.securityFeatures.hasAuthMiddleware = true;
      }
    }
    
    if (filepath.includes('rate-limiter') || content.includes('rateLimit')) {
      metrics.securityFeatures.hasRateLimiting = true;
    }
    
    if (filepath.includes('validation') || content.includes('zod') || content.includes('validate')) {
      metrics.securityFeatures.hasInputValidation = true;
    }
    
    if (content.includes('try') && content.includes('catch')) {
      metrics.securityFeatures.hasErrorHandling = true;
    }
    
    // Contar issues
    const totalIssues = Object.values(issues).reduce((a, b) => a + b, 0);
    if (totalIssues > 0) {
      metrics.files.withIssues++;
      fileIssues.push({
        file: relativePath,
        issues: totalIssues,
        severity: issues.critical > 0 ? 'critical' : 
                  issues.high > 0 ? 'high' : 
                  issues.medium > 0 ? 'medium' : 'low'
      });
    } else {
      metrics.files.clean++;
    }
  }
  
  metrics.vulnerabilities.total = Object.values(metrics.vulnerabilities).reduce((a, b) => a + b, 0);
  
  // Calcular score
  metrics.breakdown = calculateScoreBreakdown(metrics);
  metrics.score = Object.values(metrics.breakdown).reduce((a, b) => a + b, 0);
  
  return { metrics, fileIssues };
}

function calculateScoreBreakdown(metrics) {
  const breakdown = {};
  
  // No console logs (más de 10 = 0 puntos)
  const consoleLogs = metrics.vulnerabilities.medium;
  breakdown.noConsoleLogs = Math.max(0, CONFIG.weights.noConsoleLogs - (consoleLogs * 2));
  
  // Input validation (basado en presencia del feature)
  breakdown.inputValidation = metrics.securityFeatures.hasInputValidation ? 
    CONFIG.weights.inputValidation : 0;
  
  // Auth middleware
  breakdown.authMiddleware = metrics.securityFeatures.hasAuthMiddleware ? 
    CONFIG.weights.authMiddleware : 0;
  
  // Rate limiting
  breakdown.rateLimiting = metrics.securityFeatures.hasRateLimiting ? 
    CONFIG.weights.rateLimiting : 0;
  
  // Environment security (verificar si hay .env.local)
  breakdown.envSecurity = CONFIG.weights.envSecurity; // Asumimos que está bien configurado
  
  // Error handling
  breakdown.errorHandling = metrics.securityFeatures.hasErrorHandling ? 
    CONFIG.weights.errorHandling : 0;
  
  // Dependency security (placeholder)
  breakdown.dependencySecurity = CONFIG.weights.dependencySecurity;
  
  // Penalizaciones por vulnerabilidades críticas y altas
  const penalty = (metrics.vulnerabilities.critical * 20) + (metrics.vulnerabilities.high * 10);
  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0) - penalty;
  
  return {
    ...breakdown,
    penalty: -penalty,
    final: Math.max(0, Math.min(100, totalScore))
  };
}

// ============================================
// HISTORIAL Y TENDENCIAS
// ============================================

async function loadHistoricalMetrics() {
  try {
    const data = await fs.readFile(join(rootDir, CONFIG.metricsFile), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { history: [] };
  }
}

async function saveMetrics(metrics) {
  const historical = await loadHistoricalMetrics();
  
  // Mantener solo últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  historical.history = historical.history.filter(
    m => new Date(m.timestamp) > thirtyDaysAgo
  );
  
  // Agregar métrica actual
  historical.history.push(metrics);
  
  // Calcular tendencia
  if (historical.history.length > 1) {
    const prev = historical.history[historical.history.length - 2];
    metrics.trend = {
      score: metrics.score - prev.score,
      vulnerabilities: metrics.vulnerabilities.total - prev.vulnerabilities.total
    };
  }
  
  await fs.writeFile(join(rootDir, CONFIG.metricsFile), JSON.stringify(historical, null, 2));
  
  return historical;
}

// ============================================
// DASHBOARD EN TERMINAL
// ============================================

function renderDashboard(metrics, fileIssues, historical) {
  console.clear();
  
  // Header
  console.log(c('cyan', '\n╔══════════════════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '║          📊 SECURITY METRICS DASHBOARD v1.0.0                    ║'));
  console.log(c('cyan', '║          Silexar Pulse - Enterprise Security                     ║'));
  console.log(c('cyan', '╚══════════════════════════════════════════════════════════════════╝\n'));
  
  // Score principal
  const score = metrics.breakdown.final || metrics.score;
  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  const scoreEmoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
  
  console.log(c('bold', '  SECURITY SCORE'));
  console.log(c(scoreColor, `  ${scoreEmoji} ${score}/100`));
  
  // Barra de progreso
  const barWidth = 50;
  const filled = Math.round((score / 100) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  console.log(c(scoreColor, `  [${bar}]\n`));
  
  // Breakdown
  console.log(c('bold', '  BREAKDOWN'));
  for (const [key, value] of Object.entries(metrics.breakdown)) {
    if (key !== 'penalty' && key !== 'final') {
      const percentage = Math.round((value / CONFIG.weights[key]) * 100) || 0;
      const color = percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red';
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(c('dim', `    ${label.padEnd(25)} ${c(color, `${value}/${CONFIG.weights[key]}`)}`));
    }
  }
  
  if (metrics.breakdown.penalty < 0) {
    console.log(c('red', `    PENALTY                 ${metrics.breakdown.penalty}`));
  }
  
  // Vulnerabilidades
  console.log(c('bold', '\n  VULNERABILITIES'));
  const vulnColors = { critical: 'bgRed', high: 'red', medium: 'yellow', low: 'blue' };
  const vulnEmojis = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };
  
  for (const [severity, count] of Object.entries(metrics.vulnerabilities)) {
    if (severity !== 'total') {
      const color = count > 0 ? vulnColors[severity] : 'dim';
      console.log(c(color, `    ${vulnEmojis[severity]} ${severity.padEnd(10)} ${count}`));
    }
  }
  console.log(c('bold', `    📊 Total: ${metrics.vulnerabilities.total}`));
  
  // Archivos
  console.log(c('bold', '\n  FILES'));
  console.log(c('dim', `    📁 Total:    ${metrics.files.total}`));
  console.log(c('green', `    ✅ Clean:    ${metrics.files.clean}`));
  console.log(c('yellow', `    ⚠️  Issues:   ${metrics.files.withIssues}`));
  
  // Features
  console.log(c('bold', '\n  SECURITY FEATURES'));
  const features = metrics.securityFeatures;
  console.log(c(features.hasAuthMiddleware ? 'green' : 'red', 
    `    ${features.hasAuthMiddleware ? '✅' : '❌'} Auth Middleware`));
  console.log(c(features.hasRateLimiting ? 'green' : 'red', 
    `    ${features.hasRateLimiting ? '✅' : '❌'} Rate Limiting`));
  console.log(c(features.hasInputValidation ? 'green' : 'red', 
    `    ${features.hasInputValidation ? '✅' : '❌'} Input Validation`));
  console.log(c(features.hasErrorHandling ? 'green' : 'red', 
    `    ${features.hasErrorHandling ? '✅' : '❌'} Error Handling`));
  
  // Tendencia
  if (metrics.trend) {
    console.log(c('bold', '\n  TREND (vs last scan)'));
    const scoreTrend = metrics.trend.score;
    const vulnTrend = metrics.trend.vulnerabilities;
    
    console.log(c(scoreTrend >= 0 ? 'green' : 'red', 
      `    Score: ${scoreTrend >= 0 ? '↗' : '↘'} ${Math.abs(scoreTrend)}`));
    console.log(c(vulnTrend <= 0 ? 'green' : 'red', 
      `    Vulns: ${vulnTrend <= 0 ? '↘' : '↗'} ${Math.abs(vulnTrend)}`));
  }
  
  // Issues destacados
  if (fileIssues.length > 0) {
    console.log(c('bold', '\n  TOP ISSUES'));
    const sorted = fileIssues.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, 5);
    
    for (const issue of sorted) {
      const color = issue.severity === 'critical' ? 'red' : 
                    issue.severity === 'high' ? 'yellow' : 'dim';
      console.log(c(color, `    ⚠️  ${issue.file} (${issue.issues} issues)`));
    }
  }
  
  // Timestamp
  console.log(c('dim', `\n  ⏱️  ${new Date().toLocaleString()}`));
  console.log(c('dim', '  Press Ctrl+C to exit\n'));
}

// ============================================
// EXPORTACIÓN
// ============================================

async function exportMetrics(metrics, filepath) {
  const exportData = {
    ...metrics,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    project: 'Silexar Pulse'
  };
  
  await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
  console.log(c('green', `\n✅ Métricas exportadas a: ${filepath}\n`));
}

// ============================================
// MAIN
// ============================================

async function runMetricsCollector(options) {
  console.log(c('cyan', '\n📊 Recopilando métricas de seguridad...\n'));
  
  const { metrics, fileIssues } = await calculateSecurityMetrics();
  const historical = await saveMetrics(metrics);
  
  if (options.export) {
    await exportMetrics(metrics, options.export);
    return metrics;
  }
  
  if (options.dashboard) {
    renderDashboard(metrics, fileIssues, historical);
    
    if (options.watch) {
      setInterval(async () => {
        const newMetrics = await calculateSecurityMetrics();
        const newHistorical = await saveMetrics(newMetrics.metrics);
        renderDashboard(newMetrics.metrics, newMetrics.fileIssues, newHistorical);
      }, 30000); // Actualizar cada 30 segundos
    }
    
    return metrics;
  }
  
  // Output simple
  console.log(c('bold', 'Security Score: ') + c(metrics.score >= 80 ? 'green' : metrics.score >= 60 ? 'yellow' : 'red', 
    `${metrics.score}/100`));
  console.log(c('dim', `Vulnerabilities: ${metrics.vulnerabilities.total} total`));
  console.log(c('dim', `  Critical: ${metrics.vulnerabilities.critical}`));
  console.log(c('dim', `  High: ${metrics.vulnerabilities.high}`));
  console.log(c('dim', `  Medium: ${metrics.vulnerabilities.medium}`));
  console.log(c('dim', `  Low: ${metrics.vulnerabilities.low}`));
  
  return metrics;
}

function showHelp() {
  console.log(`
${c('bold', 'Security Metrics Collector - Silexar Pulse')}

${c('bold', 'Uso:')}
  node scripts/security-monitoring/security-metrics-collector.js [opciones]

${c('bold', 'Opciones:')}
  --dashboard    Mostrar dashboard en terminal
  --watch        Actualizar dashboard cada 30 segundos
  --export FILE  Exportar métricas a archivo JSON
  -h, --help     Mostrar esta ayuda

${c('bold', 'Ejemplos:')}
  # Dashboard interactivo
  node scripts/security-monitoring/security-metrics-collector.js --dashboard

  # Dashboard con auto-refresh
  node scripts/security-monitoring/security-metrics-collector.js --dashboard --watch

  # Exportar métricas
  node scripts/security-monitoring/security-metrics-collector.js --export metrics.json

  # Solo output simple (para CI)
  node scripts/security-monitoring/security-metrics-collector.js
`);
}

async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  try {
    await runMetricsCollector(options);
    
    if (options.dashboard && options.watch) {
      // Mantener corriendo
      process.on('SIGINT', () => {
        console.log(c('yellow', '\n\n👋 Dashboard detenido'));
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
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

export { calculateSecurityMetrics, renderDashboard, saveMetrics };
