export interface AlertRule {
    id: string;
    metric: string;
    threshold: number;
    action: string;
}

export interface Alert {
    id: string;
    rule: AlertRule;
    value: number;
    triggeredAt: string;
}

class PredictiveAlertingImpl {
    async createRule(metric: string, threshold: number, action: string): Promise<AlertRule> {
        return { id: `rule_${Date.now()}`, metric, threshold, action };
    }

    async evaluate(rule: AlertRule, currentValue: number): Promise<Alert | null> {
        if (currentValue > rule.threshold) {
            return { id: `alert_${Date.now()}`, rule, value: currentValue, triggeredAt: new Date().toISOString() };
        }
        return null;
    }

    async getActiveAlerts(metricFilter?: string): Promise<Alert[]> {
        return metricFilter ? [] : [];
    }
}

export const PredictiveAlerting = new PredictiveAlertingImpl();
export default PredictiveAlerting;