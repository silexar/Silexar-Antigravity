#!/usr/bin/env node
/**
 * CLI para el sistema de auto-corrección de seguridad
 * @module SecurityAutoFix/CLI
 * 
 * Comandos disponibles:
 * - scan: Escanear archivos
 * - fix: Aplicar correcciones automáticas
 * - check: Verificar sin aplicar cambios
 * - report: Generar reporte
 * - learn: Gestión del sistema de aprendizaje
 * - backup: Gestión de backups
 */

import { resolve } from 'path';
import { 
  SecurityAutoFixer, 
  getSecurityAutoFixer,
  getSystemInfo,
} from '../../src/lib/security/auto-fix/index';
import type { SeverityLevel, ReportOptions } from '../../src/lib/security/auto-fix/index';

const args = process.argv.slice(2);
const command = args[0];

/** Muestra ayuda */
function showHelp(): void {
  console.log(`
🔒 Silexar Pulse Security Auto-Fixer CLI

USO:
  npx tsx scripts/security-autofix/cli.ts <comando> [opciones]

COMANDOS:
  scan          Escanear archivos en busca de issues
  fix           Aplicar correcciones automáticas
  check         Verificar issues sin aplicar cambios (CI/CD)
  report        Generar reporte detallado
  learn         Gestión del sistema de aprendizaje
  backup        Gestión de backups
  info          Mostrar información del sistema

OPCIONES GLOBALES:
  --config, -c <path>      Ruta a archivo de configuración
  --severity, -s <level>   Filtrar por severidad: HIGH, MEDIUM, LOW
  --format, -f <format>    Formato de reporte: json, markdown, html, console
  --output, -o <path>      Ruta de salida para reportes
  --dry-run                Simular sin aplicar cambios
  --verbose, -v            Mostrar información detallada
  --help, -h               Mostrar esta ayuda

EJEMPLOS:
  # Escanear todo el proyecto
  npx tsx scripts/security-autofix/cli.ts scan

  # Aplicar fixes solo para HIGH y LOW
  npx tsx scripts/security-autofix/cli.ts fix --severity HIGH,LOW

  # Verificar en CI/CD (falla si hay issues HIGH)
  npx tsx scripts/security-autofix/cli.ts check

  # Generar reporte HTML
  npx tsx scripts/security-autofix/cli.ts report --format html --output report.html

  # Ver estadísticas de aprendizaje
  npx tsx scripts/security-autofix/cli.ts learn stats
`);
}

/** Parsea argumentos */
function parseArgs(): Record<string, string | boolean> {
  const options: Record<string, string | boolean> = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const keyMap: Record<string, string> = {
        '-c': 'config',
        '-s': 'severity',
        '-f': 'format',
        '-o': 'output',
        '-v': 'verbose',
        '-h': 'help',
      };
      const key = keyMap[arg];
      const nextArg = args[i + 1];
      if (key && nextArg && !nextArg.startsWith('-')) {
        options[key] = nextArg;
        i++;
      }
    }
  }
  
  return options;
}

/** Carga configuración */
async function loadConfig(configPath?: string): Promise<Partial<import('../../src/lib/security/auto-fix/index').AutoFixConfig>> {
  if (configPath) {
    try {
      const config = await import(resolve(configPath));
      return config.default || config;
    } catch (error) {
      console.warn(`⚠️  No se pudo cargar configuración desde ${configPath}`);
    }
  }
  return {};
}

/** Comando: scan */
async function scanCommand(options: ReturnType<typeof parseArgs>): Promise<void> {
  console.log('🔍 Iniciando escaneo...\n');
  
  const config = await loadConfig(options.config as string);
  const fixer = new SecurityAutoFixer(config);
  
  const scanResults = await fixer.scan();
  
  let totalIssues = 0;
  for (const result of scanResults) {
    if (result.issues.length > 0) {
      console.log(`📁 ${result.filePath}`);
      for (const issue of result.issues) {
        const icon = issue.severity === 'HIGH' ? '🔴' : 
                     issue.severity === 'MEDIUM' ? '🟡' : '🔵';
        console.log(`   ${icon} [${issue.severity}] ${issue.type} (L${issue.line})`);
        console.log(`      ${issue.message}`);
        totalIssues++;
      }
      console.log('');
    }
  }
  
  console.log(`\n📊 Total: ${totalIssues} issues en ${scanResults.length} archivos`);
  process.exit(totalIssues > 0 ? 1 : 0);
}

