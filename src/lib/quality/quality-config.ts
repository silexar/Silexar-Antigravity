export interface QualityConfig { minCoverage: number; maxComplexity: number; }
export const defaultQualityConfig: QualityConfig = { minCoverage: 80, maxComplexity: 15 };
export default defaultQualityConfig;