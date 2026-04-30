/**
 * Frontend Failover Configuration API
 * 
 * GET /api/frontend-failover/config - Get current configuration (without secrets)
 * POST /api/frontend-failover/config - Update configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { FrontendPlatform, FrontendDeploymentConfig } from '@/lib/failover/types';
import { logAuth } from '@/lib/security/audit-logger';

// In-memory configuration (in production, this should be stored in database)
let cachedConfig: FrontendFailoverConfig | null = null;

export interface FrontendFailoverConfig {
    vercel: {
        token: string;
        teamId: string;
        projectId: string;
        url: string;
    };
    netlify: {
        accessToken: string;
        siteId: string;
        siteUrl: string;
        teamId: string;
    };
    cloudflare: {
        apiToken: string;
        accountId: string;
        zoneId: string;
        pagesProject: string;
        pagesUrl: string;
    };
    dns: {
        domain: string;
        failoverRecordName: string;
    };
    healthCheck: {
        interval: number;
        threshold: number;
        responseTimeThreshold: number;
        errorRateThreshold: number;
    };
    failover: {
        autoFailover: boolean;
        autoFailback: boolean;
        failbackDelay: number;
    };
}

// Default configuration structure
function getDefaultConfig(): FrontendFailoverConfig {
    return {
        vercel: {
            token: process.env.VERCEL_TOKEN || '',
            teamId: process.env.VERCEL_TEAM_ID || '',
            projectId: process.env.VERCEL_PROJECT_ID || '',
            url: process.env.NEXT_PUBLIC_APP_URL || ''
        },
        netlify: {
            accessToken: process.env.NETLIFY_ACCESS_TOKEN || '',
            siteId: process.env.NETLIFY_SITE_ID || '',
            siteUrl: process.env.NETLIFY_SITE_URL || '',
            teamId: process.env.NETLIFY_TEAM_ID || ''
        },
        cloudflare: {
            apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
            zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
            pagesProject: process.env.CLOUDFLARE_PAGES_PROJECT || '',
            pagesUrl: process.env.CLOUDFLARE_PAGES_URL || ''
        },
        dns: {
            domain: process.env.FAILOVER_DOMAIN || 'silexar.cl',
            failoverRecordName: process.env.DNS_FAILOVER_RECORD_NAME || 'app'
        },
        healthCheck: {
            interval: 30000,
            threshold: 3,
            responseTimeThreshold: 2000,
            errorRateThreshold: 5
        },
        failover: {
            autoFailover: true,
            autoFailback: true,
            failbackDelay: 300000
        }
    };
}

// Mask sensitive data for response
function maskConfig(config: FrontendFailoverConfig): FrontendFailoverConfig {
    return {
        vercel: {
            token: config.vercel.token ? '***' + config.vercel.token.slice(-4) : '',
            teamId: config.vercel.teamId,
            projectId: config.vercel.projectId,
            url: config.vercel.url
        },
        netlify: {
            accessToken: config.netlify.accessToken ? '***' + config.netlify.accessToken.slice(-4) : '',
            siteId: config.netlify.siteId,
            siteUrl: config.netlify.siteUrl,
            teamId: config.netlify.teamId
        },
        cloudflare: {
            apiToken: config.cloudflare.apiToken ? '***' + config.cloudflare.apiToken.slice(-4) : '',
            accountId: config.cloudflare.accountId,
            zoneId: config.cloudflare.zoneId,
            pagesProject: config.cloudflare.pagesProject,
            pagesUrl: config.cloudflare.pagesUrl
        },
        dns: {
            domain: config.dns.domain,
            failoverRecordName: config.dns.failoverRecordName
        },
        healthCheck: config.healthCheck,
        failover: config.failover
    };
}

export async function GET() {
    try {
        // Load from cache or environment
        const config = cachedConfig || getDefaultConfig();

        return NextResponse.json({
            config: maskConfig(config),
            isConfigured: !!(
                config.vercel.token ||
                config.netlify.accessToken ||
                config.cloudflare.apiToken
            ),
            deployments: [
                {
                    id: 'vercel-primary',
                    name: 'Vercel Primary',
                    platform: FrontendPlatform.VERCEL,
                    url: config.vercel.url || 'https://app.silexar.cl',
                    isConfigured: !!config.vercel.token,
                    isPrimary: true
                },
                {
                    id: 'netlify-failover-1',
                    name: 'Netlify Failover 1',
                    platform: FrontendPlatform.NETLIFY,
                    url: config.netlify.siteUrl || 'https://silexar-pulse.netlify.app',
                    isConfigured: !!config.netlify.accessToken,
                    isPrimary: false
                },
                {
                    id: 'cloudflare-failover-2',
                    name: 'Cloudflare Pages Failover 2',
                    platform: FrontendPlatform.CLOUDFLARE_PAGES,
                    url: config.cloudflare.pagesUrl || 'https://silexar-pulse.pages.dev',
                    isConfigured: !!config.cloudflare.apiToken,
                    isPrimary: false
                }
            ]
        });
    } catch (error) {
        console.error('[FrontendFailover] Error getting config:', error);
        return NextResponse.json(
            { error: 'Failed to get configuration' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, config: newConfig, deployment, userId } = body;

        if (action === 'update-config') {
            // Update the cached configuration
            if (newConfig) {
                cachedConfig = {
                    ...getDefaultConfig(),
                    ...newConfig
                };
            }

            logAuth('Frontend failover configuration updated', userId || 'system', {
                action: 'UPDATE_FAILOVER_CONFIG',
                sections: Object.keys(newConfig || {})
            });

            return NextResponse.json({
                success: true,
                message: 'Configuration updated successfully',
                config: maskConfig(cachedConfig || getDefaultConfig())
            });
        }

        if (action === 'add-deployment') {
            // Validate deployment config
            if (!deployment || !deployment.id || !deployment.platform) {
                return NextResponse.json(
                    { error: 'Invalid deployment configuration' },
                    { status: 400 }
                );
            }

            logAuth('Frontend deployment added via API', userId || 'system', {
                action: 'ADD_DEPLOYMENT',
                deploymentId: deployment.id,
                platform: deployment.platform
            });

            return NextResponse.json({
                success: true,
                message: 'Deployment added successfully',
                deployment
            });
        }

        if (action === 'test-connection') {
            const { platform, config: testConfig } = body;

            // Test connection to the specified platform
            let testResult = { success: false, message: '' };

            switch (platform) {
                case 'vercel':
                    if (testConfig?.token) {
                        try {
                            const response = await fetch('https://api.vercel.com/v1/user', {
                                headers: { 'Authorization': `Bearer ${testConfig.token}` }
                            });
                            testResult = {
                                success: response.ok,
                                message: response.ok ? 'Vercel connection successful' : 'Invalid Vercel token'
                            };
                        } catch {
                            testResult = { success: false, message: 'Failed to connect to Vercel' };
                        }
                    }
                    break;

                case 'netlify':
                    if (testConfig?.accessToken) {
                        try {
                            const response = await fetch('https://api.netlify.com/api/v1/user', {
                                headers: { 'Authorization': `Bearer ${testConfig.accessToken}` }
                            });
                            testResult = {
                                success: response.ok,
                                message: response.ok ? 'Netlify connection successful' : 'Invalid Netlify token'
                            };
                        } catch {
                            testResult = { success: false, message: 'Failed to connect to Netlify' };
                        }
                    }
                    break;

                case 'cloudflare':
                    if (testConfig?.apiToken) {
                        try {
                            const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
                                headers: { 'Authorization': `Bearer ${testConfig.apiToken}` }
                            });
                            const data = await response.json();
                            testResult = {
                                success: data.success === true,
                                message: data.success === true ? 'Cloudflare connection successful' : 'Invalid Cloudflare token'
                            };
                        } catch {
                            testResult = { success: false, message: 'Failed to connect to Cloudflare' };
                        }
                    }
                    break;
            }

            return NextResponse.json(testResult);
        }

        return NextResponse.json(
            { error: 'Unknown action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[FrontendFailover] Error updating config:', error);
        return NextResponse.json(
            { error: 'Failed to update configuration' },
            { status: 500 }
        );
    }
}
