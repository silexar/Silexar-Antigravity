/**
 * SILEXAR PULSE - TIER0+ QUALITY INDEX
 * Barrel Export para Módulo de Calidad
 */

export { TestResultAnalyzer, type TestResult, type TestAnalysis } from '../continuous-improvement/staging/test-result-analyzer';

export interface QualityMetric {
    readonly name: string;
    readonly value: number;
    readonly threshold: number;
    readonly passed: boolean;
}

export const createQualityMetric = (name: string, value: number, threshold: number): QualityMetric => ({
    name,
    value,
    threshold,
    passed: value >= threshold,
});

export default {
    createQualityMetric,
};