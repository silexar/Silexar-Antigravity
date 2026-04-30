/**
 * Cloudflare R2 Storage Provider Implementation
 * 
 * Implements IStorageProvider using Cloudflare R2
 * 
 * Line Reference: r2-provider.ts:1
 */

import { IStorageProvider, UploadResult } from '../interfaces/storage-provider';
import { IProvider, ProviderHealth, ProviderStatus } from '../interfaces/base-provider';

export interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl?: string;
}

export class R2StorageProvider implements IStorageProvider {
    readonly id: string;
    readonly name = 'Cloudflare R2';
    readonly type = 'storage';
    readonly providerClass = 'cloudflare_r2';
    isPrimary: boolean;

    private config: R2Config | null = null;
    private health: ProviderHealth = {
        status: ProviderStatus.INACTIVE,
        lastCheck: new Date()
    };

    constructor(id: string, isPrimary = false) {
        this.id = id;
        this.isPrimary = isPrimary;
    }

    async initialize(config: Record<string, unknown>): Promise<void> {
        this.config = {
            accountId: config.accountId as string,
            accessKeyId: config.accessKeyId as string,
            secretAccessKey: config.secretAccessKey as string,
            bucketName: config.bucketName as string,
            publicUrl: config.publicUrl as string | undefined,
        };

        await this.test();
    }

    async getHealth(): Promise<ProviderHealth> {
        if (!this.config) {
            return {
                status: ProviderStatus.INACTIVE,
                lastCheck: new Date(),
                message: 'Provider not initialized'
            };
        }

        try {
            const start = Date.now();
            // Test connectivity by checking if we can list buckets
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/r2/buckets`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.accessKeyId}`,
                    },
                }
            );

            const latency = Date.now() - start;

            if (response.ok) {
                this.health = {
                    status: ProviderStatus.ACTIVE,
                    latency,
                    lastCheck: new Date(),
                };
            } else {
                this.health = {
                    status: ProviderStatus.DEGRADED,
                    latency,
                    lastCheck: new Date(),
                    message: `R2 API returned ${response.status}`,
                };
            }
        } catch (error) {
            this.health = {
                status: ProviderStatus.UNAVAILABLE,
                lastCheck: new Date(),
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }

        return this.health;
    }

    async test(): Promise<boolean> {
        const health = await this.getHealth();
        return health.status === ProviderStatus.ACTIVE;
    }

    async upload(
        key: string,
        data: Buffer,
        options?: { contentType?: string; metadata?: Record<string, string> }
    ): Promise<UploadResult> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        // Using R2 S3-compatible API
        const endpoint = `https://${this.config.accountId}.r2.cloudflarestorage.com`;

        const response = await fetch(`${endpoint}/${this.config.bucketName}/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': options?.contentType || 'application/octet-stream',
                'x-amz-acl': 'private',
            },
            body: new Uint8Array(data),
        });

        if (!response.ok) {
            throw new Error(`R2 upload failed: ${response.status}`);
        }

        return {
            url: this.getPublicUrl(key),
            key,
            size: data.length,
            etag: response.headers.get('etag') || undefined,
        };
    }

    async download(key: string): Promise<Buffer> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const endpoint = `https://${this.config.accountId}.r2.cloudflarestorage.com`;

        const response = await fetch(`${endpoint}/${this.config.bucketName}/${key}`);

        if (!response.ok) {
            throw new Error(`R2 download failed: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    async delete(key: string): Promise<void> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const endpoint = `https://${this.config.accountId}.r2.cloudflarestorage.com`;

        const response = await fetch(`${endpoint}/${this.config.bucketName}/${key}`, {
            method: 'DELETE',
        });

        if (!response.ok && response.status !== 404) {
            throw new Error(`R2 delete failed: ${response.status}`);
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        // Note: R2 uses Workers for presigned URLs
        // This is a simplified implementation
        const publicUrl = this.getPublicUrl(key);
        return `${publicUrl}?expires=${Date.now() + expiresIn * 1000}`;
    }

    async list(prefix?: string, limit: number = 100): Promise<{
        keys: string[];
        isTruncated: boolean;
        nextCursor?: string;
    }> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        // R2 uses Workers for listing
        // This is a placeholder implementation
        return {
            keys: [],
            isTruncated: false,
        };
    }

    async getUsage(): Promise<{
        used: number;
        limit?: number;
        objectCount: number;
    }> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        // Would need R2 Analytics API to get actual usage
        return {
            used: 0,
            limit: undefined,
            objectCount: 0,
        };
    }

    private getPublicUrl(key: string): string {
        if (this.config?.publicUrl) {
            return `${this.config.publicUrl}/${key}`;
        }
        return `https://${this.config?.bucketName}.${this.config?.accountId}.r2.dev/${key}`;
    }
}
