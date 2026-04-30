/**
 * Frontend Failover System - Index
 * 
 * Exports all failover-related modules and utilities.
 */

export * from './types';
export { FrontendHealthChecker, getHealthChecker } from './health-checker';
export { DNSFailoverManager, createDNSFailoverManager } from './dns-failover';
export { FrontendFailoverManager, createFrontendFailoverManager } from './FrontendFailoverManager';

// Re-export types for convenience
export type {
    FrontendDeploymentConfig,
    FailoverEvent,
    FailoverStatus,
    FailoverResult,
    HealthCheckResult,
    DNSRecord,
    DNSFailoverConfig,
    FailoverPolicy
} from './types';