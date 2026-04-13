#!/usr/bin/env node
/**
 * Script de instalación del Sistema de Auto-Corrección de Seguridad
 * @file scripts/install-security-autofix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Instalando Sistema de Auto-Corrección de Seguridad...\n');

// Verificar que el CLI existe
const cliPath = path.join(__dirname, 'security-autofix', 'cli.ts');
if (!fs.existsSync(cliPath)) {
  console.error('❌ Error: No se encontró el CLI en', cliPath);
  process.exit(1);
}

// Crear directorio de seguridad si no existe
const securityDir = path.join(process.cwd(), '.security');
if (!fs.existsSync(securityDir)) {
  fs.mkdirSync(securityDir, { recursive: true });
  console.log('✅ Directorio .security creado');
}

// Crear archivo .gitignore para .security si no existe
const gitignorePath = path.join(securityDir, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, `# Archivos de backup del auto-fixer
*.backup-*

# Historial y KB local (opcional - descomentar para ignorar)
# history.json
# knowledge-base.json
`);
  console.log('✅ .gitignore creado en .security/');
}

// Verificar glob está instalado
try {
  require.resolve('glob');
  console.log('✅ glob está instalado');
} catch {
  console.log('⚠️  glob no está instalado. Instalando...');
  const { execSync } = require('child_process');
  execSync('npm install glob --save-dev', { stdio: 'inherit' });
  console.log('✅ glob instalado');
}

// Verificar tsx está disponible
try {
  require.resolve('tsx');
  console.log('✅ tsx está disponible');
} catch {
  console.log('⚠️  tsx no está instalado. Instalando...');
  const { execSync } = require('child_process');
  execSync('npm install tsx --save-dev', { stdio: 'inherit' });
  console.log('✅ tsx instalado');
}

console.log('\n✅ Instalación completada!');
console.log('\nComandos disponibles:');
console.log('  npm run security:autofix:info    - Ver información del sistema');
console.log('  npm run security:autofix:scan    - Escanear archivos');
console.log('  npm run security:autofix         - Aplicar correcciones');
console.log('  npm run security:autofix:check   - Verificar (CI/CD)');
console.log('  npm run security:autofix:report  - Generar reporte HTML');
console.log('\nPara más información, ver: src/lib/security/auto-fix/README.md');
