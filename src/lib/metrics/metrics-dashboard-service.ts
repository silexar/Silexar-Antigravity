export interface MetricsDashboardConfig { refreshInterval: number; metrics: string[]; }
class MetricsDashboardServiceImpl {
    async getMetrics(): Promise<Record<string, number>> { return {}; }
}
export const MetricsDashboardService = new MetricsDashboardServiceImpl();
export default MetricsDashboardService;