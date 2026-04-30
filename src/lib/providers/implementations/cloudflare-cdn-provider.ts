/**
 * Cloudflare CDN Provider Implementation
 * 
 * Implements the ICDNProvider interface for Cloudflare CDN.
 */

import { ProviderHealth, ProviderStatus } from '../interfaces/base-provider';
import { ICDNProvider, CDNCacheStatus, EdgeLocation, CDNRule } from '../interfaces/cdn-provider';

export interface CloudflareCDNConfig {
    apiToken: string;
    zoneId: string;
    accountId: string;
}

export class CloudflareCDNProvider implements ICDNProvider {
    readonly id: string;
    readonly name: string;
    readonly type = 'cdn';
    readonly providerClass = 'cloudflare_cdn' as const;
    isPrimary: boolean;

    private config: CloudflareCDNConfig | null = null;
    private status: ProviderStatus = ProviderStatus.INACTIVE;
    private enabled: boolean = true;

    constructor(id: string, isPrimary = false) {
        this.id = id;
        this.name = `Cloudflare CDN (${id})`;
        this.isPrimary = isPrimary;
    }

    async initialize(config: Record<string, unknown>): Promise<void> {
        this.config = {
            apiToken: config.apiToken as string,
            zoneId: config.zoneId as string,
            accountId: config.accountId as string
        };
        this.status = ProviderStatus.ACTIVE;
    }

    async getHealth(): Promise<ProviderHealth> {
        if (!this.config) {
            return {
                status: ProviderStatus.UNAVAILABLE,
                latency: -1,
                errorRate: 100,
                lastCheck: new Date(),
                message: 'Provider not initialized'
            };
        }

        try {
            const startTime = Date.now();
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const latency = Date.now() - startTime;

            if (!response.ok) {
                return {
                    status: ProviderStatus.DEGRADED,
                    latency,
                    errorRate: 5,
                    lastCheck: new Date(),
                    message: `API returned ${response.status}`
                };
            }

            return {
                status: ProviderStatus.ACTIVE,
                latency,
                errorRate: 0.01,
                lastCheck: new Date()
            };
        } catch (error) {
            return {
                status: ProviderStatus.UNAVAILABLE,
                latency: -1,
                errorRate: 100,
                lastCheck: new Date(),
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async test(): Promise<boolean> {
        try {
            const health = await this.getHealth();
            return health.status === ProviderStatus.ACTIVE;
        } catch {
            return false;
        }
    }

    async getCacheStatus(): Promise<CDNCacheStatus> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/analytics/dashboard?since=-60&until=0`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();

            return {
                totalRequests: data.result?.totals?.requests?.all || 0,
                cacheHitRate: data.result?.totals?.cache?.hitRatio || 0,
                bandwidthSaved: data.result?.totals?.bandwidth?.saved || 0,
                missRate: 1 - (data.result?.totals?.cache?.hitRatio || 0)
            };
        } catch {
            return {
                totalRequests: 0,
                cacheHitRate: 0,
                bandwidthSaved: 0,
                missRate: 1
            };
        }
    }

    async purgeCache(patterns: string[]): Promise<void> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: patterns
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to purge cache: ${response.status}`);
        }
    }

    async getEdgeLocations(): Promise<EdgeLocation[]> {
        // Cloudflare has edge locations worldwide
        // This is a simplified list of major locations
        return [
            { id: 'us-east', name: 'US East', city: 'Ashburn', country: 'US', region: 'North America' },
            { id: 'us-west', name: 'US West', city: 'San Jose', country: 'US', region: 'North America' },
            { id: 'eu-west', name: 'EU West', city: 'Amsterdam', country: 'NL', region: 'Europe' },
            { id: 'eu-central', name: 'EU Central', city: 'Frankfurt', country: 'DE', region: 'Europe' },
            { id: 'ap-south', name: 'Asia Pacific South', city: 'Singapore', country: 'SG', region: 'Asia' },
            { id: 'ap-east', name: 'Asia Pacific East', city: 'Hong Kong', country: 'HK', region: 'Asia' },
            { id: 'sa-east', name: 'South America East', city: 'São Paulo', country: 'BR', region: 'South America' },
            { id: 'au-east', name: 'Australia East', city: 'Sydney', country: 'AU', region: 'Oceania' }
        ];
    }

    async configureRules(rules: CDNRule[]): Promise<void> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        // Configure page rules via Cloudflare API
        for (const rule of rules) {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/pagerules`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        targets: [{ url: rule.pattern }],
                        actions: [{
                            id: rule.action === 'cache' ? 'cache_level' : 'forwarding_url',
                            value: rule.action === 'cache' ? 'cache_everything' : rule.ttl?.toString()
                        }],
                        status: rule.enabled ? 'active' : 'disabled'
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to configure rule ${rule.name}: ${response.status}`);
            }
        }
    }

    async getStatistics(): Promise<{
        requests: number;
        bandwidth: number;
        cacheHitRate: number;
        errorRate: number;
    }> {
        const cacheStatus = await this.getCacheStatus();

        return {
            requests: cacheStatus.totalRequests,
            bandwidth: cacheStatus.bandwidthSaved,
            cacheHitRate: cacheStatus.cacheHitRate,
            errorRate: cacheStatus.missRate
        };
    }

    async setEnabled(enabled: boolean): Promise<void> {
        this.enabled = enabled;
        this.status = enabled ? ProviderStatus.ACTIVE : ProviderStatus.INACTIVE;
    }

    getStatus(): ProviderStatus {
        return this.status;
    }
}