/**
 * Speech Provider Interface
 * 
 * For audio transcription services (Whisper, Azure Speech, Deepgram)
 * 
 * Line Reference: speech-provider.ts:1
 */

import { IProvider, ProviderHealth } from './base-provider';

export interface TranscriptionResult {
    text: string;
    language?: string;
    duration?: number;
    confidence?: number;
    segments?: {
        start: number;
        end: number;
        text: string;
    }[];
}

export interface ISpeechProvider extends IProvider {
    /** Transcribe audio file to text */
    transcribe(
        audioBuffer: Buffer,
        options?: {
            language?: string;
            prompt?: string;
        }
    ): Promise<TranscriptionResult>;

    /** Get list of supported languages */
    getSupportedLanguages(): string[];

    /** Get maximum audio duration in seconds */
    getMaxDuration(): number;
}
