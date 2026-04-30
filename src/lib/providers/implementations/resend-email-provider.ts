/**
 * Resend Email Provider Implementation
 * 
 * Implements IEmailProvider using Resend API
 * 
 * Line Reference: resend-email-provider.ts:1
 */

import { IEmailProvider, EmailOptions, EmailResult, EmailAddress } from '../interfaces/email-provider';
import { IProvider, ProviderHealth, ProviderStatus } from '../interfaces/base-provider';

export interface ResendEmailConfig {
    apiKey: string;
    fromEmail?: string;
    fromName?: string;
}

export class ResendEmailProvider implements IEmailProvider {
    readonly id: string;
    readonly name = 'Resend';
    readonly type = 'email';
    readonly providerClass = 'resend';
    isPrimary: boolean;

    private config: ResendEmailConfig | null = null;
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
            fromEmail: config.fromEmail as string | undefined,
            fromName: config.fromName as string | undefined,
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
            const response = await fetch('https://api.resend.com/health', {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            });

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
                    message: `Resend API returned ${response.status}`,
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

    private formatAddress(address: EmailAddress | EmailAddress[]): string | string[] {
        if (Array.isArray(address)) {
            return address.map(addr =>
                addr.name ? `${addr.name} <${addr.email}>` : addr.email
            );
        }
        return address.name ? `${address.name} <${address.email}>` : address.email;
    }

    async send(options: EmailOptions): Promise<EmailResult> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const payload: Record<string, unknown> = {
            from: this.config.fromEmail || 'noreply@silexar.com',
            to: this.formatAddress(options.to),
            subject: options.subject,
        };

        if (options.html) {
            payload.html = options.html;
        }
        if (options.text) {
            payload.text = options.text;
        }
        if (options.cc) {
            payload.cc = this.formatAddress(options.cc);
        }
        if (options.bcc) {
            payload.bcc = this.formatAddress(options.bcc);
        }
        if (options.attachments) {
            payload.attachments = options.attachments.map(att => ({
                filename: att.filename,
                content: att.content.toString('base64'),
                type: att.contentType || 'application/octet-stream',
            }));
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Resend API error: ${response.status} - ${error}`);
        }

        const result = await response.json();

        return {
            id: result.id,
            to: Array.isArray(options.to)
                ? options.to.map(t => typeof t === 'string' ? t : t.email)
                : [typeof options.to === 'string' ? options.to : options.to.email],
            status: 'queued',
            timestamp: new Date(),
        };
    }

    async sendBatch(options: EmailOptions[]): Promise<EmailResult[]> {
        return Promise.all(options.map(opt => this.send(opt)));
    }

    async getStatus(messageId: string): Promise<{
        status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
        deliveredAt?: Date;
        openedAt?: Date;
        clickedAt?: Date;
    }> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const response = await fetch(`https://api.resend.com/emails/${messageId}`, {
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Resend API error: ${response.status}`);
        }

        const result = await response.json();

        return {
            status: result.lastEvent ? 'delivered' : 'sent',
            deliveredAt: result.lastEvent ? new Date(result.lastEvent.createdAt) : undefined,
        };
    }
}
