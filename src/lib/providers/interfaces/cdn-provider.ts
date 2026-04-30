/**
 * CDN Provider Interface
 * 
 * Defines the contract for CDN (Content Delivery Network) providers
 * used in the frontend failover system.
 */

import { ProviderHealth, ProviderStatus } from './base-provider';

export interface CDNCacheStatus {
    totalRequests: number;
    cacheHitRate: number;
    bandwidthSaved: number;
    missRate: number;
}

export interface EdgeLocation {
    id: string;
    name: string;
    city: string;
    country: string;
    region: string;
    latitude?: number;
    longitude?: number;
}

export interface CDNRule {
    id: string;
    name: string;
    pattern: string;
    action: 'cache' | 'bypass' | 'redirect' | 'rewrite';
    ttl?: number;
    priority?: number;
    enabled: boolean;
}

export interface ICDNProvider {
    readonly id: string;
    readonly name: string;
    readonly type: 'cdn';
    readonly providerClass: 'cloudflare_cdn' | 'aws_cloudfront' | 'akamai' | 'fastly';
    isPrimary: boolean;

    /**
     * Initialize the provider with configuration
     */
    initialize(config: Record<string, unknown>): Promise<void>;

    /**
     * Get provider health status
     */
    getHealth(): Promise<ProviderHealth>;

    /**
     * Test the provider connection
     */
    test(): Promise<boolean>;

    /**
     * Get cache status and statistics
     */
    getCacheStatus(): Promise<CDNCacheStatus>;

    /**
     * Purge cache for specific patterns
     */
    purgeCache(patterns: string[]): Promise<void>;

    /**
     * Get list of edge locations
     */
    getEdgeLocations(): Promise<EdgeLocation[]>;

    /**
     * Configure CDN rules
     */
    configureRules(rules: CDNRule[]): Promise<void>;

    /**
     * Get current CDN statistics
     */
    getStatistics(): Promise<{
        requests: number;
        bandwidth: number;
        cacheHitRate: number;
        errorRate: number;
    }>;

    /**
     * Enable/disable the CDN
     */
    setEnabled(enabled: boolean): Promise<void>;

    /**
     * Get the provider status
     */
    getStatus(): ProviderStatus;
}