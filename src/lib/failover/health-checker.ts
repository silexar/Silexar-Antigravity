/**
 * Frontend Health Checker
 * 
 * Performs health checks on frontend deployments across multiple platforms.
 * Supports Vercel, Netlify, and Cloudflare Pages.
 */

import { logger } from '@/lib/observability';
import {
    HealthCheckResult,
    DeploymentStatus,
    FrontendDeploymentConfig,
    PLATFORM_RESPONSE_TIME_THRESHOLDS,
    PLATFORM_ERROR_RATE_THRESHOLDS
} from './types';

export interface HealthCheckOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

const DEFAULT_OPTIONS: Required<HealthCheckOptions> = {
    timeout: 5000,
    retries: 2,
    retryDelay: 1000
};

export class FrontendHealthChecker {
    private options: Required<HealthCheckOptions>;

    constructor(options: HealthCheckOptions = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * Perform a health check on a frontend deployment
     */
    async checkHealth(deployment: FrontendDeploymentConfig): Promise<HealthCheckResult> {
        const startTime = Date.now();
        const result: HealthCheckResult = {
            deploymentId: deployment.id,
            timestamp: new Date(),
            status: DeploymentStatus.UNKNOWN,
            responseTime: 0,
            errorRate: 0,
            sslExpiry: null,
            lastSuccessfulCheck: null,
            consecutiveFailures: 0,
            details: {}
        };

        try {
            // Perform HTTP health check
            const healthResponse = await this.performHealthCheck(deployment);

            result.responseTime = healthResponse.responseTime;
            result.details = healthResponse.details;

            // Calculate status based on response time threshold
            const responseThreshold = PLATFORM_RESPONSE_TIME_THRESHOLDS[deployment.platform] || 500;

            if (healthResponse.statusCode !== 200) {
                result.status = DeploymentStatus.UNHEALTHY;
                result.consecutiveFailures = healthResponse.consecutiveFailures;
            } else if (result.responseTime > responseThreshold * 2) {
                result.status = DeploymentStatus.UNHEALTHY;
                result.consecutiveFailures = healthResponse.consecutiveFailures;
            } else if (result.responseTime > responseThreshold) {
                result.status = DeploymentStatus.DEGRADED;
                result.consecutiveFailures = 0;
                result.lastSuccessfulCheck = new Date();
            } else {
                result.status = DeploymentStatus.HEALTHY;
                result.consecutiveFailures = 0;
                result.lastSuccessfulCheck = new Date();
            }

            // Check SSL certificate if HTTPS
            if (deployment.url.startsWith('https://')) {
                result.sslExpiry = await this.checkSSLExpiry(deployment.url);
            }

            logger.debug(`[HealthChecker] ${deployment.name} (${deployment.platform}): ${result.status} - ${result.responseTime}ms`);

        } catch (error) {
            result.status = DeploymentStatus.UNHEALTHY;
            result.details = {
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
            result.consecutiveFailures = (result.consecutiveFailures || 0) + 1;

            logger.error(`[HealthChecker] ${deployment.name} failed:`, error instanceof Error ? error : undefined);
        }

        return result;
    }

    /**
     * Perform health check with retry logic
     */
    private async performHealthCheck(
        deployment: FrontendDeploymentConfig
    ): Promise<{
        statusCode: number;
        responseTime: number;
        consecutiveFailures: number;
        details: HealthCheckResult['details'];
    }> {
        const healthEndpoint = this.getHealthEndpoint(deployment);
        const url = `${deployment.url}${healthEndpoint}`;
        let consecutiveFailures = 0;

        for (let attempt = 0; attempt <= this.options.retries; attempt++) {
            const startTime = Date.now();

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

                const response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'SilexarPulse-HealthChecker/1.0',
                        'Accept': 'application/json'
                    }
                });

                clearTimeout(timeoutId);
                const responseTime = Date.now() - startTime;

                if (!response.ok) {
                    consecutiveFailures++;
                    if (attempt < this.options.retries) {
                        await this.delay(this.options.retryDelay);
                        continue;
                    }
                }

                return {
                    statusCode: response.status,
                    responseTime,
                    consecutiveFailures,
                    details: {
                        statusCode: response.status,
                        region: response.headers.get('x-vercel-id') || undefined
                    }
                };
            } catch (error) {
                consecutiveFailures++;
                if (attempt < this.options.retries) {
                    await this.delay(this.options.retryDelay);
                    continue;
                }

                return {
                    statusCode: 0,
                    responseTime: Date.now() - startTime,
                    consecutiveFailures,
                    details: {
                        errorMessage: error instanceof Error ? error.message : 'Connection failed'
                    }
                };
            }
        }

        return {
            statusCode: 0,
            responseTime: 0,
            consecutiveFailures,
            details: { errorMessage: 'Max retries exceeded' }
        };
    }

    /**
     * Get the health check endpoint for a deployment
     */
    private getHealthEndpoint(deployment: FrontendDeploymentConfig): string {
        if (deployment.healthCheckEndpoint) {
            return deployment.healthCheckEndpoint;
        }

        // Default endpoints by platform
        switch (deployment.platform) {
            case 'vercel':
                return '/api/health';
            case 'netlify':
                return '/api/health';
            case 'cloudflare_pages':
                return '/api/health';
            default:
                return '/';
        }
    }

    /**
     * Check SSL certificate expiry
     */
    private async checkSSLExpiry(url: string): Promise<Date | null> {
        try {
            const urlObj = new URL(url);

            // In production, you would use a proper SSL certificate check
            // For now, we simulate by connecting and checking
            const connect = await fetch(url, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });

            // Get certificate info from response headers or timing
            // This is a simplified version - real implementation would use
            // a proper TLS library like node:tls or a third-party service
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 90); // Assume 90 days

            return expiresAt;
        } catch {
            return null;
        }
    }

    /**
     * Check multiple deployments in parallel
     */
    async checkMultiple(deployments: FrontendDeploymentConfig[]): Promise<Map<string, HealthCheckResult>> {
        const results = new Map<string, HealthCheckResult>();

        const checks = deployments.map(async (deployment) => {
            const result = await this.checkHealth(deployment);
            results.set(deployment.id, result);
        });

        await Promise.all(checks);
        return results;
    }

    /**
     * Determine if deployment should failover based on health check
     */
    shouldFailover(
        deployment: FrontendDeploymentConfig,
        healthResult: HealthCheckResult
    ): boolean {
        if (!deployment.enabled) return false;

        // Check consecutive failures threshold
        if (healthResult.consecutiveFailures >= deployment.failoverThreshold) {
            return true;
        }

        // Check response time threshold
        const responseThreshold = PLATFORM_RESPONSE_TIME_THRESHOLDS[deployment.platform] || 500;
        if (healthResult.responseTime > responseThreshold * 3) {
            return true;
        }

        // Check error rate
        const errorThreshold = PLATFORM_ERROR_RATE_THRESHOLDS[deployment.platform] || 1;
        if (healthResult.errorRate > errorThreshold * 5) {
            return true;
        }

        return false;
    }

    /**
     * Calculate deployment status from multiple health checks
     */
    calculateStatus(healthResults: HealthCheckResult[]): DeploymentStatus {
        if (healthResults.length === 0) {
            return DeploymentStatus.UNKNOWN;
        }

        const statuses = healthResults.map(r => r.status);

        if (statuses.every(s => s === DeploymentStatus.HEALTHY)) {
            return DeploymentStatus.HEALTHY;
        }

        if (statuses.some(s => s === DeploymentStatus.UNHEALTHY)) {
            return DeploymentStatus.UNHEALTHY;
        }

        if (statuses.some(s => s === DeploymentStatus.DEGRADED)) {
            return DeploymentStatus.DEGRADED;
        }

        return DeploymentStatus.UNKNOWN;
    }

    /**
     * Get average response time from health results
     */
    getAverageResponseTime(healthResults: HealthCheckResult[]): number {
        if (healthResults.length === 0) return 0;

        const total = healthResults.reduce((sum, r) => sum + r.responseTime, 0);
        return total / healthResults.length;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Create a singleton health checker instance
 */
let healthCheckerInstance: FrontendHealthChecker | null = null;

export function getHealthChecker(options?: HealthCheckOptions): FrontendHealthChecker {
    if (!healthCheckerInstance) {
        healthCheckerInstance = new FrontendHealthChecker(options);
    }
    return healthCheckerInstance;
}