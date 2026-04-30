/**
 * Twilio SMS Provider Implementation
 * 
 * Implements ISMSProvider using Twilio API
 * 
 * Line Reference: twilio-sms-provider.ts:1
 */

import { ISMSProvider, SMSOptions, SMSResult } from '../interfaces/sms-provider';
import { IProvider, ProviderHealth, ProviderStatus } from '../interfaces/base-provider';

export interface TwilioSMSConfig {
    accountSid: string;
    authToken: string;
    fromNumber?: string;
}

export class TwilioSMSProvider implements ISMSProvider {
    readonly id: string;
    readonly name = 'Twilio SMS';
    readonly type = 'sms';
    readonly providerClass = 'twilio';
    isPrimary: boolean;

    private config: TwilioSMSConfig | null = null;
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
            accountSid: config.accountSid as string,
            authToken: config.authToken as string,
            fromNumber: config.fromNumber as string | undefined,
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
            const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}.json`,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
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
                    message: `Twilio API returned ${response.status}`,
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

    async send(options: SMSOptions): Promise<SMSResult> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;

        const body = new URLSearchParams();
        body.append('To', options.to);
        body.append('From', this.config.fromNumber || '');
        body.append('Body', options.body);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Twilio API error: ${response.status} - ${error.message}`);
        }

        const result = await response.json();

        return {
            id: result.sid,
            to: result.to,
            status: this.mapStatus(result.status),
            timestamp: new Date(result.dateCreated),
        };
    }

    async sendBatch(options: SMSOptions[]): Promise<SMSResult[]> {
        return Promise.all(options.map(opt => this.send(opt)));
    }

    async getStatus(messageId: string): Promise<{
        status: 'queued' | 'sent' | 'delivered' | 'failed';
        deliveredAt?: Date;
    }> {
        if (!this.config) {
            throw new Error('Provider not initialized');
        }

        const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages/${messageId}.json`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }

        const result = await response.json();

        return {
            status: this.mapStatus(result.status),
            deliveredAt: result.dateUpdated ? new Date(result.dateUpdated) : undefined,
        };
    }

    private mapStatus(twilioStatus: string): 'queued' | 'sent' | 'delivered' | 'failed' {
        switch (twilioStatus) {
            case 'queued':
            case 'sending':
                return 'queued';
            case 'sent':
            case 'delivered':
                return 'delivered';
            case 'failed':
            case 'undelivered':
                return 'failed';
            default:
                return 'sent';
        }
    }
}
