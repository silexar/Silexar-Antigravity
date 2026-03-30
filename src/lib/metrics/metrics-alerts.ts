export interface MetricAlert { id: string; threshold: number; triggered: boolean; }
class MetricsAlertsImpl { async check(): Promise<MetricAlert[]> { return []; } async configure(): Promise<boolean> { return true; } }
export const MetricsAlerts = new MetricsAlertsImpl();
export default MetricsAlerts;