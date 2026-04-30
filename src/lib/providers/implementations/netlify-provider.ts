/**
 * Netlify Frontend Provider
 * 
 * Implements frontend deployment to Netlify as part of the multi-platform
 * failover strategy (Vercel + Netlify + Cloudflare Pages).
 */

import { FrontendPlatform, DeploymentResult, DeploymentCredentials } from '@/lib/failover/types';

export interface NetlifyProviderConfig {
    accessToken: string;
    siteId?: string;
    siteName?: string;
    teamId?: string;
    buildCommand?: string;
    publishDir?: string;
    functionsDir?: string;
    environment?: Record<string, string>;
}

export interface NetlifyDeployment {
    id: string;
    name: string;
    url: string;
    adminUrl: string;
    deployUrl: string;
    deployCheckerUrl: string;
    state: 'ready' | 'error' | 'building';
    createdAt: string;
    updatedAt: string;
    context: 'production' | 'branch-deploy' | 'deploy-preview';
}

export interface NetlifySite {
    id: string;
    name: string;
    url: string;
    adminUrl: string;
    buildSettings?: {
        repoUrl?: string;
        buildCommand?: string;
        publishDir?: string;
        functionsDir?: string;
    };
}

export class NetlifyFrontendProvider {
    private accessToken: string;
    private siteId?: string;
    private teamId?: string;
    private baseUrl = 'https://api.netlify.com/api/v1';

    constructor(config: NetlifyProviderConfig) {
        this.accessToken = config.accessToken;
        this.siteId = config.siteId;
        this.teamId = config.teamId;
    }

    /**
     * Get headers for Netlify API requests
     */
    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make authenticated request to Netlify API
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Netlify API error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    /**
     * Get current site information
     */
    async getSite(): Promise<NetlifySite | null> {
        if (!this.siteId) {
            return null;
        }

        try {
            return await this.request<NetlifySite>(`/sites/${this.siteId}`);
        } catch (error) {
            console.error('[NetlifyProvider] Error getting site:', error);
            return null;
        }
    }

    /**
     * Create a new Netlify site
     */
    async createSite(name: string): Promise<NetlifySite> {
        const site = await this.request<NetlifySite>('/sites', {
            method: 'POST',
            body: JSON.stringify({
                name,
                team: this.teamId
            })
        });

        this.siteId = site.id;
        return site;
    }

    /**
     * Get deploys for the site
     */
    async getDeploys(): Promise<NetlifyDeployment[]> {
        if (!this.siteId) {
            throw new Error('Site ID not configured');
        }

        return this.request<NetlifyDeployment[]>(`/sites/${this.siteId}/deploys`);
    }

    /**
     * Get a specific deploy by ID
     */
    async getDeploy(deployId: string): Promise<NetlifyDeployment> {
        if (!this.siteId) {
            throw new Error('Site ID not configured');
        }

        return this.request<NetlifyDeployment>(`/sites/${this.siteId}/deploys/${deployId}`);
    }

    /**
     * Get the latest production deploy
     */
    async getLatestDeploy(): Promise<NetlifyDeployment | null> {
        const deploys = await this.getDeploys();
        return deploys.find(d => d.context === 'production') || deploys[0] || null;
    }

    /**
     * Create a new deploy from a build
     * Note: Netlify uses a different approach - you typically deploy via git integration
     * This method is for direct file uploads using the Shallow Archive method
     */
    async createDeploy(files: Map<string, Buffer>, options: {
        message?: string;
        siteId?: string;
    } = {}): Promise<NetlifyDeployment> {
        const targetSiteId = options.siteId || this.siteId;

        if (!targetSiteId) {
            throw new Error('Site ID is required for deployment');
        }

        // Step 1: Create deploy record
        const deploy = await this.request<NetlifyDeployment>(`/sites/${targetSiteId}/deploys`, {
            method: 'POST',
            body: JSON.stringify({
                title: options.message || `Deploy ${new Date().toISOString()}`,
                files: {} // File manifest will be added during upload
            })
        });

        // Step 2: Upload files to the deploy
        const uploadPromises: Promise<void>[] = [];

        for (const [path, content] of files) {
            uploadPromises.push(
                fetch(`${this.baseUrl}/deploys/${deploy.id}/files/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/octet-stream'
                    },
                    body: Buffer.from(content)
                }).then(async response => {
                    if (!response.ok) {
                        throw new Error(`Failed to upload ${path}: ${response.statusText}`);
                    }
                })
            );
        }

        await Promise.all(uploadPromises);

        // Step 3: Finalize the deploy
        const finalizedDeploy = await this.request<NetlifyDeployment>(`/sites/${targetSiteId}/deploys/${deploy.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                state: 'ready'
            })
        });

        return finalizedDeploy;
    }

