/**
 * Provider Factory
 * 
 * Creates provider instances based on configuration stored in database.
 * This is the core of the provider abstraction system that allows
 * changing providers without modifying code.
 * 
 * Line Reference: factory.ts:1
 */

import {
    IProvider,
    ProviderHealth,
    ProviderStatus,
    ISpeechProvider,
    IDatabaseProvider,
    IStorageProvider,
    IEmailProvider,
    ISMSProvider,
    ITTSProvider,
    ProviderType,
    PROVIDER_CLASSES
} from './interfaces';

import { WhisperProvider } from './implementations/whisper-provider';
import { SupabaseDBProvider } from './implementations/supabase-provider';
import { R2StorageProvider } from './implementations/r2-provider';
import { ResendEmailProvider } from './implementations/resend-email-provider';
import { TwilioSMSProvider } from './implementations/twilio-sms-provider';
import { RedisCacheProvider, ICacheProvider } from './implementations/redis-cache-provider';

export interface ProviderConfig {
    id: string;
    providerClass: string;
    isPrimary: boolean;
    config: Record<string, unknown>;
}

type ProviderInstance =
    | ISpeechProvider
    | IDatabaseProvider
    | IStorageProvider
    | IEmailProvider
    | ISMSProvider
    | ICacheProvider
    | ITTSProvider
    | IProvider;

/**
 * ProviderFactory creates and manages provider instances.
 * Providers are created based on configuration stored in the database,
 * allowing runtime provider switching without code changes.
 */
export class ProviderFactory {
    private static instance: ProviderFactory;
    private providers: Map<string, ProviderInstance> = new Map();
    private providerConfigs: Map<string, ProviderConfig> = new Map();

    private constructor() { }

    /**
     * Get the singleton instance
     */
    static getInstance(): ProviderFactory {
        if (!ProviderFactory.instance) {
            ProviderFactory.instance = new ProviderFactory();
        }
        return ProviderFactory.instance;
    }

    /**
     * Register a provider configuration
     */
    registerProvider(config: ProviderConfig): void {
        this.providerConfigs.set(config.id, config);
        // Clear cached instance so it will be recreated with new config
        this.providers.delete(config.id);
    }

    /**
     * Get a provider instance by ID
     * Creates the instance if it doesn't exist
     */
    async getProvider<T extends ProviderInstance>(
        providerId: string
    ): Promise<T | null> {
        const config = this.providerConfigs.get(providerId);
        if (!config) {
            console.error(`Provider config not found: ${providerId}`);
            return null;
        }

        // Check if we have a cached instance
        let provider: T | null | undefined = this.providers.get(providerId) as T | undefined;

        if (!provider) {
            // Create new instance based on provider class
            provider = await this.createProvider<T>(config);
            if (provider) {
                this.providers.set(providerId, provider);
            }
        }

        return provider || null;
    }

    /**
     * Get the primary provider for a given type
     */
    async getPrimaryProvider<T extends ProviderInstance>(type: ProviderType): Promise<T | null> {
        for (const [id, config] of this.providerConfigs) {
            if (config.isPrimary && this.getProviderType(config.providerClass) === type) {
                return this.getProvider<T>(id);
            }
        }
        return null;
    }

    /**
     * Get all providers of a given type
     */
    async getProvidersByType<T extends ProviderInstance>(type: ProviderType): Promise<T[]> {
        const results: T[] = [];

        for (const [id, config] of this.providerConfigs) {
            if (this.getProviderType(config.providerClass) === type) {
                const provider = await this.getProvider<T>(id);
                if (provider) {
                    results.push(provider);
                }
            }
        }

        return results;
    }