/** Comando: fix */
async function fixCommand(options: ReturnType<typeof parseArgs>): Promise<void> {
  console.log('🔧 Iniciando auto-fix...\n');
  
  const config = await loadConfig(options.config as string);
  const fixer = new SecurityAutoFixer(config);
  
  const severityFilter = options.severity 
    ? (options.severity as string).split(',').map(s => s.trim().toUpperCase() as SeverityLevel)
    : undefined;
  
  const result = await fixer.run({
    dryRun: options.dryRun as boolean,
    severity: severityFilter,
    reportFormat: (options.format as ReportOptions['format']) || 'console',
    reportPath: options.output as string,
  });
  
  if (options.verbose) {
    console.log('\n' + result.report);
  } else {
    console.log(`\n✅ ${result.issuesFixed} issues corregidos`);
    console.log(`❌ ${result.issuesFailed} fallos`);
    console.log(`📁 ${result.filesModified.length} archivos modificados`);
    console.log(`⏱️  ${(result.durationMs / 1000).toFixed(2)}s`);
  }
  
  process.exit(result.issuesFailed > 0 ? 1 : 0);
}

/** Comando: check */
async function checkCommand(options: ReturnType<typeof parseArgs>): Promise<void> {
  console.log('🔍 Verificando código...\n');
  
  const config = await loadConfig(options.config as string);
  const fixer = new SecurityAutoFixer(config);
  
  const { hasIssues, issues, summary } = await fixer.check();
  
  if (hasIssues) {
    console.log('❌ Se encontraron issues de seguridad:\n');
    
    const highIssues = issues.filter(i => i.severity === 'HIGH');
    const mediumIssues = issues.filter(i => i.severity === 'MEDIUM');
    const lowIssues = issues.filter(i => i.severity === 'LOW');
    
    if (highIssues.length > 0) {
      console.log(`🔴 HIGH (${highIssues.length}):`);
      highIssues.forEach(i => console.log(`   - ${i.filePath}:${i.line} - ${i.type}`));
      console.log('');
    }
    
    if (mediumIssues.length > 0) {
      console.log(`🟡 MEDIUM (${mediumIssues.length}):`);
      mediumIssues.forEach(i => console.log(`   - ${i.filePath}:${i.line} - ${i.type}`));
      console.log('');
    }
    
    if (lowIssues.length > 0) {
      console.log(`🔵 LOW (${lowIssues.length}):`);
      lowIssues.forEach(i => console.log(`   - ${i.filePath}:${i.line} - ${i.type}`));
      console.log('');
    }
    
    console.log(`\n${summary}`);
    console.log('\n💡 Ejecuta "npm run security:autofix" para corregir automáticamente');
    process.exit(1);
  } else {
    console.log('✅ No se encontraron issues de seguridad');
    process.exit(0);
  }
}

/** Comando: report */
async function reportCommand(options: ReturnType<typeof parseArgs>): Promise<void> {
  console.log('📊 Generando reporte...\n');
  
  const config = await loadConfig(options.config as string);
  const fixer = new SecurityAutoFixer(config);
  
  const format = (options.format as ReportOptions['format']) || 'markdown';
  const outputPath = options.output as string || `security-report.${format === 'html' ? 'html' : format === 'json' ? 'json' : 'md'}`;
  
  const result = await fixer.run({
    dryRun: true,
    reportFormat: format,
    reportPath: outputPath,
  });
  
  console.log(`✅ Reporte guardado en: ${outputPath}`);
  console.log(`📊 Issues encontrados: ${result.issuesFixed + result.issuesFailed}`);
}

