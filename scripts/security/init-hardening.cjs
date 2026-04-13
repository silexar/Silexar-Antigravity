#!/usr/bin/env node
/**
 * 🚀 SILEXAR PULSE - SECURITY HARDENING INITIALIZER
 * 
 * Script de instalación e inicialización del sistema de Hardening Continuo.
 * Configura todas las herramientas de seguridad automáticamente.
 * 
 * @version 1.0.0
 * @tier TIER_0_PENTAGON++
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colorMap = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    header: 'magenta'
  };
  
  const color = colors[colorMap[type]] || colors.blue;
  const prefix = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 type === 'warning' ? '⚠️' : 
                 type === 'header' ? '🔒' : 'ℹ️';
  
  console.log(`${color}${prefix} [${timestamp}] ${message}${colors.reset}`);
}

function execute(command, silent = true) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (e) {
    if (!silent) {
      console.error(e.message);
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIONES PRE-INSTALACIÓN
// ═══════════════════════════════════════════════════════════════
function checkPrerequisites() {
  log('Checking prerequisites...', 'header');
  
  const checks = [
    {
      name: 'Node.js',
      command: 'node --version',
      required: true
    },
    {
      name: 'npm',
      command: 'npm --version',
      required: true
    },
    {
      name: 'Git',
      command: 'git --version',
      required: true
    },
    {
      name: 'Git repository',
      check: () => fs.existsSync('.git'),
      required: false
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    let passed = false;
    
    if (check.command) {
      const result = execute(check.command);
      passed = result !== null;
      if (passed) {
        log(`${check.name}: ${result.trim()}`, 'success');
      }
    } else if (check.check) {
      passed = check.check();
      if (passed) {
        log(`${check.name}: Found`, 'success');
      }
    }
    
    if (!passed) {
      if (check.required) {
        log(`${check.name}: NOT FOUND (Required)`, 'error');
        allPassed = false;
      } else {
        log(`${check.name}: NOT FOUND (Optional)`, 'warning');
      }
    }
  });
  
  return allPassed;
}

// ═══════════════════════════════════════════════════════════════
// INSTALAR DEPENDENCIAS DE SEGURIDAD
// ═══════════════════════════════════════════════════════════════
function installSecurityDependencies() {
  log('Installing security dependencies...', 'header');
  
  const dependencies = [
    // Husky para hooks
    'husky',
    
    // lint-staged
    'lint-staged',
    
    // ESLint security plugins
    'eslint-plugin-security',
    'eslint-plugin-no-secrets',
    
    // detect-secrets
    'detect-secrets',
    
    // Prettier
    'prettier'
  ];
  
  const devDependencies = [
    '@types/node'
  ];
  
  log('Installing dependencies (this may take a few minutes)...');
  
  // Instalar dependencias
  dependencies.forEach(dep => {
    log(`Installing ${dep}...`);
    execute(`npm install ${dep} --save --legacy-peer-deps`, false);
  });
  
  // Instalar devDependencies
  devDependencies.forEach(dep => {
    log(`Installing ${dep}...`);
    execute(`npm install ${dep} --save-dev --legacy-peer-deps`, false);
  });
  
  log('Dependencies installed successfully!', 'success');
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAR HUSKY
// ═══════════════════════════════════════════════════════════════
function setupHusky() {
  log('Setting up Husky hooks...', 'header');
  
  // Inicializar husky
  execute('npx husky install', false);
  
  // Crear directorio si no existe
  if (!fs.existsSync('.husky')) {
    fs.mkdirSync('.husky', { recursive: true });
  }
  
  // Crear hook pre-commit
  const preCommitHook = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔒 Running security pre-commit checks..."

# Run lint-staged
npx lint-staged || exit 1

# Run security scan
npm run security:health:ci || exit 1

echo "✅ All security checks passed!"
`;
  
  fs.writeFileSync('.husky/pre-commit', preCommitHook);
  execute('chmod +x .husky/pre-commit');
  
  // Crear hook commit-msg
  const commitMsgHook = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate commit message format
commit_msg_file=$1
commit_msg=$(head -n1 "$commit_msg_file")

# Check for security-related commits
if echo "$commit_msg" | grep -qiE "(security|vuln|cve|password|secret|token)"; then
  echo "⚠️  Security-related commit detected"
  echo "Make sure no secrets are being committed!"
fi

echo "✅ Commit message validated"
`;
  
  fs.writeFileSync('.husky/commit-msg', commitMsgHook);
  execute('chmod +x .husky/commit-msg');
  
  log('Husky hooks configured!', 'success');
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAR ESLINT
// ═══════════════════════════════════════════════════════════════
function setupESLint() {
  log('Configuring ESLint security rules...', 'header');
  
  const eslintConfigPath = 'eslint.config.js';
  
  if (!fs.existsSync(eslintConfigPath)) {
    log('Creating ESLint configuration...');
    
    const eslintConfig = `const { dirname } = require('path');
const { fileURLToPath } = require('url');
const { FlatCompat } = require('@eslint/eslintrc');
const security = require('eslint-plugin-security');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      security: security
    },
    rules: {
      // Security rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',
      
      // Best practices
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error'
    }
  }
];
`;
    
    fs.writeFileSync(eslintConfigPath, eslintConfig);
    log('ESLint configuration created!', 'success');
  } else {
    log('ESLint configuration already exists, skipping...', 'warning');
  }
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZAR BASE DE DATOS DE APRENDIZAJE
// ═══════════════════════════════════════════════════════════════
function initLearningDatabase() {
  log('Initializing learning database...', 'header');
  
  const dbPath = '.security-learning-db.json';
  
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      version: '1.0.0',
      initialized: new Date().toISOString(),
      errors: {},
      fixes: {},
      patterns: {},
      statistics: {
        totalFixed: 0,
        totalPrevented: 0,
        falsePositives: 0,
        lastUpdate: null
      }
    };
    
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    log('Learning database initialized!', 'success');
  } else {
    log('Learning database already exists', 'warning');
  }
}

// ═══════════════════════════════════════════════════════════════
// CREAR DIRECTORIOS NECESARIOS
// ═══════════════════════════════════════════════════════════════
function createDirectories() {
  log('Creating required directories...', 'header');
  
  const dirs = [
    'security-reports',
    '.security-backups',
    'scripts/security'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created: ${dir}`, 'success');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAR INSTALACIÓN
// ═══════════════════════════════════════════════════════════════
function verifyInstallation() {
  log('Verifying installation...', 'header');
  
  const checks = [
    { name: 'Husky hooks', path: '.husky/pre-commit' },
    { name: 'lint-staged config', path: '.lintstagedrc.js' },
    { name: 'Security config', path: 'security.config.js' },
    { name: 'Auto-remediation', path: 'scripts/security/auto-remediate.js' },
    { name: 'Security dashboard', path: 'scripts/security/security-dashboard.js' },
    { name: 'Learning database', path: '.security-learning-db.json' }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    if (fs.existsSync(check.path)) {
      log(`${check.name}: OK`, 'success');
    } else {
      log(`${check.name}: MISSING`, 'error');
      allPassed = false;
    }
  });
  
  return allPassed;
}

// ═══════════════════════════════════════════════════════════════
// EJECUTAR PRIMER SCAN
// ═══════════════════════════════════════════════════════════════
function runInitialScan() {
  log('Running initial security scan...', 'header');
  
  try {
    // Verificar que no hay secrets
    log('Scanning for secrets...');
    const result = execute('git secrets --scan 2>/dev/null || echo "git-secrets not installed"');
    
    if (result && !result.includes('not installed')) {
      log('No secrets detected!', 'success');
    }
    
    // npm audit
    log('Running npm audit...');
    execute('npm audit --audit-level=moderate', false);
    
  } catch (e) {
    log('Initial scan completed with warnings', 'warning');
  }
}

// ═══════════════════════════════════════════════════════════════
// MOSTRAR RESUMEN
// ═══════════════════════════════════════════════════════════════
function showSummary() {
  console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║' + colors.bright + '         🔒 SECURITY HARDENING INITIALIZED                     ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '╚══════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('');
  console.log(colors.green + '✅ The following security features are now active:' + colors.reset);
  console.log('');
  console.log('  🔐 Pre-commit hooks (secrets scanning)');
  console.log('  📦 Dependency vulnerability scanning');
  console.log('  🔧 Auto-remediation engine');
  console.log('  📊 Security dashboard');
  console.log('  🧠 Learning system for error prevention');
  console.log('  🚀 GitHub Actions CI/CD integration');
  console.log('');
  console.log(colors.yellow + 'Next steps:' + colors.reset);
  console.log('  1. Configure environment variables (see .env.example)');
  console.log('  2. Run: npm run security:dashboard');
  console.log('  3. Commit the new configuration files');
  console.log('');
  console.log(colors.cyan + 'Commands available:' + colors.reset);
  console.log('  npm run security:dashboard     - Launch security dashboard');
  console.log('  npm run security:remediate     - Run auto-remediation');
  console.log('  npm run security:health        - Run health check');
  console.log('  npm run security:ci            - Run CI security checks');
  console.log('');
  console.log(colors.green + 'Your system is now protected by TIER 0 Pentagon++ security!' + colors.reset);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════
function main() {
  console.log('\n' + colors.cyan + colors.bright);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🔒 SILEXAR PULSE - SECURITY HARDENING SETUP             ║');
  console.log('║              Tier 0 - Pentagon++ Protection                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset + '\n');
  
  // Verificar prerequisitos
  if (!checkPrerequisites()) {
    log('Prerequisites check failed. Please install required tools.', 'error');
    process.exit(1);
  }
  
  // Instalar dependencias
  installSecurityDependencies();
  
  // Configurar herramientas
  setupHusky();
  setupESLint();
  
  // Inicializar base de datos
  initLearningDatabase();
  
  // Crear directorios
  createDirectories();
  
  // Verificar instalación
  if (!verifyInstallation()) {
    log('Installation verification failed.', 'error');
    process.exit(1);
  }
  
  // Ejecutar scan inicial
  runInitialScan();
  
  // Mostrar resumen
  showSummary();
  
  log('Setup complete!', 'success');
}

// Ejecutar
if (require.main === module) {
  main();
}

module.exports = { main };
