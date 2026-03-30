/**
 * VALUE OBJECT: RISK LEVEL - TIER 0 ENTERPRISE
 *
 * @description Niveles de riesgo con thresholds y action triggers.
 * Usado por AccountHealthScore y FlightRiskAssessment.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const RISK_THRESHOLDS = {
  LOW: 75,      // Score >= 75 = Low Risk
  MEDIUM: 50,   // Score >= 50 = Medium Risk
  HIGH: 25,     // Score >= 25 = High Risk
  CRITICAL: 0,  // Score < 25 = Critical Risk
} as const;

export const RISK_CONFIG: Record<RiskLevel, {
  label: string;
  descripcion: string;
  color: string;
  bgColor: string;
  actionRequired: boolean;
  escalationLevel: string;
  responseTimeHours: number;
}> = {
  [RiskLevel.LOW]: {
    label: 'Bajo',
    descripcion: 'Situación estable, monitoreo regular',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    actionRequired: false,
    escalationLevel: 'NONE',
    responseTimeHours: 168, // 7 días
  },
  [RiskLevel.MEDIUM]: {
    label: 'Medio',
    descripcion: 'Requiere atención preventiva',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    actionRequired: false,
    escalationLevel: 'MANAGER',
    responseTimeHours: 72, // 3 días
  },
  [RiskLevel.HIGH]: {
    label: 'Alto',
    descripcion: 'Acción correctiva requerida',
    color: '#ef4444',
    bgColor: '#fef2f2',
    actionRequired: true,
    escalationLevel: 'DIRECTOR',
    responseTimeHours: 24,
  },
  [RiskLevel.CRITICAL]: {
    label: 'Critico',
    descripcion: 'Intervención inmediata necesaria',
    color: '#dc2626',
    bgColor: '#fef2f2',
    actionRequired: true,
    escalationLevel: 'VP',
    responseTimeHours: 4,
  },
};
