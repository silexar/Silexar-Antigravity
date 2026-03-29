/**
 * SILEXAR PULSE - TIER0+ METRICS INDEX
 * Barrel export para módulo de métricas
 */

export interface Metric {
    readonly name: string;
    readonly value: number;
    readonly unit: string;
    readonly timestamp: Date;
}

export interface MetricAggregation {
    readonly min: number;
    readonly max: number;
    readonly avg: number;
    readonly count: number;
}

class MetricsServiceImpl {
    private metrics: Metric[] = [];

    record(name: string, value: number, unit = ''): void {
        this.metrics.push({ name, value, unit, timestamp: new Date() });
    }

    async get(name: string): Promise<Metric[]> {
        return this.metrics.filter(m => m.name === name);
    }

    async aggregate(name: string): Promise<MetricAggregation> {
        const values = this.metrics.filter(m => m.name === name).map(m => m.value);
        if (values.length === 0) {
            return { min: 0, max: 0, avg: 0, count: 0 };
        }
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            count: values.length,
        };
    }

    clear(): void {
        this.metrics = [];
    }
}

export const MetricsService = new MetricsServiceImpl();
export default MetricsService;