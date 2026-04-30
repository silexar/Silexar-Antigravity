/**
 * Alert Manager
 * 
 * Manages alerts, notifications, and escalation.
 * Supports multiple channels: email, SMS, push, webhook.
 * 
 * Line Reference: alert-manager.ts:1
 */

import { getPredictiveAlertEngine, type Prediction } from './predictive-alert-engine';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertType = 'predictive' | 'critical' | 'warning' | 'info';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'webhook';

export interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    source: string;
    prediction?: Prediction;
    actionTaken?: string;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    createdAt: Date;
    metadata?: Record<string, unknown>;
}

export interface NotificationRecipient {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: string;
    channels: NotificationChannel[];
    severityLevels: AlertSeverity[];
}

export interface NotificationChannelConfig {
    email?: {
        enabled: boolean;
        smtpConfig?: Record<string, unknown>;
    };
    sms?: {
        enabled: boolean;
        provider?: string;
    };
    push?: {
        enabled: boolean;
        fcmConfig?: Record<string, unknown>;
    };
    webhook?: {
        enabled: boolean;
        url?: string;
        secret?: string;
    };
}

/**
 * AlertManager handles alert creation, notification, and lifecycle
 */
export class AlertManager {
    private alerts: Alert[] = [];
    private recipients: NotificationRecipient[] = [];
    private channelConfig: NotificationChannelConfig = {
        email: { enabled: true },
        sms: { enabled: false },
        push: { enabled: true },
        webhook: { enabled: false, url: '' },
    };
    private readonly maxAlerts = 500;

    constructor() {
        // Start alert processing
        this.startAlertProcessing();
    }

    /**
     * Create a new alert
     */
    async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
        const newAlert: Alert = {
            ...alert,
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        };

        this.alerts.unshift(newAlert);

