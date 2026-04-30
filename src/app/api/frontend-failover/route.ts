/**
 * Frontend Failover API Routes
 * 
 * Endpoints for managing frontend deployment failover operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFrontendFailoverManager } from '@/lib/failover/FrontendFailoverManager';
import { FrontendDeploymentConfig, FrontendPlatform } from '@/lib/failover/types';
import { logAuth } from '@/lib/security/audit-logger';

// Global manager instance - uses factory with environment variables
let failoverManager: ReturnType<typeof createFrontendFailoverManager> | null = null;

function getManager() {
    if (!failoverManager) {
        failoverManager = createFrontendFailoverManager();
    }
    return failoverManager;
}

/**
 * GET /api/frontend-failover
 * Get current failover status for all deployments
 */
export async function GET(request: NextRequest) {
    try {
        const manager = getManager();
        const status = manager.getStatus();

        const { searchParams } = new URL(request.url);
        const deploymentId = searchParams.get('deploymentId');

        if (deploymentId) {
            const deployments = status.deployments.filter(d => d.id === deploymentId);
            if (deployments.length === 0) {
                return NextResponse.json(
                    { error: 'Deployment not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({
                deployment: deployments[0],
                currentState: status.currentState,
                activeDeployment: status.activeDeployment
            });
        }

        return NextResponse.json({
            status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[FrontendFailover] Error getting status:', error);
        return NextResponse.json(
            { error: 'Failed to get failover status' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/frontend-failover
 * Perform manual failover or update configuration
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, targetId, reason, userId } = body;

        const manager = getManager();

        switch (action) {
            case 'failover': {
                if (!targetId) {
                    return NextResponse.json(
                        { error: 'targetId is required for failover action' },
                        { status: 400 }
                    );
                }

                const result = await manager.triggerManualFailover(
                    targetId,
                    userId || 'system'
                );

                logAuth('Manual frontend failover triggered', userId || 'system', {
                    action: 'FRONTEND_FAILOVER',
                    targetId,
                    reason: reason || 'Manual trigger',
                    success: result.success
                });

                return NextResponse.json(result);
            }

            case 'failback': {
                const result = await manager.performFailback(
                    reason || 'Manual failback',
                    userId
                );

                logAuth('Manual frontend failback triggered', userId || 'system', {
                    action: 'FRONTEND_FAILBACK',
                    reason: reason || 'Manual trigger',
                    success: result.success
                });

                return NextResponse.json(result);
            }

            case 'add-deployment': {
                const deployment: FrontendDeploymentConfig = body.deployment;
                if (!deployment) {
                    return NextResponse.json(
                        { error: 'deployment config is required' },
                        { status: 400 }
                    );
                }

                manager.addDeployment(deployment);

                logAuth('Frontend deployment added', userId || 'system', {
                    action: 'ADD_DEPLOYMENT',
                    deploymentId: deployment.id,
                    platform: deployment.platform
                });

                return NextResponse.json({ success: true, deployment });
            }

            case 'remove-deployment': {
                const { deploymentId } = body;
                if (!deploymentId) {
                    return NextResponse.json(
                        { error: 'deploymentId is required' },
                        { status: 400 }
                    );
                }

                manager.removeDeployment(deploymentId);

                logAuth('Frontend deployment removed', userId || 'system', {
                    action: 'REMOVE_DEPLOYMENT',
                    deploymentId
                });

                return NextResponse.json({ success: true });
            }

            case 'enable-deployment': {
                const { deploymentId, enabled } = body;
                if (!deploymentId || enabled === undefined) {
                    return NextResponse.json(
                        { error: 'deploymentId and enabled are required' },
                        { status: 400 }
                    );
                }

                manager.setDeploymentEnabled(deploymentId, enabled);

                logAuth('Frontend deployment toggled', userId || 'system', {
                    action: 'TOGGLE_DEPLOYMENT',
                    deploymentId,
                    enabled
                });

                return NextResponse.json({ success: true });
            }

            case 'start-monitoring': {
                manager.startHealthMonitoring();
                return NextResponse.json({ success: true, message: 'Health monitoring started' });
            }

            case 'stop-monitoring': {
                manager.stopHealthMonitoring();
                return NextResponse.json({ success: true, message: 'Health monitoring stopped' });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('[FrontendFailover] Error processing request:', error);
        return NextResponse.json(
            { error: 'Failed to process failover request' },
            { status: 500 }
        );
    }
}
