/**
 * OpenAI Whisper Speech Provider Implementation
 * 
 * Implements ISpeechProvider using OpenAI's Whisper API
 * 
 * Line Reference: whisper-provider.ts:1
 */

import { ISpeechProvider, TranscriptionResult } from '../interfaces/speech-provider';
import { IProvider, ProviderHealth, ProviderStatus } from '../interfaces/base-provider';

export interface WhisperConfig {
    apiKey: string;
    endpoint?: string;
    model?: string;
    timeout?: number;
}

export class WhisperProvider implements ISpeechProvider {
    readonly id: string;
    readonly name = 'OpenAI Whisper';
    readonly type = 'speech';
    readonly providerClass = 'openai_whisper';
    isPrimary: boolean;

    private config: WhisperConfig | null = null;
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
            apiKey: config.apiKey as string,
            endpoint: config.endpoint as string | undefined,
            model: (config.model as string) || 'whisper-1',
            timeout: (config.timeout as number) || 60000,
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
            const response = await fetch(
                (this.config.endpoint || 'https://api.openai.com') + '/v1/models',
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
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
                    message: `API returned ${response.status}`,
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

    async transcribe(
        audioBuffer: Buffer,
        options?: { language?: string; prompt?: string }
    ): Promise<TranscriptionResult> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const formData = new FormData();
        formData.append(
            'file',
            new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' }),
            'audio.wav'
        );
        formData.append('model', this.config.model || 'whisper-1');

        if (options?.language) {
            formData.append('language', options.language);
        }
        if (options?.prompt) {
            formData.append('prompt', options.prompt);
        }

        const response = await fetch(
            (this.config.endpoint || 'https://api.openai.com') + '/v1/audio/transcriptions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Whisper API error: ${response.status} - ${error}`);
        }

        const result = await response.json();

        return {
            text: result.text,
            language: result.language,
            duration: result.duration,
            segments: result.segments?.map((seg: { start: number; end: number; text: string }) => ({
                start: seg.start,
                end: seg.end,
                text: seg.text,
            })),
        };
    }

    getSupportedLanguages(): string[] {
        // Whisper supports many languages, this is a subset
        return [
            'es', 'en', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar',
            'ru', 'hi', 'nl', 'pl', 'sv', 'tr', 'th', 'vi', 'id', 'ms',
        ];
    }

    getMaxDuration(): number {
        return 1800; // 30 minutes
    }
}
