'use server';

import { QuantumAnomalyDetector } from '@/lib/ai/quantum-anomaly-detector';

export async function getAnomalyData() {
  const detector = QuantumAnomalyDetector.getInstance();

  const [
    latestDetection,
    allAnomalies,
    patternAnalysis,
    allAlerts,
    allRecommendations,
    healthScore,
    stats
  ] = await Promise.all([
    detector.getLatestDetection() || detector.forceDetection(),
    detector.getAllAnomalies(),
    detector.getPatternAnalysis(),
    detector.getAllAlerts(),
    detector.getRecommendations(),
    detector.getCurrentSystemHealth(),
    detector.getAnomalyStatistics()
  ]);

  return {
    latestDetection,
    allAnomalies,
    patternAnalysis,
    allAlerts,
    allRecommendations,
    healthScore,
    stats
  };
}