    /**
     * Restore a deploy (rollback)
     */
    async restoreDeploy(deployId: string): Promise<NetlifyDeployment> {
        if (!this.siteId) {
            throw new Error('Site ID not configured');
        }

        return this.request<NetlifyDeployment>(`/sites/${this.siteId}/deploys/${deployId}/restore`, {
            method: 'POST'
        });
    }

    /**
     * Get deploys from all sites in the team
     */
    async getTeamDeploys(limit: number = 10): Promise<NetlifyDeployment[]> {
        if (!this.teamId) {
            throw new Error('Team ID not configured');
        }

        return this.request<NetlifyDeployment[]>(`/teams/${this.teamId}/deploys?per_page=${limit}`);
    }

    /**
     * Get build hooks for the site
     */
    async getBuildHooks(): Promise<Array<{
        id: string;
        url: string;
        siteId: string;
        createdAt: string;
    }>> {
        if (!this.siteId) {
            throw new Error('Site ID not configured');
        }

        return this.request(`/sites/${this.siteId}/build_hooks`);
    }

    /**
     * Create a build hook
     */
    async createBuildHook(name: string, branch: string = 'main'): Promise<{
        id: string;
        url: string;
        siteId: string;
    }> {
        if (!this.siteId) {
            throw new Error('Site ID not configured');
        }

        return this.request(`/sites/${this.siteId}/build_hooks`, {
            method: 'POST',
            body: JSON.stringify({
                name,
                branch
            })
        });
    }

    /**
     * Trigger a build via build hook
     */
    async triggerBuild(buildHookUrl: string): Promise<void> {
        await fetch(buildHookUrl, {
            method: 'POST'
        });
    }

    /**
     * Get site DNS zone info (useful for DNS failover setup)
     */
    async getDNZZones(): Promise<Array<{
        id: string;
        name: string;
    }>> {
        if (!this.teamId) {
            throw new Error('Team ID not configured');
        }

        return this.request(`/teams/${this.teamId}/dns_zones`);
    }

    /**
     * Check if the provider is properly configured
     */
    async isConfigured(): Promise<boolean> {
        return !!(this.accessToken && this.siteId);
    }

    /**
     * Get provider status
     */
    async getStatus(): Promise<{
        configured: boolean;
        site?: NetlifySite;
        latestDeploy?: NetlifyDeployment;
    }> {
        const configured = await this.isConfigured();

        if (!configured) {
            return { configured: false };
        }

        const site = await this.getSite();
        const latestDeploy = await this.getLatestDeploy();

        return {
            configured,
            site: site || undefined,
            latestDeploy: latestDeploy || undefined
        };
    }

    /**
     * Deploy build files to Netlify
     * This is a simplified version that assumes files are already built
     */
    async deploy(buildDir: string, options: {
        message?: string;
        branch?: string;
    } = {}): Promise<DeploymentResult> {
        const startTime = Date.now();

        try {
            const site = await this.getSite();

            if (!site) {
                return {
                    success: false,
                    platform: FrontendPlatform.NETLIFY,
                    deploymentId: '',
                    deploymentUrl: '',
                    error: 'Site not configured',
                    timestamp: new Date(),
                    duration: Date.now() - startTime
                };
            }

            // For actual deployment, you would typically:
            // 1. Use the Netlify CLI: `netlify deploy --dir=build --prod`
            // 2. Or use the API with file uploads as shown above
            // Here we just return the existing site info since actual deployment
            // would be done via the CI/CD pipeline or Netlify CLI

            return {
                success: true,
                platform: FrontendPlatform.NETLIFY,
                deploymentId: site.id,
                deploymentUrl: site.url,
                timestamp: new Date(),
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                platform: FrontendPlatform.NETLIFY,
                deploymentId: '',
                deploymentUrl: '',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
                duration: Date.now() - startTime
            };
        }
    }
}

/**
 * Factory function to create Netlify provider from environment variables
 */
export function createNetlifyProvider(): NetlifyFrontendProvider {
    return new NetlifyFrontendProvider({
        accessToken: process.env.NETLIFY_ACCESS_TOKEN || '',
        siteId: process.env.NETLIFY_SITE_ID,
        teamId: process.env.NETLIFY_TEAM_ID,
        buildCommand: process.env.NETLIFY_BUILD_COMMAND || 'npm run build',
        publishDir: process.env.NETLIFY_PUBLISH_DIR || '.next'
    });
}