        // Trim old alerts
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.maxAlerts);
        }

        // Send notifications for high severity alerts
        if (['critical', 'high'].includes(alert.severity)) {
            await this.sendNotifications(newAlert);
        }

        return newAlert;
    }

    /**
     * Get all alerts
     */
    getAlerts(options?: {
        severity?: AlertSeverity;
        type?: AlertType;
        acknowledged?: boolean;
        limit?: number;
    }): Alert[] {
        let filtered = [...this.alerts];

        if (options?.severity) {
            filtered = filtered.filter(a => a.severity === options.severity);
        }
        if (options?.type) {
            filtered = filtered.filter(a => a.type === options.type);
        }
        if (options?.acknowledged !== undefined) {
            filtered = filtered.filter(a =>
                options.acknowledged ? a.acknowledgedBy : !a.acknowledgedBy
            );
        }

        return filtered.slice(0, options?.limit || 100);
    }

    /**
     * Get alert by ID
     */
    getAlertById(id: string): Alert | null {
        return this.alerts.find(a => a.id === id) || null;
    }

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();

        return true;
    }

    /**
     * Resolve an alert
     */
    async resolveAlert(alertId: string, actionTaken?: string): Promise<boolean> {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.resolvedAt = new Date();
        if (actionTaken) {
            alert.actionTaken = actionTaken;
        }

        return true;
    }

    /**
     * Add a notification recipient
     */
    addRecipient(recipient: NotificationRecipient): void {
        this.recipients.push(recipient);
    }

    /**
     * Remove a notification recipient
     */
    removeRecipient(recipientId: string): void {
        this.recipients = this.recipients.filter(r => r.id !== recipientId);
    }

    /**
     * Update channel configuration
     */
    updateChannelConfig(config: Partial<NotificationChannelConfig>): void {
        this.channelConfig = { ...this.channelConfig, ...config };
    }

    /**
     * Get alert statistics
     */
    getAlertStats(): {
        total: number;
        bySeverity: Record<AlertSeverity, number>;
        byType: Record<AlertType, number>;
        unacknowledged: number;
        resolved: number;
    } {
        const stats = {
            total: this.alerts.length,
            bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<AlertSeverity, number>,
            byType: { predictive: 0, critical: 0, warning: 0, info: 0 } as Record<AlertType, number>,
            unacknowledged: 0,
            resolved: 0,
        };

        for (const alert of this.alerts) {
            stats.bySeverity[alert.severity]++;
            stats.byType[alert.type]++;
            if (!alert.acknowledgedBy) stats.unacknowledged++;
            if (alert.resolvedAt) stats.resolved++;
        }

        return stats;
    }

    /**
     * Send notifications for an alert
     */
    private async sendNotifications(alert: Alert): Promise<void> {
        const eligibleRecipients = this.recipients.filter(r =>
            r.severityLevels.includes(alert.severity)
        );

        for (const recipient of eligibleRecipients) {
            for (const channel of recipient.channels) {
                try {
                    await this.sendViaChannel(channel, alert, recipient);
                } catch (error) {
                    console.error(`Failed to send alert via ${channel}:`, error);
                }
            }
        }
    }

    /**
     * Send alert via specific channel
     */
    private async sendViaChannel(
        channel: NotificationChannel,
        alert: Alert,
        recipient: NotificationRecipient
    ): Promise<void> {
        switch (channel) {
            case 'email':
                if (this.channelConfig.email?.enabled && recipient.email) {
                    await this.sendEmail(alert, recipient);
                }
                break;

            case 'sms':
                if (this.channelConfig.sms?.enabled && recipient.phone) {
                    await this.sendSMS(alert, recipient);
                }
                break;

            case 'push':
                if (this.channelConfig.push?.enabled) {
                    await this.sendPush(alert, recipient);
                }
                break;

            case 'webhook':
                if (this.channelConfig.webhook?.enabled && this.channelConfig.webhook.url) {
                    await this.sendWebhook(alert);
                }
                break;
        }
    }

    /**
     * Send email notification
     */
    private async sendEmail(alert: Alert, recipient: NotificationRecipient): Promise<void> {
        // In production, this would use the email provider
        console.log(`[EMAIL] To: ${recipient.email}`);
        console.log(`[EMAIL] Subject: [${alert.severity.toUpperCase()}] ${alert.title}`);
        console.log(`[EMAIL] Body: ${alert.message}`);
    }

    /**
     * Send SMS notification
     */
    private async sendSMS(alert: Alert, recipient: NotificationRecipient): Promise<void> {
        // In production, this would use the SMS provider
        console.log(`[SMS] To: ${recipient.phone}`);
        console.log(`[SMS] Message: [${alert.severity}] ${alert.title}`);
    }

    /**
     * Send push notification
     */
    private async sendPush(alert: Alert, recipient: NotificationRecipient): Promise<void> {
        // In production, this would use FCM or similar
        console.log(`[PUSH] To: ${recipient.id}`);
        console.log(`[PUSH] Title: ${alert.title}`);
        console.log(`[PUSH] Body: ${alert.message}`);
    }

    /**
     * Send webhook notification
     */
    private async sendWebhook(alert: Alert): Promise<void> {
        if (!this.channelConfig.webhook?.url) return;

        // In production, this would send to the configured webhook URL
        console.log(`[WEBHOOK] URL: ${this.channelConfig.webhook.url}`);
        console.log(`[WEBHOOK] Payload:`, JSON.stringify(alert));
    }

    /**
     * Start periodic alert processing
     */
    private startAlertProcessing(): void {
        // Process predictive alerts every minute
        setInterval(async () => {
            await this.processPredictiveAlerts();
        }, 60000);

        // Clean up old resolved alerts daily
        setInterval(() => {
            this.cleanupOldAlerts();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Process predictive alerts from the engine
     */
    private async processPredictiveAlerts(): Promise<void> {
        const engine = getPredictiveAlertEngine();
        const predictions = await engine.analyzeAndPredict();

        for (const prediction of predictions) {
            if (prediction.severity === 'critical' || prediction.severity === 'high') {
                await this.createAlert({
                    type: 'predictive',
                    severity: prediction.severity,
                    title: `Predicción: ${prediction.metric} alcanzará umbral`,
                    message: `${prediction.recommendation} (Estimado: ${prediction.timeframe} minutos)`,
                    source: 'predictive-engine',
                    prediction,
                });
            }
        }
    }

    /**
     * Clean up old resolved alerts
     */
    private cleanupOldAlerts(): void {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.alerts = this.alerts.filter(a =>
            !a.resolvedAt || a.resolvedAt > thirtyDaysAgo
        );
    }
}

// Singleton instance
let alertManager: AlertManager | null = null;

export function getAlertManager(): AlertManager {
    if (!alertManager) {
        alertManager = new AlertManager();
    }
    return alertManager;
}
