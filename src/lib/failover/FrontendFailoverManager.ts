/**
 * Frontend Failover Manager
 * 
 * Central manager for frontend deployment failover across multiple platforms.
 * Manages health checks, automatic failover, and failback operations.
 */

import { logger } from '@/lib/observability';
import { auditLogger, logAuth } from '@/lib/security/audit-logger';
import { FrontendHealthChecker } from './health-checker';
import { DNSFailoverManager } from './dns-failover';
import {
    FrontendDeploymentConfig,
    FrontendPlatform,
    DeploymentStatus,
    FailoverState,
    FailoverEvent,
    FailoverStatus,
    FailoverResult,
    FailoverPolicy,
    HealthCheckResult,
    DEFAULT_FAILOVER_POLICY,
    DEFAULT_HEALTH_CHECK_CONFIG
} from './types';

export interface FrontendFailoverManagerConfig {
    deployments: FrontendDeploymentConfig[];
    dnsManager: DNSFailoverManager;
    policy: Partial<FailoverPolicy>;
    healthCheckInterval?: number;
}

export class FrontendFailoverManager {
    private deployments: Map<string, FrontendDeploymentConfig>;
    private dnsManager: DNSFailoverManager;
    private policy: FailoverPolicy;
    private healthChecker: FrontendHealthChecker;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private lastHealthChecks: Map<string, HealthCheckResult>;
    private failoverHistory: FailoverEvent[];
    private currentState: FailoverState;
    private primaryDeploymentId: string | null;
    private activeDeploymentId: string;
    private cooldownUntil: number;
    private metrics: {
        totalFailovers: number;
        successfulFailovers: number;
        failedFailovers: number;
        averageFailoverTime: number;
    };

    constructor(config: FrontendFailoverManagerConfig) {
        this.deployments = new Map();
        this.dnsManager = config.dnsManager;
        this.policy = { ...DEFAULT_FAILOVER_POLICY, ...config.policy };
        this.healthChecker = new FrontendHealthChecker({
            timeout: 5000,
            retries: 2
        });
        this.lastHealthChecks = new Map();
        this.failoverHistory = [];
        this.currentState = FailoverState.NORMAL;
        this.primaryDeploymentId = null;
        this.activeDeploymentId = '';
        this.cooldownUntil = 0;
        this.metrics = {
            totalFailovers: 0,
            successfulFailovers: 0,
            failedFailovers: 0,
            averageFailoverTime: 0
        };

        // Register deployments
        for (const deployment of config.deployments) {
            this.deployments.set(deployment.id, deployment);

            if (deployment.isPrimary) {
                this.primaryDeploymentId = deployment.id;
                this.activeDeploymentId = deployment.id;
            }
        }

        logger.info(`[FrontendFailover] Initialized with ${this.deployments.size} deployments`);
    }

