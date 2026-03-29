/**
 * SILEXAR PULSE - TIER0+ QUALITY METRICS COLLECTOR
 * Colector de Métricas de Calidad
 */

export interface QualityMetric {
    readonly name: string;
    readonly value: number;
    readonly threshold: number;
    readonly timestamp: Date;
}

export interface QualityReport {
    readonly score: number;
    readonly metrics: QualityMetric[];
    readonly recommendations: string[];
}

class QualityMetricsCollectorImpl {
    private metrics: QualityMetric[] = [];

    collect(name: string, value: number, threshold: number): void {
        this.metrics.push({
            name,
            value,
            threshold,
            timestamp: new Date(),
        });
    }

    async getMetrics(): Promise<QualityMetric[]> {
        return this.metrics;
    }

    async generateReport(): Promise<QualityReport> {
        const passing = this.metrics.filter(m => m.value >= m.threshold).length;
        const score = this.metrics.length > 0 ? (passing / this.metrics.length) * 100 : 100;
        
        return {
            score,
            metrics: this.metrics,
            recommendations: score < 80 ? ['Mejorar cobertura de tests'] : [],
        };
    }

    clear(): void {
        this.metrics = [];
    }
}

export const QualityMetricsCollector = new QualityMetricsCollectorImpl();
export default QualityMetricsCollector;