/**
 * Provider Interfaces Index
 * 
 * Central export for all provider interfaces
 * 
 * Line Reference: interfaces/index.ts:1
 */

export * from './base-provider';
export * from './speech-provider';
export * from './database-provider';
export * from './storage-provider';
export * from './email-provider';
export * from './sms-provider';
export * from './tts-provider';

// Provider type identifiers
export const PROVIDER_TYPES = {
    SPEECH: 'speech',
    DATABASE: 'database',
    STORAGE: 'storage',
    EMAIL: 'email',
    SMS: 'sms',
    TTS: 'tts',
    CACHE: 'cache',
} as const;

export type ProviderType = typeof PROVIDER_TYPES[keyof typeof PROVIDER_TYPES];

// Provider class identifiers
export const PROVIDER_CLASSES = {
    // Speech
    OPENAI_WHISPER: 'openai_whisper',
    AZURE_SPEECH: 'azure_speech',
    DEEPGRAM: 'deepgram',

    // Database
    SUPABASE: 'supabase',
    GOOGLE_CLOUD_SQL: 'google_cloud_sql',
    AWS_RDS: 'aws_rds',
    NEON: 'neon',

    // Storage
    CLOUDFLARE_R2: 'cloudflare_r2',
    AWS_S3: 'aws_s3',
    GOOGLE_CLOUD_STORAGE: 'google_cloud_storage',
    SUPABASE_STORAGE: 'supabase_storage',

    // Email
    RESEND: 'resend',
    SENDGRID: 'sendgrid',
    AWS_SES: 'aws_ses',
    SUPABASE_EMAIL: 'supabase_email',

    // SMS
    TWILIO: 'twilio',
    VONAGE: 'vonage',
    AWS_SNS: 'aws_sns',

    // TTS
    OPENAI_TTS: 'openai_tts',
    ELEVENLABS: 'elevenlabs',
    GOOGLE_CLOUD_TTS: 'google_cloud_tts',

    // Cache
    REDIS: 'redis',
} as const;

export type ProviderClass = typeof PROVIDER_CLASSES[keyof typeof PROVIDER_CLASSES];
