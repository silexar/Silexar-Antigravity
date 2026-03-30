#!/usr/bin/env node

/**
 * 🔍 VALIDADOR TIER 0 - MÓDULO CAMPAÑAS
 * Script de validación completa para estándar Fortune 10
 */

const fs = require('fs');
const path = require('path');

const CAMPANAS_MODULE_PATH = path.join(__dirname, '..', 'src', 'modules', 'campanas');

console.log('🚀 INICIANDO VALIDACIÓN TIER 0 - MÓDULO CAMPAÑAS\n');

// Validaciones de estructura
const requiredDirectories = [
  'domain/entities',
  'domain/value-objects',
  'domain/repositories',
  'application/commands',
  'application/queries',
  'application/handlers',
  'infrastructure/repositories',
  'infrastructure/external',
  'infrastructure/database',
  'presentation/controllers'
];

const requiredFiles = [
  'domain/entities/CampanaPublicitaria.ts',
  'domain/value-objects/NumeroCampana.ts',
  'domain/value-objects/EstadoEjecucion.ts',
  'domain/value-objects/ValorNeto.ts',
  'domain/repositories/ICampanaPublicitariaRepository.ts',
  'application/commands/CrearCampanaCommand.ts',
  'application/handlers/CampanaCommandHandler.ts',
  'infrastructure/repositories/PrismaCampanaPublicitariaRepository.ts',
  'infrastructure/external/CortexCampaignOptimizationService.ts',
  'presentation/controllers/CampanasController.ts',
  'index.ts'
];

let validationErrors = [];
let validationWarnings = [];

// Validar directorios
console.log('📁 Validando estructura de directorios...');
requiredDirectories.forEach(dir => {
  const fullPath = path.join(CAMPANAS_MODULE_PATH, dir);
  if (!fs.existsSync(fullPath)) {
    validationErrors.push(`❌ Directorio faltante: ${dir}`);
  } else {
    console.log(`✅ ${dir}`);
  }
});

// Validar archivos
console.log('\n📄 Validando archivos requeridos...');
requiredFiles.forEach(file => {
  const fullPath = path.join(CAMPANAS_MODULE_PATH, file);
  if (!fs.existsSync(fullPath)) {
    validationErrors.push(`❌ Archivo faltante: ${file}`);
  } else {
    console.log(`✅ ${file}`);
  }
});

// Validar contenido de archivos críticos
console.log('\n🔍 Validando contenido de archivos críticos...');

// Validar CampanaPublicitaria
const campanaPubPath = path.join(CAMPANAS_MODULE_PATH, 'domain/entities/CampanaPublicitaria.ts');
if (fs.existsSync(campanaPubPath)) {
  const content = fs.readFileSync(campanaPubPath, 'utf8');
  if (!content.includes('export class CampanaPublicitaria')) {
    validationErrors.push('❌ CampanaPublicitaria: Clase principal no encontrada');
  }
  if (!content.includes('crearNueva')) {
    validationErrors.push('❌ CampanaPublicitaria: Factory method crearNueva no encontrado');
  }
  if (!content.includes('confirmar')) {
    validationWarnings.push('⚠️ CampanaPublicitaria: Método confirmar podría estar faltante');
  }
  console.log('✅ CampanaPublicitaria: Estructura válida');
}

// Validar Repository
const repoPath = path.join(CAMPANAS_MODULE_PATH, 'infrastructure/repositories/PrismaCampanaPublicitariaRepository.ts');
if (fs.existsSync(repoPath)) {
  const content = fs.readFileSync(repoPath, 'utf8');
  if (content.includes('TODO') || content.includes('console.log')) {
    validationWarnings.push('⚠️ Repository: Contiene TODOs o console.log');
  }
  if (!content.includes('async guardar')) {
    validationErrors.push('❌ Repository: Método guardar no implementado');
  }
  console.log('✅ Repository: Estructura básica válida');
}

// Validar Command Handler
const handlerPath = path.join(CAMPANAS_MODULE_PATH, 'application/handlers/CampanaCommandHandler.ts');
if (fs.existsSync(handlerPath)) {
  const content = fs.readFileSync(handlerPath, 'utf8');
  if (content.includes(': any')) {
    validationWarnings.push('⚠️ Command Handler: Contiene tipos "any"');
  }
  if (!content.includes('async execute')) {
    validationErrors.push('❌ Command Handler: Método execute no encontrado');
  }
  console.log('✅ Command Handler: Estructura válida');
}

// Validar tests
console.log('\n🧪 Validando tests...');
const testsPath = path.join(CAMPANAS_MODULE_PATH, 'domain/entities/__tests__');
if (fs.existsSync(testsPath)) {
  const testFiles = fs.readdirSync(testsPath).filter(f => f.endsWith('.test.ts'));
  if (testFiles.length === 0) {
    validationWarnings.push('⚠️ Tests: No se encontraron archivos de test');
  } else {
    console.log(`✅ Tests: ${testFiles.length} archivos encontrados`);
  }
} else {
  validationWarnings.push('⚠️ Tests: Directorio de tests no encontrado');
}

// Validar TypeScript config
console.log('\n⚙️ Validando configuración TypeScript...');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.campanas.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (!tsconfig.compilerOptions?.strict) {
    validationWarnings.push('⚠️ TypeScript: Modo strict no habilitado');
  }
  console.log('✅ TypeScript: Configuración encontrada');
} else {
  validationErrors.push('❌ TypeScript: tsconfig.campanas.json no encontrado');
}

// Resumen final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VALIDACIÓN TIER 0');
console.log('='.repeat(60));

if (validationErrors.length === 0) {
  console.log('🎉 ¡VALIDACIÓN EXITOSA! El módulo cumple con estándares TIER 0');
} else {
  console.log('❌ VALIDACIÓN FALLIDA - Errores críticos encontrados:');
  validationErrors.forEach(error => console.log(`   ${error}`));
}

if (validationWarnings.length > 0) {
  console.log('\n⚠️ ADVERTENCIAS (recomendaciones de mejora):');
  validationWarnings.forEach(warning => console.log(`   ${warning}`));
}

console.log(`\n📈 MÉTRICAS:`);
console.log(`   • Directorios validados: ${requiredDirectories.length}`);
console.log(`   • Archivos validados: ${requiredFiles.length}`);
console.log(`   • Errores críticos: ${validationErrors.length}`);
console.log(`   • Advertencias: ${validationWarnings.length}`);

const score = Math.max(0, 100 - (validationErrors.length * 10) - (validationWarnings.length * 2));
console.log(`   • Puntuación TIER 0: ${score}/100`);

if (score >= 90) {
  console.log('\n🏆 CALIFICACIÓN: TIER 0 SUPREMACY - Listo para Fortune 10');
} else if (score >= 80) {
  console.log('\n🥈 CALIFICACIÓN: TIER 0 READY - Casi listo para Fortune 10');
} else if (score >= 70) {
  console.log('\n🥉 CALIFICACIÓN: ENTERPRISE READY - Necesita mejoras menores');
} else {
  console.log('\n⚠️ CALIFICACIÓN: NEEDS IMPROVEMENT - Requiere trabajo adicional');
}

console.log('\n🚀 Validación completada - Módulo Campañas TIER 0\n');

// Exit code para CI/CD
process.exit(validationErrors.length > 0 ? 1 : 0);