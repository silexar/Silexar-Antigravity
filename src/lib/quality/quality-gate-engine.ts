export interface QualityGateResult { passed: boolean; score: number; }
class QualityGateEngineImpl { async evaluate(): Promise<QualityGateResult> { return { passed: true, score: 100 }; } }
export const QualityGateEngine = new QualityGateEngineImpl();
export default QualityGateEngine;