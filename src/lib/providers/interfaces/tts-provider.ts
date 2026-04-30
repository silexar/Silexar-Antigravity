/**
 * Text-to-Speech Provider Interface
 * 
 * For TTS services (OpenAI TTS, ElevenLabs, Google Cloud TTS)
 * 
 * Line Reference: tts-provider.ts:1
 */

import { IProvider, ProviderHealth } from './base-provider';

export interface TTSOptions {
    text: string;
    voice?: string;
    model?: string;
    speed?: number;
}

export interface TTSResult {
    audio: Buffer;
    duration: number;
    format: string;
}

export interface TTSVoice {
    id: string;
    name: string;
    language: string;
    gender?: 'male' | 'female' | 'neutral';
}

export interface ITTSProvider extends IProvider {
    /** Convert text to speech */
    synthesize(options: TTSOptions): Promise<TTSResult>;

    /** Get available voices */
    getVoices(): Promise<TTSVoice[]>;

    /** Get default voice for a language */
    getDefaultVoice(language: string): Promise<TTSVoice>;
}