/** Comando: learn */
async function learnCommand(options: ReturnType<typeof parseArgs>): Promise<void> {
  const subcommand = args[1] || 'stats';
  
  const config = await loadConfig(options.config as string);
  const fixer = new SecurityAutoFixer({ ...config, enableLearning: true });
  await fixer.initialize();
  
  switch (subcommand) {
    case 'stats': {
      const stats = await fixer.getLearningStats();
      if (stats) {
        console.log('📚 Estadísticas de Aprendizaje:\n');
        console.log(`   Patrones aprendidos: ${stats.totalPatterns}`);
        console.log(`   Correcciones totales: ${stats.totalCorrections}`);
        console.log(`   Confianza promedio: ${(stats.averageConfidence * 100).toFixed(1)}%`);
      } else {
        console.log('⚠️  Sistema de aprendizaje deshabilitado');
      }
      break;
    }
    
    case 'export': {
      const outputPath = (options.output as string) || '.security/knowledge-base-export.json';
      await fixer.exportKnowledgeBase(outputPath);
      console.log(`✅ Base de conocimiento exportada a: ${outputPath}`);
      break;
    }
    
    case 'import': {
      const inputPath = options.input as string || options.config as string;
      if (!inputPath) {
        console.error('❌ Debes especificar --input <path>');
        process.exit(1);
      }
      await fixer.importKnowledgeBase(inputPath);
      console.log(`✅ Base de conocimiento importada desde: ${inputPath}`);
      break;
    }
    
    default:
      console.log('Comandos disponibles: stats, export, import');
  }
}

/** Comando: backup */
async function backupCommand(options: ReturnType<typeof parseArgs>): Promise<void> {
  const subcommand = args[1] || 'clean';
  
  const config = await loadConfig(options.config as string);
  const fixer = new SecurityAutoFixer(config);
  
  switch (subcommand) {
    case 'clean': {
      const maxAge = parseInt(options.maxAge as string) || 24;
      const cleaned = await fixer.cleanupBackups(maxAge);
      console.log(`🗑️  ${cleaned} backups eliminados (más de ${maxAge}h)`);
      break;
    }
    
    case 'restore': {
      const filePath = options.file as string;
      if (!filePath) {
        console.error('❌ Debes especificar --file <path>');
        process.exit(1);
      }
      const restored = await fixer.restoreFromBackup(filePath);
      if (restored) {
        console.log(`✅ ${filePath} restaurado desde backup`);
      } else {
        console.log('❌ No se encontró backup');
      }
      break;
    }
    
    default:
      console.log('Comandos disponibles: clean, restore');
  }
}

/** Comando: info */
async function infoCommand(): Promise<void> {
  const info = getSystemInfo();
  
  console.log(`
🔒 ${info.description}

Versión: ${info.version}
Autor: ${info.author}

Características:
${info.features.map(f => `  • ${f}`).join('\n')}

Niveles de Severidad:
${info.severityLevels.map(s => `  • ${s}`).join('\n')}

Tipos de Issues Soportados:
${info.supportedIssueTypes.map(t => `  • ${t}`).join('\n')}
`);
}

/** Ejecuta comando principal */
async function main(): Promise<void> {
  const options = parseArgs();
  
  if (options.help || !command) {
    showHelp();
    process.exit(0);
  }
  
  try {
    switch (command) {
      case 'scan':
        await scanCommand(options);
        break;
      case 'fix':
        await fixCommand(options);
        break;
      case 'check':
        await checkCommand(options);
        break;
      case 'report':
        await reportCommand(options);
        break;
      case 'learn':
        await learnCommand(options);
        break;
      case 'backup':
        await backupCommand(options);
        break;
      case 'info':
        await infoCommand();
        break;
      default:
        console.error(`❌ Comando desconocido: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
