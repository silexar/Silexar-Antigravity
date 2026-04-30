/**
 * Email Provider Interface
 * 
 * For email services (Resend, SendGrid, AWS SES, Supabase Email)
 * 
 * Line Reference: email-provider.ts:1
 */

import { IProvider, ProviderHealth } from './base-provider';

export interface EmailAddress {
    email: string;
    name?: string;
}

export interface EmailOptions {
    to: EmailAddress | EmailAddress[];
    cc?: EmailAddress | EmailAddress[];
    bcc?: EmailAddress | EmailAddress[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }[];
}

export interface EmailResult {
    id: string;
    to: string[];
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    timestamp: Date;
}

export interface IEmailProvider extends IProvider {
    /** Send an email */
    send(options: EmailOptions): Promise<EmailResult>;

    /** Send a batch of emails */
    sendBatch(options: EmailOptions[]): Promise<EmailResult[]>;

    /** Get email delivery status */
    getStatus(messageId: string): Promise<{
        status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
        deliveredAt?: Date;
        openedAt?: Date;
        clickedAt?: Date;
    }>;
}
