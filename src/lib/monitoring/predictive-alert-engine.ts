/**
 * Predictive Alert Engine
 * 
 * Uses historical data and patterns to predict future problems
 * and generate proactive alerts.
 * 
 * Line Reference: predictive-alert-engine.ts:1
 */

import { getHealthMetricsCollector, type HealthMetric, type MetricAggregation } from './health-metrics';

export interface Prediction {
    id: string;
    metric: string;
    probability: number; // 0-100
    predictedValue: number;
    predictedAt: Date;
    timeframe: number; // minutes
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    confidence: number; // 0-100
}

export interface AlertPattern {
    metric: string;
    threshold: number;
    direction: 'above' | 'below';
    severity: 'low' | 'medium' | 'high' | 'critical';
    windowMinutes: number;
}

/**
 * PredictiveAlertEngine analyzes metrics and predicts future problems
 */
export class PredictiveAlertEngine {
    private patterns: AlertPattern[] = [
        // Database patterns
        { metric: 'db.connections', threshold: 80, direction: 'above', severity: 'high', windowMinutes: 5 },
        { metric: 'db.latency', threshold: 500, direction: 'above', severity: 'medium', windowMinutes: 5 },

        // Cache patterns
        { metric: 'cache.hit_rate', threshold: 80, direction: 'below', severity: 'medium', windowMinutes: 10 },

        // API patterns
        { metric: 'api.latency', threshold: 1000, direction: 'above', severity: 'high', windowMinutes: 5 },
        { metric: 'api.error_rate', threshold: 5, direction: 'above', severity: 'critical', windowMinutes: 2 },

        // Storage patterns
        { metric: 'storage.usage_percent', threshold: 85, direction: 'above', severity: 'high', windowMinutes: 60 },
        { metric: 'storage.usage_percent', threshold: 90, direction: 'above', severity: 'critical', windowMinutes: 30 },
    ];

    private predictions: Prediction[] = [];
    private readonly maxPredictions = 50;

    constructor() {
        // Run prediction analysis every minute
        this.startPredictionAnalysis();
    }

    /**
     * Analyze metrics and generate predictions
     */
    async analyzeAndPredict(): Promise<Prediction[]> {
        const healthCollector = getHealthMetricsCollector();
        const newPredictions: Prediction[] = [];

        for (const pattern of this.patterns) {
            const aggregation = healthCollector.getMetricAggregation(pattern.metric, '1h');

            if (aggregation.count < 5) continue;

            // Check if current value is trending toward threshold
            const trend = this.calculateTrend(aggregation);
            const currentValue = aggregation.avg;

            // Predict if threshold will be breached
            if (this.willBreachThreshold(currentValue, pattern.threshold, trend, pattern.direction)) {
                const timeToBreach = this.estimateTimeToBreach(currentValue, pattern.threshold, trend);

                if (timeToBreach > 0 && timeToBreach < 120) { // Within 2 hours
                    const prediction = this.createPrediction(
                        pattern,
                        currentValue,
                        trend,
                        timeToBreach,
                        aggregation
                    );
                    newPredictions.push(prediction);
                }
            }
        }

        // Update predictions list
        this.predictions = newPredictions;
        if (this.predictions.length > this.maxPredictions) {
            this.predictions = this.predictions.slice(0, this.maxPredictions);
        }

        return this.predictions;
    }

    /**
     * Get current predictions
     */
    getPredictions(): Prediction[] {
        return this.predictions;
    }

    /**
     * Get predictions by severity
     */
    getPredictionsBySeverity(severity: Prediction['severity']): Prediction[] {
        return this.predictions.filter(p => p.severity === severity);
    }

    /**
     * Add a custom alert pattern
     */
    addPattern(pattern: AlertPattern): void {
        this.patterns.push(pattern);
    }

    /**
     * Remove an alert pattern
     */
    removePattern(metric: string): void {
        this.patterns = this.patterns.filter(p => p.metric !== metric);
    }

    /**
     * Calculate trend from aggregation data
     * Returns rate of change per minute
     */
    private calculateTrend(aggregation: MetricAggregation): number {
        // Simple trend calculation based on difference between recent and older values
        // In production, this would use more sophisticated time series analysis
        const history = aggregation.max - aggregation.min;
        return history / 60; // Change per minute
    }

