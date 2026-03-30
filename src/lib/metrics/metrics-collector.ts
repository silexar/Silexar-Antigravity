export interface MetricValue { name: string; value: number; unit: string; }
class MetricsCollectorImpl {
    async collect(): Promise<void> { /* Collect */ }
    async getAll(): Promise<MetricValue[]> { return []; }
}
export const MetricsCollector = new MetricsCollectorImpl();
export default MetricsCollector;