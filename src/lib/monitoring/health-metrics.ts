/**
 * Health Metrics Collector
 * 
 * Collects and stores health metrics from various system components.
 * Used for monitoring and predictive analysis.
 * 
 * Line Reference: health-metrics.ts:1
 */

export interface HealthMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    tags?: Record<string, string>;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number; // 0-100
    timestamp: Date;
    components: {
        database: ComponentHealth;
        cache: ComponentHealth;
        storage: ComponentHealth;
        api: ComponentHealth;
        external: ComponentHealth;
    };
}

export interface ComponentHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    errorRate?: number;
    uptime?: number;
    metadata?: Record<string, unknown>;
}

export interface MetricAggregation {
    period: '1h' | '24h' | '7d' | '30d';
    metric: string;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    count: number;
}

/**
 * HealthMetricsCollector collects health metrics from the system
 */
export class HealthMetricsCollector {
    private metrics: HealthMetric[] = [];
    private readonly maxMetricsInMemory = 1000;

    constructor() {
        // Start periodic collection
        this.startPeriodicCollection();
    }

    /**
     * Record a health metric
     */
    recordMetric(metric: Omit<HealthMetric, 'timestamp'>): void {
        this.metrics.push({
            ...metric,
            timestamp: new Date(),
        });

        // Trim old metrics if we have too many
        if (this.metrics.length > this.maxMetricsInMemory) {
            this.metrics = this.metrics.slice(-this.maxMetricsInMemory);
        }
    }

    /**
     * Get current system health
     */
    async getSystemHealth(): Promise<SystemHealth> {
        const now = new Date();
        const recentMetrics = this.metrics.filter(
            m => now.getTime() - m.timestamp.getTime() < 60000 // Last minute
        );

        // Calculate database health
        const dbMetrics = recentMetrics.filter(m => m.name.startsWith('db.'));
        const dbHealth = this.calculateComponentHealth(dbMetrics);

        // Calculate cache health
        const cacheMetrics = recentMetrics.filter(m => m.name.startsWith('cache.'));
        const cacheHealth = this.calculateComponentHealth(cacheMetrics);

        // Calculate storage health
        const storageMetrics = recentMetrics.filter(m => m.name.startsWith('storage.'));
        const storageHealth = this.calculateComponentHealth(storageMetrics);

        // Calculate API health
        const apiMetrics = recentMetrics.filter(m => m.name.startsWith('api.'));
        const apiHealth = this.calculateComponentHealth(apiMetrics);

        // Calculate external services health
        const extMetrics = recentMetrics.filter(m => m.name.startsWith('external.'));
        const extHealth = this.calculateComponentHealth(extMetrics);

        // Calculate overall score
        const components = { database: dbHealth, cache: cacheHealth, storage: storageHealth, api: apiHealth, external: extHealth };
        const score = this.calculateOverallScore(components);

        return {
            status: this.getHealthStatus(score),
            score,
            timestamp: now,
            components,
        };
    }

    /**
     * Get metrics aggregation for a specific metric
     */
    getMetricAggregation(metricName: string, period: '1h' | '24h' | '7d' | '30d'): MetricAggregation {
        const now = new Date();
        const periodMs = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };

        const filteredMetrics = this.metrics.filter(m => {
            const age = now.getTime() - m.timestamp.getTime();
            return m.name === metricName && age < periodMs[period];
        });

        if (filteredMetrics.length === 0) {
            return {
                period,
                metric: metricName,
                avg: 0,
                min: 0,
                max: 0,
                p95: 0,
                p99: 0,
                count: 0,
            };
        }

        const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            period,
            metric: metricName,
            avg: sum / values.length,
            min: values[0],
            max: values[values.length - 1],
            p95: this.percentile(values, 95),
            p99: this.percentile(values, 99),
            count: values.length,
        };
    }

    /**
     * Get metrics history
     */
    getMetricsHistory(metricName?: string, limit: number = 100): HealthMetric[] {
        let filtered = this.metrics;

        if (metricName) {
            filtered = filtered.filter(m => m.name === metricName);
        }

        return filtered
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    /**
     * Start periodic metric collection
     */
    private startPeriodicCollection(): void {
        // Collect metrics every 30 seconds
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000);
    }

    /**
     * Collect system metrics
     */
    private async collectSystemMetrics(): Promise<void> {
        // Database metrics
        this.recordMetric({
            name: 'db.connections',
            value: Math.random() * 50, // Placeholder
            unit: 'count',
            tags: { type: 'database' },
        });

        this.recordMetric({
            name: 'db.latency',
            value: Math.random() * 100, // Placeholder
            unit: 'ms',
            tags: { type: 'database' },
        });

        // Cache metrics
        this.recordMetric({
            name: 'cache.hit_rate',
            value: 90 + Math.random() * 10,
            unit: 'percent',
            tags: { type: 'cache' },
        });

        // API metrics
        this.recordMetric({
            name: 'api.latency',
            value: Math.random() * 200,
            unit: 'ms',
            tags: { type: 'api' },
        });

        this.recordMetric({
            name: 'api.error_rate',
            value: Math.random() * 5,
            unit: 'percent',
            tags: { type: 'api' },
        });
    }

    /**
     * Calculate component health from metrics
     */
    private calculateComponentHealth(metrics: HealthMetric[]): ComponentHealth {
        if (metrics.length === 0) {
            return { status: 'healthy' };
        }

        const latencyMetrics = metrics.filter(m => m.name.includes('latency'));
        const errorMetrics = metrics.filter(m => m.name.includes('error'));

        const avgLatency = latencyMetrics.length > 0
            ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
            : 0;

        const avgErrorRate = errorMetrics.length > 0
            ? errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length
            : 0;

        // Determine status based on latency and error rate
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        if (avgErrorRate > 10 || avgLatency > 1000) {
            status = 'unhealthy';
        } else if (avgErrorRate > 5 || avgLatency > 500) {
            status = 'degraded';
        }

        return {
            status,
            latency: avgLatency,
            errorRate: avgErrorRate,
        };
    }

    /**
     * Calculate overall health score
     */
    private calculateOverallScore(components: SystemHealth['components']): number {
        const weights = {
            database: 0.3,
            cache: 0.15,
            storage: 0.15,
            api: 0.25,
            external: 0.15,
        };

        let score = 100;

        // Deduct points based on status
        for (const [component, health] of Object.entries(components)) {
            const weight = weights[component as keyof typeof weights];
            if (health.status === 'unhealthy') {
                score -= 40 * weight;
            } else if (health.status === 'degraded') {
                score -= 20 * weight;
            }
            if (health.errorRate && health.errorRate > 0) {
                score -= health.errorRate * weight;
            }
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get health status from score
     */
    private getHealthStatus(score: number): 'healthy' | 'degraded' | 'unhealthy' {
        if (score >= 80) return 'healthy';
        if (score >= 50) return 'degraded';
        return 'unhealthy';
    }

    /**
     * Calculate percentile
     */
    private percentile(sortedValues: number[], p: number): number {
        const index = Math.ceil((p / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, index)];
    }
}

// Singleton instance
let healthMetricsCollector: HealthMetricsCollector | null = null;

export function getHealthMetricsCollector(): HealthMetricsCollector {
    if (!healthMetricsCollector) {
        healthMetricsCollector = new HealthMetricsCollector();
    }
    return healthMetricsCollector;
}
