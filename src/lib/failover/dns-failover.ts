/**
 * DNS Failover Manager
 * 
 * Manages DNS failover using Cloudflare API.
 * Automatically updates DNS records when primary frontend fails health checks.
 */

import { logger } from '@/lib/observability';
import {
    DNSRecord,
    DNSFailoverConfig,
    DNSCheckResult
} from './types';

export class DNSFailoverManager {
    private config: DNSFailoverConfig;
    private currentRecordId: string | null = null;

    constructor(config: DNSFailoverConfig) {
        this.config = config;
    }

    /**
     * Update DNS record to point to new deployment
     */
    async updateDNSRecord(newTarget: string): Promise<DNSRecord | null> {
        try {
            logger.info(`[DNSFailover] Updating DNS record to: ${newTarget}`);

            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                const error = await response.json();
                logger.error(`[DNSFailover] Failed to fetch DNS records:`, error);
                return null;
            }

            const data = await response.json();
            const records: DNSRecord[] = data.result;

            // Find the record we want to update
            const record = records.find(
                r => r.name === this.config.recordName && r.type === this.config.recordType
            );

            if (!record) {
                logger.error(`[DNSFailover] Record not found: ${this.config.recordName}`);
                return null;
            }

            this.currentRecordId = record.id;

            // Update the record
            const updateResponse = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records/${record.id}`,
                {
                    method: 'PUT',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        type: this.config.recordType,
                        name: this.config.recordName,
                        content: newTarget,
                        proxied: record.proxied,
                        ttl: this.config.recordType === 'CNAME' ? 1 : record.ttl
                    })
                }
            );

            if (!updateResponse.ok) {
                const error = await updateResponse.json();
                logger.error(`[DNSFailover] Failed to update DNS record:`, error);
                return null;
            }

            const updatedRecord = await updateResponse.json();
            logger.info(`[DNSFailover] DNS record updated successfully: ${this.config.recordName} -> ${newTarget}`);

            return updatedRecord.result;

        } catch (error) {
            logger.error(`[DNSFailover] Error updating DNS record:`, error instanceof Error ? error : undefined);
            return null;
        }
    }

    /**
     * Get current DNS record settings
     */
    async getCurrentDNSRecord(): Promise<DNSRecord | null> {
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records?name=${this.config.recordName}&type=${this.config.recordType}`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (!data.result || data.result.length === 0) {
                return null;
            }

            return data.result[0];

        } catch (error) {
            logger.error(`[DNSFailover] Error getting DNS record:`, error instanceof Error ? error : undefined);
            return null;
        }
    }

    /**
     * Check health of current DNS target
     */
    async checkHealth(targetUrl: string): Promise<DNSCheckResult> {
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            const response = await fetch(targetUrl, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'SilexarPulse-DNSHealthCheck/1.0'
                }
            });

            clearTimeout(timeoutId);
            const latency = Date.now() - startTime;

            const record = await this.getCurrentDNSRecord();

            return {
                success: response.ok,
                currentRecord: record!,
                healthStatus: response.ok ? 'healthy' : 'unhealthy',
                latency,
                error: response.ok ? undefined : `HTTP ${response.status}`
            };

        } catch (error) {
            return {
                success: false,
                currentRecord: {
                    id: '',
                    name: this.config.recordName,
                    type: this.config.recordType,
                    content: targetUrl,
                    proxied: false,
                    ttl: 0
                },
                healthStatus: 'unhealthy',
                latency: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Connection failed'
            };
        }
    }

    /**
     * Perform DNS failover to target deployment
     */
    async failoverTo(target: string): Promise<boolean> {
        logger.info(`[DNSFailover] Initiating failover to: ${target}`);

        try {
            const record = await this.updateDNSRecord(target);

            if (!record) {
                logger.error(`[DNSFailover] Failover failed - could not update DNS`);
                return false;
            }

            logger.info(`[DNSFailover] Failover completed successfully`);
            return true;

        } catch (error) {
            logger.error(`[DNSFailover] Failover error:`, error instanceof Error ? error : undefined);
            return false;
        }
    }

    /**
     * Create a new DNS record
     */
    async createDNSRecord(content: string, proxied: boolean = true): Promise<DNSRecord | null> {
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        type: this.config.recordType,
                        name: this.config.recordName,
                        content,
                        proxied,
                        ttl: this.config.recordType === 'CNAME' ? 1 : 300
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                logger.error(`[DNSFailover] Failed to create DNS record:`, error);
                return null;
            }

            const data = await response.json();
            return data.result;

        } catch (error) {
            logger.error(`[DNSFailover] Error creating DNS record:`, error instanceof Error ? error : undefined);
            return null;
        }
    }

    /**
     * Delete a DNS record by ID
     */
    async deleteDNSRecord(recordId: string): Promise<boolean> {
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records/${recordId}`,
                {
                    method: 'DELETE',
                    headers: this.getHeaders()
                }
            );

            return response.ok;

        } catch (error) {
            logger.error(`[DNSFailover] Error deleting DNS record:`, error instanceof Error ? error : undefined);
            return false;
        }
    }

    /**
     * List all DNS records for the zone
     */
    async listDNSRecords(): Promise<DNSRecord[]> {
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.result || [];

        } catch (error) {
            logger.error(`[DNSFailover] Error listing DNS records:`, error instanceof Error ? error : undefined);
            return [];
        }
    }

    /**
     * Get Cloudflare zone information
     */
    async getZoneInfo(): Promise<{ id: string; name: string; status: string } | null> {
        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.result;

        } catch (error) {
            return null;
        }
    }

    /**
     * Verify DNS configuration
     */
    async verifyConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        // Check API token
        if (!this.config.apiToken) {
            errors.push('API token is required');
        }

        // Check zone ID
        if (!this.config.zoneId) {
            errors.push('Zone ID is required');
        }

        // Check record name
        if (!this.config.recordName) {
            errors.push('Record name is required');
        }

        // Verify zone exists
        const zone = await this.getZoneInfo();
        if (!zone) {
            errors.push(`Zone ${this.config.zoneId} not found or inaccessible`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
        };
    }
}

/**
 * Factory function to create DNS failover manager
 */
export function createDNSFailoverManager(): DNSFailoverManager {
    const config: DNSFailoverConfig = {
        provider: 'cloudflare',
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
        zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
        recordName: process.env.DNS_FAILOVER_RECORD_NAME || 'app.silexar.com',
        recordType: 'CNAME',
        healthCheckInterval: 30000,
        failureThreshold: 3,
        successThreshold: 3,
        timeout: 5000
    };

    return new DNSFailoverManager(config);
}