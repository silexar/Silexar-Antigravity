/**
 * Frontend Failover Status API
 * 
 * GET /api/frontend-failover/status
 * Returns current failover status for all deployments
 */

import { NextResponse } from 'next/server';
import { createFrontendFailoverManager } from '@/lib/failover/FrontendFailoverManager';

let manager: ReturnType<typeof createFrontendFailoverManager> | null = null;

function getManager() {
    if (!manager) {
        manager = createFrontendFailoverManager();
    }
    return manager;
}

export async function GET() {
    try {
        const failoverManager = getManager();
        const status = failoverManager.getStatus();

        return NextResponse.json({
            currentState: status.currentState,
            primaryDeployment: status.primaryDeployment,
            activeDeployment: status.activeDeployment,
            deployments: status.deployments.map(d => ({
                id: d.id,
                name: d.name,
                platform: d.platform,
                url: d.url,
                isPrimary: d.isPrimary,
                isActive: d.id === status.activeDeployment,
                enabled: d.enabled,
                priority: d.priority,
                status: 'unknown', // Would need health data
                lastCheck: null,
                responseTime: null,
                consecutiveFailures: 0
            })),
            lastFailover: status.lastFailover,
            recentEvents: status.recentEvents,
            metrics: status.metrics,
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
