/**
 * Base Provider Interface
 * 
 * All providers must implement this interface.
 * This is the foundation for the provider abstraction system.
 * 
 * Line Reference: base-provider.ts:1
 */

export enum ProviderStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DEGRADED = 'degraded',
    UNAVAILABLE = 'unavailable'
}

export interface ProviderHealth {
    status: ProviderStatus;
    latency?: number;
    errorRate?: number;
    lastCheck: Date;
    message?: string;
}

export interface IProvider {
    /** Unique identifier for this provider instance */
    readonly id: string;

    /** Human-readable name */
    readonly name: string;

    /** Provider type (e.g., 'speech', 'database', 'storage') */
    readonly type: string;

    /** Provider class (e.g., 'openai_whisper', 'supabase') */
    readonly providerClass: string;

    /** Whether this is the primary provider */
    isPrimary: boolean;

    /** Current health status */
    getHealth(): Promise<ProviderHealth>;

    /** Test connection/config */
    test(): Promise<boolean>;

    /** Initialize the provider with config */
    initialize(config: Record<string, unknown>): Promise<void>;
}