    /**
     * Start health monitoring for all deployments
     */
    startHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            return; // Already running
        }

        const interval = DEFAULT_HEALTH_CHECK_CONFIG.interval;

        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthChecks();
        }, interval);

        logger.info(`[FrontendFailover] Health monitoring started (interval: ${interval}ms)`);

        // Perform initial check
        setTimeout(() => this.performHealthChecks(), 1000);
    }

    /**
     * Stop health monitoring
     */
    stopHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            logger.info(`[FrontendFailover] Health monitoring stopped`);
        }
    }

    /**
     * Perform health checks on all deployments
     */
    async performHealthChecks(): Promise<Map<string, HealthCheckResult>> {
        const results = new Map<string, HealthCheckResult>();

        for (const [id, deployment] of this.deployments) {
            if (!deployment.enabled) continue;

            const result = await this.healthChecker.checkHealth(deployment);
            results.set(id, result);
            this.lastHealthChecks.set(id, result);

            // Check if failover is needed
            if (this.policy.automaticFailover && this.shouldFailover(deployment, result)) {
                logger.warn(`[FrontendFailover] Deployment ${deployment.name} failed health check`);
                await this.handleHealthCheckFailure(deployment.id);
            }
        }

        return results;
    }

    /**
     * Check if a deployment should failover
     */
    private shouldFailover(deployment: FrontendDeploymentConfig, result: HealthCheckResult): boolean {
        // Check cooldown
        if (Date.now() < this.cooldownUntil) {
            return false;
        }

        // Check if this is the primary deployment
        if (!deployment.isPrimary && this.currentState === FailoverState.NORMAL) {
            return false; // Only failover primary
        }

        // Check consecutive failures
        if (result.consecutiveFailures >= this.policy.failoverThreshold) {
            return true;
        }

        // Check response time
        if (result.responseTime > 5000) {
            return true;
        }

        // Check status
        if (result.status === DeploymentStatus.UNHEALTHY) {
            return true;
        }

        return false;
    }

    /**
     * Handle health check failure
     */
    private async handleHealthCheckFailure(deploymentId: string): Promise<void> {
        if (this.currentState !== FailoverState.NORMAL) {
            return; // Already in failover state
        }

        const deployment = this.deployments.get(deploymentId);
        if (!deployment || !deployment.isPrimary) return;

        // Find best failover target
        const target = this.findFailoverTarget();
        if (!target) {
            logger.error(`[FrontendFailover] No healthy failover target available`);
            return;
        }

        // Perform failover
        await this.performFailover(deployment.id, target.id, 'Automatic failover due to health check failure');
    }

    /**
     * Find the best failover target
     */
    private findFailoverTarget(): FrontendDeploymentConfig | null {
        const primary = this.deployments.get(this.primaryDeploymentId!);
        if (!primary) return null;

        // Get health checks
        const candidates: Array<{ deployment: FrontendDeploymentConfig; health: HealthCheckResult | undefined }> = [];

        for (const [id, deployment] of this.deployments) {
            if (id === this.primaryDeploymentId) continue;
            if (!deployment.enabled) continue;
            if (!this.policy.allowedTargetPlatforms.includes(deployment.platform)) continue;

            const health = this.lastHealthChecks.get(id);
            if (health && health.status === DeploymentStatus.HEALTHY) {
                candidates.push({ deployment, health });
            }
        }

        if (candidates.length === 0) {
            return null;
        }

        // Sort by priority (lower is better) and response time
        candidates.sort((a, b) => {
            if (a.deployment.priority !== b.deployment.priority) {
                return a.deployment.priority - b.deployment.priority;
            }
            return (a.health?.responseTime || 999999) - (b.health?.responseTime || 999999);
        });

        return candidates[0].deployment;
    }

    /**
     * Perform failover from one deployment to another
     */
    async performFailover(
        fromId: string,
        toId: string,
        reason: string,
        userId?: string
    ): Promise<FailoverResult> {
        const startTime = Date.now();

        const fromDeployment = this.deployments.get(fromId);
        const toDeployment = this.deployments.get(toId);

        if (!fromDeployment || !toDeployment) {
            return {
                success: false,
                fromDeployment: fromId,
                toDeployment: toId,
                failoverTime: 0,
                totalTime: 0,
                error: 'Deployment not found'
            };
        }

        logger.info(`[FrontendFailover] Performing failover: ${fromDeployment.name} -> ${toDeployment.name}`);

        // Update state
        this.currentState = FailoverState.FAILING_OVER;

        // Create event
        const event: FailoverEvent = {
            id: `fe-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
            type: 'failover',
            fromDeployment: fromId,
            toDeployment: toId,
            reason,
            triggeredBy: userId ? 'manual' : 'automatic',
            userId,
            success: false
        };

        let dnsUpdateTime = 0;

        try {
            // Update DNS
            const dnsUpdateStart = Date.now();
            const dnsSuccess = await this.dnsManager.failoverTo(toDeployment.url);
            dnsUpdateTime = Date.now() - dnsUpdateStart;

            if (!dnsSuccess) {
                throw new Error('DNS update failed');
            }

            // Update deployment states
            fromDeployment.isPrimary = false;
            toDeployment.isPrimary = true;

            // Update active deployment
            this.activeDeploymentId = toId;

            // Calculate failover time
            const failoverTime = Date.now() - startTime;

            // Update metrics
            this.metrics.totalFailovers++;
            this.metrics.successfulFailovers++;
            this.metrics.averageFailoverTime =
                (this.metrics.averageFailoverTime * (this.metrics.successfulFailovers - 1) + failoverTime) /
                this.metrics.successfulFailovers;

            // Set cooldown
            this.cooldownUntil = Date.now() + this.policy.cooldownPeriod;

            // Update state
            this.currentState = FailoverState.IN_FAILOVER;
            event.duration = failoverTime;
            event.success = true;

            // Log audit (fire and forget)
            logAuth('Failover triggered', userId || 'system', {
                from: fromDeployment.name,
                to: toDeployment.name,
                reason,
                failoverTime,
                dnsUpdateTime,
                type: 'frontend_failover'
            });

            logger.info(`[FrontendFailover] Failover completed in ${failoverTime}ms`);

            return {
                success: true,
                fromDeployment: fromId,
                toDeployment: toId,
                failoverTime,
                dnsUpdateTime,
                totalTime: Date.now() - startTime
            };

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            this.metrics.totalFailovers++;
            this.metrics.failedFailovers++;

            event.success = false;
            event.duration = Date.now() - startTime;

            logger.error(`[FrontendFailover] Failover failed:`, error instanceof Error ? error : undefined);

            // Revert state
            this.currentState = FailoverState.NORMAL;

            return {
                success: false,
                fromDeployment: fromId,
                toDeployment: toId,
                failoverTime: Date.now() - startTime,
                totalTime: Date.now() - startTime,
                error: errorMessage
            };
        } finally {
            this.failoverHistory.push(event);

            // Keep only last 100 events
            if (this.failoverHistory.length > 100) {
                this.failoverHistory = this.failoverHistory.slice(-100);
            }
        }
    }

    /**
     * Perform failback to primary deployment
     */
    async performFailback(reason: string, userId?: string): Promise<FailoverResult> {
        if (!this.primaryDeploymentId) {
            return {
                success: false,
                fromDeployment: this.activeDeploymentId,
                toDeployment: '',
                failoverTime: 0,
                totalTime: 0,
                error: 'No primary deployment configured'
            };
        }

        if (this.activeDeploymentId === this.primaryDeploymentId) {
            return {
                success: false,
                fromDeployment: this.activeDeploymentId,
                toDeployment: this.primaryDeploymentId,
                failoverTime: 0,
                totalTime: 0,
                error: 'Already on primary deployment'
            };
        }

        const primary = this.deployments.get(this.primaryDeploymentId)!;
        const current = this.deployments.get(this.activeDeploymentId)!;

        // Check if primary is healthy
        const primaryHealth = this.lastHealthChecks.get(this.primaryDeploymentId);
        if (!primaryHealth || primaryHealth.status !== DeploymentStatus.HEALTHY) {
            return {
                success: false,
                fromDeployment: current.id,
                toDeployment: primary.id,
                failoverTime: 0,
                totalTime: 0,
                error: 'Primary deployment is not healthy'
            };
        }

        this.currentState = FailoverState.FAILING_BACK;

        const result = await this.performFailover(
            this.activeDeploymentId,
            this.primaryDeploymentId,
            reason,
            userId
        );

        if (result.success) {
            this.currentState = FailoverState.NORMAL;
        }

        return result;
    }

    /**
     * Get current failover status
     */
    getStatus(): FailoverStatus {
        const primary = this.primaryDeploymentId
            ? this.deployments.get(this.primaryDeploymentId)
            : null;

        const active = this.deployments.get(this.activeDeploymentId);

        // Calculate uptime
        const healthyDeployments = Array.from(this.lastHealthChecks.values())
            .filter(h => h.status === DeploymentStatus.HEALTHY).length;
        const uptimePercentage = this.deployments.size > 0
            ? (healthyDeployments / this.deployments.size) * 100
            : 0;

        return {
            currentState: this.currentState,
            primaryDeployment: this.primaryDeploymentId,
            activeDeployment: this.activeDeploymentId,
            deployments: Array.from(this.deployments.values()),
            lastFailover: this.failoverHistory[this.failoverHistory.length - 1] || null,
            recentEvents: this.failoverHistory.slice(-10).reverse(),
            metrics: {
                totalFailovers: this.metrics.totalFailovers,
                successfulFailovers: this.metrics.successfulFailovers,
                failedFailovers: this.metrics.failedFailovers,
                averageFailoverTime: this.metrics.averageFailoverTime,
                lastHealthCheck: new Date(),
                uptimePercentage
            }
        };
    }

    /**
     * Get health status for all deployments
     */
    getHealthStatus(): Map<string, HealthCheckResult> {
        return new Map(this.lastHealthChecks);
    }

    /**
     * Add a new deployment to monitor
     */
    addDeployment(deployment: FrontendDeploymentConfig): void {
        this.deployments.set(deployment.id, deployment);

        if (deployment.isPrimary && !this.primaryDeploymentId) {
            this.primaryDeploymentId = deployment.id;
            this.activeDeploymentId = deployment.id;
        }

        logger.info(`[FrontendFailover] Added deployment: ${deployment.name}`);
    }

    /**
     * Remove a deployment from monitoring
     */
    removeDeployment(id: string): void {
        const deployment = this.deployments.get(id);
        if (!deployment) return;

        // Don't remove if it's the active deployment during failover
        if (id === this.activeDeploymentId && this.currentState !== FailoverState.NORMAL) {
            logger.warn(`[FrontendFailover] Cannot remove active deployment during failover`);
            return;
        }

        this.deployments.delete(id);
        this.lastHealthChecks.delete(id);

        logger.info(`[FrontendFailover] Removed deployment: ${deployment.name}`);
    }

    /**
     * Enable or disable a deployment
     */
    setDeploymentEnabled(id: string, enabled: boolean): void {
        const deployment = this.deployments.get(id);
        if (deployment) {
            deployment.enabled = enabled;
            logger.info(`[FrontendFailover] Deployment ${deployment.name} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Manually trigger failover
     */
    async triggerManualFailover(targetId: string, userId: string): Promise<FailoverResult> {
        if (this.currentState !== FailoverState.NORMAL) {
            return {
                success: false,
                fromDeployment: this.activeDeploymentId,
                toDeployment: targetId,
                failoverTime: 0,
                totalTime: 0,
                error: 'Failover already in progress'
            };
        }

        return this.performFailover(
            this.activeDeploymentId,
            targetId,
            'Manual failover triggered by administrator',
            userId
        );
    }

    /**
     * Manually trigger failback
     */
    async triggerManualFailback(userId: string): Promise<FailoverResult> {
        return this.performFailback('Manual failback triggered by administrator', userId);
    }

    /**
     * Update failover policy
     */
    updatePolicy(policy: Partial<FailoverPolicy>): void {
        this.policy = { ...this.policy, ...policy };
        logger.info(`[FrontendFailover] Policy updated`);
    }

    /**
     * Get failover policy
     */
    getPolicy(): FailoverPolicy {
        return { ...this.policy };
    }
}

/**
 * Factory function to create frontend failover manager
 */
export function createFrontendFailoverManager(): FrontendFailoverManager {
    const { DNSFailoverManager } = require('./dns-failover');

    const dnsManager = new DNSFailoverManager({
        provider: 'cloudflare',
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
        zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
        recordName: process.env.DNS_FAILOVER_RECORD_NAME || 'app.silexar.com',
        recordType: 'CNAME',
        healthCheckInterval: 30000,
        failureThreshold: 3,
        successThreshold: 3,
        timeout: 5000
    });

    // Default deployments configuration
    const deployments: FrontendDeploymentConfig[] = [
        {
            id: 'vercel-primary',
            name: 'Vercel Primary',
            platform: FrontendPlatform.VERCEL,
            url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://app.silexar.com',
            isPrimary: true,
            priority: 1,
            healthCheckInterval: 30000,
            healthCheckEndpoint: '/api/health',
            failoverThreshold: 3,
            responseTimeThreshold: 500,
            errorRateThreshold: 1,
            enabled: true
        },
        {
            id: 'netlify-failover-1',
            name: 'Netlify Failover',
            platform: FrontendPlatform.NETLIFY,
            url: process.env.NETLIFY_URL || 'https://silexar-pulse.netlify.app',
            apiKey: process.env.NETLIFY_API_TOKEN,
            isPrimary: false,
            priority: 2,
            healthCheckInterval: 30000,
            healthCheckEndpoint: '/api/health',
            failoverThreshold: 3,
            responseTimeThreshold: 600,
            errorRateThreshold: 1.5,
            enabled: true
        },
        {
            id: 'cloudflare-failover-2',
            name: 'Cloudflare Pages Failover',
            platform: FrontendPlatform.CLOUDFLARE_PAGES,
            url: process.env.CLOUDFLARE_PAGES_URL || 'https://silexar-pulse.pages.dev',
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
            isPrimary: false,
            priority: 3,
            healthCheckInterval: 30000,
            healthCheckEndpoint: '/api/health',
            failoverThreshold: 3,
            responseTimeThreshold: 400,
            errorRateThreshold: 0.8,
            enabled: true
        }
    ];

    return new FrontendFailoverManager({
        deployments,
        dnsManager,
        policy: {
            automaticFailover: process.env.AUTOMATIC_FAILOVER !== 'false',
            automaticFailback: process.env.AUTOMATIC_FAILBACK !== 'false',
            failoverThreshold: parseInt(process.env.FAILOVER_THRESHOLD || '3'),
            failbackThreshold: 3,
            cooldownPeriod: 300000,
            notifyOnFailover: true,
            notifyOnFailback: true,
            allowedTargetPlatforms: [
                FrontendPlatform.VERCEL,
                FrontendPlatform.NETLIFY,
                FrontendPlatform.CLOUDFLARE_PAGES
            ]
        }
    });
}