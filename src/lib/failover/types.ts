/**
 * Frontend Failover System Types
 * 
 * Defines all types for the multi-platform frontend failover system.
 * Supports Vercel, Netlify, and Cloudflare Pages as deployment targets.
 */

export enum FrontendPlatform {
    VERCEL = 'vercel',
    NETLIFY = 'netlify',
    CLOUDFLARE_PAGES = 'cloudflare_pages'
}

export enum DeploymentStatus {
    HEALTHY = 'healthy',
    DEGRADED = 'degraded',
    UNHEALTHY = 'unhealthy',
    UNKNOWN = 'unknown'
}

export enum FailoverState {
    NORMAL = 'normal',
    FAILING_OVER = 'failing_over',
    IN_FAILOVER = 'in_failover',
    FAILING_BACK = 'failing_back'
}

export interface HealthCheckResult {
    deploymentId: string;
    timestamp: Date;
    status: DeploymentStatus;
    responseTime: number;
    errorRate: number;
    sslExpiry: Date | null;
    lastSuccessfulCheck: Date | null;
    consecutiveFailures: number;
    details?: {
        statusCode?: number;
        errorMessage?: string;
        region?: string;
    };
}

export interface FrontendDeploymentConfig {
    id: string;
    name: string;
    platform: FrontendPlatform;
    url: string;
    apiKey?: string;
    accessToken?: string;
    teamId?: string;
    projectId?: string;
    accountId?: string; // Cloudflare account ID
    siteId?: string; // Netlify site ID
    isPrimary: boolean;
    priority: number;
    healthCheckInterval: number; // milliseconds
    healthCheckEndpoint: string;
    failoverThreshold: number; // consecutive failures before failover
    responseTimeThreshold: number; // ms
    errorRateThreshold: number; // percentage
    regions?: string[];
    enabled: boolean;
}

export interface FailoverEvent {
    id: string;
    timestamp: Date;
    type: 'failover' | 'failback' | 'health_check_failed' | 'manual_trigger' | 'recovery';
    fromDeployment?: string;
    toDeployment?: string;
    reason: string;
    duration?: number; // ms
    success: boolean;
    triggeredBy: 'automatic' | 'manual';
    userId?: string;
}

export interface FailoverStatus {
    currentState: FailoverState;
    primaryDeployment: string | null;
    activeDeployment: string;
    deployments: FrontendDeploymentConfig[];
    lastFailover: FailoverEvent | null;
    recentEvents: FailoverEvent[];
    metrics: {
        totalFailovers: number;
        successfulFailovers: number;
        failedFailovers: number;
        averageFailoverTime: number;
        lastHealthCheck: Date;
        uptimePercentage: number;
    };
}

export interface FailoverResult {
    success: boolean;
    fromDeployment: string;
    toDeployment: string;
    failoverTime: number;
    dnsUpdateTime?: number;
    totalTime: number;
    error?: string;
}

export interface DNSRecord {
    id: string;
    name: string;
    type: 'A' | 'AAAA' | 'CNAME';
    content: string;
    proxied: boolean;
    ttl: number;
    priority?: number;
}

export interface DNSFailoverConfig {
    provider: 'cloudflare';
    apiToken: string;
    zoneId: string;
    recordName: string;
    recordType: 'A' | 'CNAME';
    healthCheckInterval: number;
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
}

export interface DNSCheckResult {
    success: boolean;
    currentRecord: DNSRecord;
    healthStatus: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
}

export interface DeploymentCredentials {
    platform: FrontendPlatform;
    apiKey?: string;
    accessToken?: string;
    teamId?: string;
    siteId?: string;
    accountId?: string; // Cloudflare
    projectName?: string;
}

export interface DeploymentResult {
    success: boolean;
    platform: FrontendPlatform;
    deploymentId: string;
    deploymentUrl: string;
    buildId?: string;
    commitSha?: string;
    branch?: string;
    timestamp: Date;
    duration: number;
    error?: string;
}

export interface HealthCheckConfig {
    interval: number; // ms
    timeout: number; // ms
    failureThreshold: number; // consecutive failures
    successThreshold: number; // consecutive successes for recovery
    endpoints: string[];
}

export interface FailoverPolicy {
    automaticFailover: boolean;
    automaticFailback: boolean;
    failoverThreshold: number; // consecutive failures
    failbackThreshold: number; // consecutive successes
    cooldownPeriod: number; // ms before allowing another failover
    notifyOnFailover: boolean;
    notifyOnFailback: boolean;
    allowedTargetPlatforms: FrontendPlatform[];
}

export interface FailoverMetrics {
    uptime: number; // percentage
    totalIncidents: number;
    averageResolutionTime: number; // ms
    lastIncident: Date | null;
    affectedDeployments: number;
    successfulFailovers: number;
    failedFailovers: number;
}

// Health check defaults
export const DEFAULT_HEALTH_CHECK_CONFIG: HealthCheckConfig = {
    interval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
    failureThreshold: 3,
    successThreshold: 3,
    endpoints: ['/api/health', '/']
};

// Failover policy defaults
export const DEFAULT_FAILOVER_POLICY: FailoverPolicy = {
    automaticFailover: true,
    automaticFailback: true,
    failoverThreshold: 3,
    failbackThreshold: 3,
    cooldownPeriod: 300000, // 5 minutes
    notifyOnFailover: true,
    notifyOnFailback: true,
    allowedTargetPlatforms: [
        FrontendPlatform.VERCEL,
        FrontendPlatform.NETLIFY,
        FrontendPlatform.CLOUDFLARE_PAGES
    ]
};

// Platform health check endpoints
export const PLATFORM_HEALTH_ENDPOINTS: Record<FrontendPlatform, string[]> = {
    [FrontendPlatform.VERCEL]: ['/api/health'],
    [FrontendPlatform.NETLIFY]: ['/.netlify/functions/health', '/api/health'],
    [FrontendPlatform.CLOUDFLARE_PAGES]: ['/api/health']
};

// Response time thresholds by platform (ms)
export const PLATFORM_RESPONSE_TIME_THRESHOLDS: Record<FrontendPlatform, number> = {
    [FrontendPlatform.VERCEL]: 500,
    [FrontendPlatform.NETLIFY]: 600,
    [FrontendPlatform.CLOUDFLARE_PAGES]: 400
};

// Error rate thresholds by platform (percentage)
export const PLATFORM_ERROR_RATE_THRESHOLDS: Record<FrontendPlatform, number> = {
    [FrontendPlatform.VERCEL]: 1,
    [FrontendPlatform.NETLIFY]: 1.5,
    [FrontendPlatform.CLOUDFLARE_PAGES]: 0.8
};