    /**
     * Create a provider instance based on class
     */
    private async createProvider<T extends ProviderInstance>(
        config: ProviderConfig
    ): Promise<T | null> {
        const { id, providerClass, isPrimary, config: providerConfig } = config;

        switch (providerClass) {
            case PROVIDER_CLASSES.OPENAI_WHISPER: {
                const whisper = new WhisperProvider(id, isPrimary);
                await whisper.initialize(providerConfig);
                return whisper as unknown as T;
            }

            case PROVIDER_CLASSES.SUPABASE: {
                const supabase = new SupabaseDBProvider(id, isPrimary);
                await supabase.initialize(providerConfig);
                return supabase as unknown as T;
            }

            case PROVIDER_CLASSES.CLOUDFLARE_R2: {
                const r2 = new R2StorageProvider(id, isPrimary);
                await r2.initialize(providerConfig);
                return r2 as unknown as T;
            }

            case PROVIDER_CLASSES.RESEND: {
                const resend = new ResendEmailProvider(id, isPrimary);
                await resend.initialize(providerConfig);
                return resend as unknown as T;
            }

            case PROVIDER_CLASSES.TWILIO: {
                const twilio = new TwilioSMSProvider(id, isPrimary);
                await twilio.initialize(providerConfig);
                return twilio as unknown as T;
            }

            case PROVIDER_CLASSES.REDIS: {
                const redis = new RedisCacheProvider(id, isPrimary);
                await redis.initialize(providerConfig);
                return redis as unknown as T;
            }

            default:
                console.error(`Unknown provider class: ${providerClass}`);
                return null;
        }
    }

    /**
     * Get the provider type for a given class
     */
    private getProviderType(providerClass: string): ProviderType | null {
        switch (providerClass) {
            case PROVIDER_CLASSES.OPENAI_WHISPER:
            case PROVIDER_CLASSES.AZURE_SPEECH:
            case PROVIDER_CLASSES.DEEPGRAM:
                return 'speech' as ProviderType;

            case PROVIDER_CLASSES.SUPABASE:
            case PROVIDER_CLASSES.GOOGLE_CLOUD_SQL:
            case PROVIDER_CLASSES.AWS_RDS:
            case PROVIDER_CLASSES.NEON:
                return 'database' as ProviderType;

            case PROVIDER_CLASSES.CLOUDFLARE_R2:
            case PROVIDER_CLASSES.AWS_S3:
            case PROVIDER_CLASSES.GOOGLE_CLOUD_STORAGE:
            case PROVIDER_CLASSES.SUPABASE_STORAGE:
                return 'storage' as ProviderType;

            case PROVIDER_CLASSES.RESEND:
            case PROVIDER_CLASSES.SENDGRID:
            case PROVIDER_CLASSES.AWS_SES:
            case PROVIDER_CLASSES.SUPABASE_EMAIL:
                return 'email' as ProviderType;

            case PROVIDER_CLASSES.TWILIO:
            case PROVIDER_CLASSES.VONAGE:
            case PROVIDER_CLASSES.AWS_SNS:
                return 'sms' as ProviderType;

            case PROVIDER_CLASSES.OPENAI_TTS:
            case PROVIDER_CLASSES.ELEVENLABS:
            case PROVIDER_CLASSES.GOOGLE_CLOUD_TTS:
                return 'tts' as ProviderType;

            case PROVIDER_CLASSES.REDIS:
                return 'cache' as ProviderType;

            default:
                return null;
        }
    }

    /**
     * Switch primary provider for a type
     * This promotes a standby to primary
     */
    async switchPrimary(type: ProviderType, newPrimaryId: string): Promise<boolean> {
        const config = this.providerConfigs.get(newPrimaryId);
        if (!config || !config.isPrimary) {
            console.error(`Cannot switch to non-primary provider: ${newPrimaryId}`);
            return false;
        }

        // Update all providers of this type to set the new primary
        for (const [id, cfg] of this.providerConfigs) {
            if (this.getProviderType(cfg.providerClass) === type) {
                const newIsPrimary = id === newPrimaryId;
                if (cfg.isPrimary !== newIsPrimary) {
                    cfg.isPrimary = newIsPrimary;
                    // Clear cached instance to force re-initialization
                    this.providers.delete(id);
                }
            }
        }

        return true;
    }

    /**
     * Get health status for all providers
     */
    async getAllHealth(): Promise<Map<string, ProviderHealth>> {
        const healthMap = new Map<string, ProviderHealth>();

        for (const [id, provider] of this.providers) {
            const health = await provider.getHealth();
            healthMap.set(id, health);
        }

        return healthMap;
    }

    /**
     * Clear all cached instances
     */
    clearCache(): void {
        this.providers.clear();
    }
}

/**
 * Convenience function to get the provider factory
 */
export function getProviderFactory(): ProviderFactory {
    return ProviderFactory.getInstance();
}
