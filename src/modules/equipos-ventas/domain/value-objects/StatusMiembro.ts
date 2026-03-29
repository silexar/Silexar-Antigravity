/**
 * VALUE OBJECT STATUS MIEMBRO - TIER 0 ENTERPRISE
 * 
 * @description Define el estado actual de un miembro del equipo de ventas
 * para efectos de asignación, compensación y acceso.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export enum StatusMiembro {
  ACTIVO = 'ACTIVO',
  ONBOARDING = 'ONBOARDING', // En proceso de ramp-up
  PROBATION = 'PROBATION', // Periodo de prueba
  PIP = 'PIP', // Performance Improvement Plan (Riesgo)
  LICENCIA = 'LICENCIA', // Vacaciones, médica, etc.
  SUSPENDIDO = 'SUSPENDIDO',
  ALUMNI = 'ALUMNI' // Ex-empleado (histórico)
}

export const StatusMiembroLabels: Record<StatusMiembro, string> = {
  [StatusMiembro.ACTIVO]: 'Activo',
  [StatusMiembro.ONBOARDING]: 'En Onboarding',
  [StatusMiembro.PROBATION]: 'Periodo de Prueba',
  [StatusMiembro.PIP]: 'Plan de Mejora (PIP)',
  [StatusMiembro.LICENCIA]: 'De Licencia',
  [StatusMiembro.SUSPENDIDO]: 'Suspendido',
  [StatusMiembro.ALUMNI]: 'Ex-Miembro'
};
