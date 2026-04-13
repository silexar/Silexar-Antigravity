/**
 * Configuración del Sistema de Auto-Corrección de Seguridad
 * @file security-autofix.config.ts
 */

import type { AutoFixConfig, CustomRule } from './src/lib/security/auto-fix/types';

/** Configuración personalizada del auto-fixer */
const config: Partial<AutoFixConfig> & { customRules?: CustomRule[] } = {
  // Directorios a escanear
  include: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'api/**/*.ts',
  ],
  
  // Directorios a ignorar
  exclude: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'coverage/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/__tests__/**',
    '**/__mocks__/**',
    'src/lib/security/auto-fix/__tests__/**',
  ],
  
  // Extensiones a procesar
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Auto-fix por severidad
  autoFixHigh: true,    // Corregir automáticamente issues HIGH
  autoFixMedium: false, // Sugerir fix para MEDIUM (no auto)
  autoFixLow: true,     // Corregir automáticamente issues LOW
  
  // Opciones avanzadas
  requireConfirmation: false,  // No requerir confirmación
  createBackup: true,          // Crear backups antes de modificar
  minConfidenceThreshold: 0.75, // Umbral mínimo de confianza (75%)
  enableLearning: true,         // Habilitar sistema de aprendizaje
  
  // Rutas personalizadas
  knowledgeBasePath: '.security/knowledge-base.json',
};

// Reglas personalizadas adicionales (opcional)
export const customRules: CustomRule[] = [
  // Ejemplo de regla personalizada
  // {
  //   id: 'custom-pattern',
  //   name: 'Mi Patrón Personalizado',
  //   pattern: 'somePattern',
  //   severity: 'MEDIUM',
  //   fixTemplate: 'replacement',
  //   enabled: true,
  // },
];

export default config;
