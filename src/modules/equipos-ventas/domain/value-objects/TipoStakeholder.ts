/**
 * VALUE OBJECT: TIPO STAKEHOLDER - TIER 0 ENTERPRISE
 *
 * @description Clasificación de stakeholders en un buying committee.
 * Define weight e engagement strategy por tipo.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export enum TipoStakeholder {
  CHAMPION = 'CHAMPION',
  INFLUENCER = 'INFLUENCER',
  DECISION_MAKER = 'DECISION_MAKER',
  BLOCKER = 'BLOCKER',
  END_USER = 'END_USER',
  ECONOMIC_BUYER = 'ECONOMIC_BUYER',
}

export const STAKEHOLDER_CONFIG: Record<TipoStakeholder, {
  label: string;
  descripcion: string;
  weight: number; // Importancia en buying decision (1-10)
  engagementStrategy: string;
  colorIndicador: string;
  icono: string;
}> = {
  [TipoStakeholder.CHAMPION]: {
    label: 'Champion',
    descripcion: 'Promotor interno activo de nuestra solución',
    weight: 10,
    engagementStrategy: 'Mantener relación estrecha, involucrar en roadmap, dar acceso exclusivo',
    colorIndicador: '#22c55e',
    icono: 'crown',
  },
  [TipoStakeholder.DECISION_MAKER]: {
    label: 'Decision Maker',
    descripcion: 'Tiene autoridad final de compra',
    weight: 9,
    engagementStrategy: 'Reuniones ejecutivas, ROI presentations, executive briefings',
    colorIndicador: '#3b82f6',
    icono: 'gavel',
  },
  [TipoStakeholder.ECONOMIC_BUYER]: {
    label: 'Economic Buyer',
    descripcion: 'Controla el presupuesto y aprueba la inversión',
    weight: 8,
    engagementStrategy: 'Business cases, TCO analysis, financial impact discussions',
    colorIndicador: '#f59e0b',
    icono: 'dollar-sign',
  },
  [TipoStakeholder.INFLUENCER]: {
    label: 'Influencer',
    descripcion: 'Influye en la decisión sin autoridad directa',
    weight: 6,
    engagementStrategy: 'Technical deep dives, product demos, industry insights',
    colorIndicador: '#8b5cf6',
    icono: 'users',
  },
  [TipoStakeholder.END_USER]: {
    label: 'End User',
    descripcion: 'Usuario final de la solución',
    weight: 4,
    engagementStrategy: 'Training sessions, user feedback, support engagement',
    colorIndicador: '#64748b',
    icono: 'user',
  },
  [TipoStakeholder.BLOCKER]: {
    label: 'Blocker',
    descripcion: 'Opuesto o resistente a nuestra solución',
    weight: 7,
    engagementStrategy: 'Identificar objeciones, address concerns, encontrar aliados internos',
    colorIndicador: '#ef4444',
    icono: 'shield-x',
  },
};
