/**
 * VALUE OBJECT DEAL SCORE CATEGORY - TIER 0 ENTERPRISE
 * 
 * @description Categorización automática de oportunidades basada en ML Score.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export enum DealScoreCategory {
  HOT = 'HOT', // 80-100: Cierre inminente
  WARM = 'WARM', // 60-79: En proceso activo
  NEUTRAL = 'NEUTRAL', // 40-59: Necesita atención
  COLD = 'COLD', // 0-39: Riesgo alto / Stalled
  LOST_CAUSE = 'LOST_CAUSE' // <10: Irrecuperable
}

export const DealScoreThresholds: Record<DealScoreCategory, { min: number; max: number; label: string }> = {
  [DealScoreCategory.HOT]: { min: 80, max: 100, label: '🔥 Hot' },
  [DealScoreCategory.WARM]: { min: 60, max: 79, label: '🟢 Warm' },
  [DealScoreCategory.NEUTRAL]: { min: 40, max: 59, label: '🟡 Neutral' },
  [DealScoreCategory.COLD]: { min: 10, max: 39, label: '🔴 Cold' },
  [DealScoreCategory.LOST_CAUSE]: { min: 0, max: 9, label: '🧊 Lost Cause' }
};

export function getCategoryFromScore(score: number): DealScoreCategory {
  if (score >= 80) return DealScoreCategory.HOT;
  if (score >= 60) return DealScoreCategory.WARM;
  if (score >= 40) return DealScoreCategory.NEUTRAL;
  if (score >= 10) return DealScoreCategory.COLD;
  return DealScoreCategory.LOST_CAUSE;
}
