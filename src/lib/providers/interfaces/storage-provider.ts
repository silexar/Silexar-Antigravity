/**
 * Storage Provider Interface
 * 
 * For file storage services (Cloudflare R2, AWS S3, Google Cloud Storage)
 * 
 * Line Reference: storage-provider.ts:1
 */

import { IProvider, ProviderHealth } from './base-provider';

export interface UploadResult {
    url: string;
    key: string;
    size: number;
    etag?: string;
}

export interface IStorageProvider extends IProvider {
    /** Upload a file and return the URL */
    upload(
        key: string,
        data: Buffer,
        options?: {
            contentType?: string;
            metadata?: Record<string, string>;
        }
    ): Promise<UploadResult>;

    /** Download a file by key */
    download(key: string): Promise<Buffer>;

    /** Delete a file by key */
    delete(key: string): Promise<void>;

    /** Get a signed URL for temporary access */
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;

    /** List files with optional prefix filter */
    list(prefix?: string, limit?: number): Promise<{
        keys: string[];
        isTruncated: boolean;
        nextCursor?: string;
    }>;

    /** Get storage usage statistics */
    getUsage(): Promise<{
        used: number;
        limit?: number;
        objectCount: number;
    }>;
}