    /**
     * Determine if threshold will be breached
     */
    private willBreachThreshold(
        currentValue: number,
        threshold: number,
        trend: number,
        direction: 'above' | 'below'
    ): boolean {
        if (direction === 'above') {
            // Check if we're trending upward toward threshold
            return trend > 0 && currentValue < threshold;
        } else {
            // Check if we're trending downward toward threshold
            return trend < 0 && currentValue > threshold;
        }
    }

    /**
     * Estimate time until threshold breach
     */
    private estimateTimeToBreach(
        currentValue: number,
        threshold: number,
        trend: number
    ): number {
        if (Math.abs(trend) < 0.01) return Infinity; // No trend

        const distance = Math.abs(threshold - currentValue);
        return Math.round(distance / Math.abs(trend));
    }

    /**
     * Create a prediction object
     */
    private createPrediction(
        pattern: AlertPattern,
        currentValue: number,
        trend: number,
        timeToBreach: number,
        aggregation: MetricAggregation
    ): Prediction {
        const severity = this.calculatePredictedSeverity(timeToBreach, pattern.severity);
        const probability = this.calculateProbability(timeToBreach, aggregation.p95);
        const recommendation = this.generateRecommendation(pattern, timeToBreach);

        return {
            id: `${pattern.metric}-${Date.now()}`,
            metric: pattern.metric,
            probability,
            predictedValue: pattern.direction === 'above'
                ? currentValue + (trend * timeToBreach)
                : currentValue + (trend * timeToBreach),
            predictedAt: new Date(),
            timeframe: timeToBreach,
            severity,
            recommendation,
            confidence: this.calculateConfidence(aggregation),
        };
    }

    /**
     * Calculate predicted severity based on time to breach
     */
    private calculatePredictedSeverity(
        timeToBreach: number,
        baseSeverity: Prediction['severity']
    ): Prediction['severity'] {
        if (timeToBreach < 15) return 'critical';
        if (timeToBreach < 30) return 'high';
        if (timeToBreach < 60) return 'medium';
        return baseSeverity;
    }

    /**
     * Calculate probability of breach
     */
    private calculateProbability(timeToBreach: number, p95: number): number {
        // Higher probability for shorter timeframes
        if (timeToBreach < 15) return 95;
        if (timeToBreach < 30) return 85;
        if (timeToBreach < 60) return 70;
        if (timeToBreach < 120) return 50;
        return 30;
    }

    /**
     * Generate recommendation based on pattern
     */
    private generateRecommendation(pattern: AlertPattern, timeToBreach: number): string {
        const recommendations: Record<string, string> = {
            'db.connections': 'Escalar pool de conexiones o investigar queries lentas',
            'db.latency': 'Revisar índices y optimizar queries',
            'cache.hit_rate': 'Aumentar memoria Redis o limpiar cache antiguo',
            'api.latency': 'Escalar instancias o revisar servicios lentos',
            'api.error_rate': 'Revisar logs de errores y desplegar fixes',
            'storage.usage_percent': 'Programar limpieza de archivos o expandir storage',
        };

        const base = recommendations[pattern.metric] || 'Revisar métricas del sistema';

        if (timeToBreach < 30) {
            return `🚨 URGENTE: ${base}`;
        }

        return base;
    }

    /**
     * Calculate confidence in prediction
     */
    private calculateConfidence(aggregation: MetricAggregation): number {
        // More data points = higher confidence
        let confidence = Math.min(90, aggregation.count * 5);

        // Consistency in data increases confidence
        if (aggregation.p99 - aggregation.min < aggregation.avg) {
            confidence += 10;
        }

        return Math.min(100, confidence);
    }

    /**
     * Start periodic prediction analysis
     */
    private startPredictionAnalysis(): void {
        setInterval(() => {
            this.analyzeAndPredict();
        }, 60000); // Every minute
    }
}

// Singleton instance
let predictiveAlertEngine: PredictiveAlertEngine | null = null;

export function getPredictiveAlertEngine(): PredictiveAlertEngine {
    if (!predictiveAlertEngine) {
        predictiveAlertEngine = new PredictiveAlertEngine();
    }
    return predictiveAlertEngine;
}
