/**
 * SMS Provider Interface
 * 
 * For SMS services (Twilio, Vonage, AWS SNS)
 * 
 * Line Reference: sms-provider.ts:1
 */

import { IProvider, ProviderHealth } from './base-provider';

export interface SMSOptions {
    to: string;
    from?: string;
    body: string;
}

export interface SMSResult {
    id: string;
    to: string;
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    timestamp: Date;
}

export interface ISMSProvider extends IProvider {
    /** Send an SMS */
    send(options: SMSOptions): Promise<SMSResult>;

    /** Send a batch of SMS */
    sendBatch(options: SMSOptions[]): Promise<SMSResult[]>;

    /** Get SMS delivery status */
    getStatus(messageId: string): Promise<{
        status: 'queued' | 'sent' | 'delivered' | 'failed';
        deliveredAt?: Date;
    }>;
}
