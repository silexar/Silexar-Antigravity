/**
 * Cloudflare Pages Frontend Provider
 * 
 * Implements frontend deployment to Cloudflare Pages as part of the multi-platform
 * failover strategy (Vercel + Netlify + Cloudflare Pages).
 */

import { FrontendPlatform, DeploymentResult } from '@/lib/failover/types';

export interface CloudflarePagesConfig {
    apiToken: string;
    accountId: string;
    projectName?: string;
    projectId?: string;
    branch?: string;
    buildCommand?: string;
    outputDirectory?: string;
    rootDir?: string;
    github?: {
        repo: string;
        productionBranch: string;
    };
}

export interface CloudflarePagesProject {
    id: string;
    name: string;
    subdomain: string;
    domains: string[];
    build_config: {
        build_command: string;
        destination_dir: string;
        root_file: string;
    };
    deployment_configs: {
        production: {
            branch: string;
            environment_variables: Record<string, string>;
        };
        preview: {
            branch: string;
            environment_variables: Record<string, string>;
        };
    };
}

export interface CloudflarePagesDeployment {
    id: string;
    short_id: string;
    project_id: string;
    project_name: string;
    commit_hash: string;
    commit_message: string;
    branch: string;
    created_on: string;
    modified_on: string;
    stage: 'queued' | 'building' | 'success' | 'failed';
    url: string;
    urls: string[];
    alias: string[];
}

export class CloudflarePagesProvider {
    private apiToken: string;
    private accountId: string;
    private projectName?: string;
    private projectId?: string;
    private baseUrl = 'https://api.cloudflare.com/client/v4';

    constructor(config: CloudflarePagesConfig) {
        this.apiToken = config.apiToken;
        this.accountId = config.accountId;
        this.projectName = config.projectName;
        this.projectId = config.projectId;
    }

    /**
     * Get headers for Cloudflare API requests
     */
    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make authenticated request to Cloudflare API
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
            throw new Error(`Cloudflare API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.result;
    }

    /**
     * List all Cloudflare Pages projects
     */
    async listProjects(): Promise<CloudflarePagesProject[]> {
        return this.request<CloudflarePagesProject[]>(
            `/accounts/${this.accountId}/pages/projects`
        );
    }

    /**
     * Get a specific project by name
     */
    async getProject(name: string): Promise<CloudflarePagesProject | null> {
        try {
            return await this.request<CloudflarePagesProject>(
                `/accounts/${this.accountId}/pages/projects/${name}`
            );
        } catch {
            return null;
        }
    }

    /**
     * Create a new Cloudflare Pages project
     */
    async createProject(config: {
        name: string;
        buildCommand?: string;
        outputDirectory?: string;
        rootDir?: string;
        branch?: string;
    }): Promise<CloudflarePagesProject> {
        return this.request<CloudflarePagesProject>(
            `/accounts/${this.accountId}/pages/projects`,
            {
                method: 'POST',
                body: JSON.stringify({
                    name: config.name,
                    build_config: {
                        build_command: config.buildCommand || 'npm run build',
                        destination_dir: config.outputDirectory || 'out',
                        root_file: config.rootDir || ''
                    },
                    deployment_configs: {
                        production: {
                            branch: config.branch || 'main'
                        },
                        preview: {
                            branch: 'preview'
                        }
                    }
                })
            }
        );
    }

    /**
     * Update a Cloudflare Pages project
     */
    async updateProject(name: string, updates: Partial<{
        buildCommand: string;
        outputDirectory: string;
        rootDir: string;
    }>): Promise<CloudflarePagesProject> {
        const project = await this.getProject(name);

        if (!project) {
            throw new Error(`Project ${name} not found`);
        }

        return this.request<CloudflarePagesProject>(
            `/accounts/${this.accountId}/pages/projects/${name}`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    build_config: {
                        build_command: updates.buildCommand || project.build_config.build_command,
                        destination_dir: updates.outputDirectory || project.build_config.destination_dir,
                        root_file: updates.rootDir || project.build_config.root_file
                    }
                })
            }
        );
    }

    /**
     * Get deployments for a project
     */
    async getDeployments(projectName?: string): Promise<CloudflarePagesDeployment[]> {
        const name = projectName || this.projectName;

        if (!name) {
            throw new Error('Project name is required');
        }

        return this.request<CloudflarePagesDeployment[]>(
            `/accounts/${this.accountId}/pages/projects/${name}/deployments`
        );
    }

    /**
     * Get a specific deployment
     */
    async getDeployment(deploymentId: string, projectName?: string): Promise<CloudflarePagesDeployment> {
        const name = projectName || this.projectName;

        if (!name) {
            throw new Error('Project name is required');
        }

        return this.request<CloudflarePagesDeployment>(
            `/accounts/${this.accountId}/pages/projects/${name}/deployments/${deploymentId}`
        );
    }

    /**
     * Get the latest deployment
     */
    async getLatestDeployment(projectName?: string): Promise<CloudflarePagesDeployment | null> {
        const deployments = await this.getDeployments(projectName);
        return deployments[0] || null;
    }

    /**
     * Create a new deployment via direct upload
     */
    async createDeployment(files: Map<string, Buffer>, options: {
        projectName?: string;
        branch?: string;
        message?: string;
    } = {}): Promise<CloudflarePagesDeployment> {
        const name = options.projectName || this.projectName;

        if (!name) {
            throw new Error('Project name is required');
        }

        // Step 1: Create deployment record
        const deployment = await this.request<CloudflarePagesDeployment>(
            `/accounts/${this.accountId}/pages/projects/${name}/deployments`,
            {
                method: 'POST',
                body: JSON.stringify({
                    branch: options.branch || 'main',
                    message: options.message || `Deploy ${new Date().toISOString()}`
                })
            }
        );

        // Step 2: Upload files
        const manifest = new Map<string, string>();

        for (const [path, content] of files) {
            const hash = Buffer.from(content).toString('base64').slice(0, 32);
            manifest.set(path, hash);
        }

        // Upload each file
        const uploadPromises: Promise<void>[] = [];

        for (const [path, content] of files) {
            uploadPromises.push(
                fetch(`${this.baseUrl}/accounts/${this.accountId}/pages/assets/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/octet-stream',
                        'X-Content-Hash': Buffer.from(content).toString('base64'),
                        'X-File-Path': path
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

        // Step 3: Mark deployment as ready
        return this.request<CloudflarePagesDeployment>(
            `/accounts/${this.accountId}/pages/projects/${name}/deployments/${deployment.id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    state: 'ready'
                })
            }
        );
    }

    /**
     * Trigger a new build via Cloudflare Pages API
     */
    async triggerBuild(projectName?: string, branch?: string): Promise<CloudflarePagesDeployment> {
        const name = projectName || this.projectName;

        if (!name) {
            throw new Error('Project name is required');
        }

        return this.request<CloudflarePagesDeployment>(
            `/accounts/${this.accountId}/pages/projects/${name}/deployments`,
            {
                method: 'POST',
                body: JSON.stringify({
                    branch: branch || 'main'
                })
            }
        );
    }

    /**
     * Get Cloudflare Pages analytics
     */
    async getAnalytics(since: string = '2024-01-01'): Promise<{
        timestamp: string;
        requests: { all: number; css: number; html: number; image: number; js: number; other: number };
        bandwidth: { all: number; css: number; html: number; image: number; js: number; other: number };
    }> {
        return this.request(
            `/accounts/${this.accountId}/pages/projects/${this.projectName}/analytics?since=${since}`
        );
    }

    /**
     * Delete a deployment
     */
    async deleteDeployment(deploymentId: string, projectName?: string): Promise<void> {
        const name = projectName || this.projectName;

        if (!name) {
            throw new Error('Project name is required');
        }

        await this.request(
            `/accounts/${this.accountId}/pages/projects/${name}/deployments/${deploymentId}`,
            { method: 'DELETE' }
        );
    }

    /**
     * Check if the provider is properly configured
     */
    async isConfigured(): Promise<boolean> {
        return !!(this.apiToken && this.accountId && this.projectName);
    }

    /**
     * Get provider status
     */
    async getStatus(): Promise<{
        configured: boolean;
        project?: CloudflarePagesProject;
        latestDeployment?: CloudflarePagesDeployment;
    }> {
        const configured = await this.isConfigured();

        if (!configured) {
            return { configured: false };
        }

        const project = this.projectName ? await this.getProject(this.projectName) : null;
        const latestDeployment = await this.getLatestDeployment();

        return {
            configured,
            project: project || undefined,
            latestDeployment: latestDeployment || undefined
        };
    }

    /**
     * Deploy build files to Cloudflare Pages
     */
    async deploy(buildDir: string, options: {
        message?: string;
        branch?: string;
    } = {}): Promise<DeploymentResult> {
        const startTime = Date.now();

        try {
            if (!this.projectName) {
                return {
                    success: false,
                    platform: FrontendPlatform.CLOUDFLARE_PAGES,
                    deploymentId: '',
                    deploymentUrl: '',
                    error: 'Project name not configured',
                    timestamp: new Date(),
                    duration: Date.now() - startTime
                };
            }

            // Trigger a build - actual deployment happens via Cloudflare Pages build system
            // For direct file upload, you would use createDeployment with the built files
            const deployment = await this.triggerBuild(this.projectName, options.branch);

            return {
                success: true,
                platform: FrontendPlatform.CLOUDFLARE_PAGES,
                deploymentId: deployment.id,
                deploymentUrl: deployment.url,
                commitSha: deployment.commit_hash,
                branch: deployment.branch,
                timestamp: new Date(),
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                platform: FrontendPlatform.CLOUDFLARE_PAGES,
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
 * Factory function to create Cloudflare Pages provider from environment variables
 */
export function createCloudflarePagesProvider(): CloudflarePagesProvider {
    return new CloudflarePagesProvider({
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        projectName: process.env.CLOUDFLARE_PAGES_PROJECT || 'silexar-pulse',
        buildCommand: process.env.CLOUDFLARE_PAGES_BUILD_COMMAND || 'npm run build',
        outputDirectory: process.env.CLOUDFLARE_PAGES_OUTPUT_DIR || '.next'
    });
}
