/**
 * Frontend Failover Action API
 * 
 * POST /api/frontend-failover/failover
 * Triggers manual failover to a specific deployment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFrontendFailoverManager } from '@/lib/failover/FrontendFailoverManager';
import { logAuth } from '@/lib/security/audit-logger';

let manager: ReturnType<typeof createFrontendFailoverManager> | null = null;

function getManager() {
    if (!manager) {
        manager = createFrontendFailoverManager();
    }
    return manager;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetId, userId, reason } = body;

        if (!targetId) {
            return NextResponse.json(
                { error: 'targetId is required' },
                { status: 400 }
            );
        }

        const failoverManager = getManager();
        const result = await failoverManager.triggerManualFailover(
            targetId,
            userId || 'system'
        );

        logAuth('Manual frontend failover triggered', userId || 'system', {
            action: 'FRONTEND_FAILOVER',
            targetId,
            reason: reason || 'Manual trigger',
            success: result.success
        });

        return NextResponse.json({
            success: result.success,
            fromDeployment: result.fromDeployment,
            toDeployment: result.toDeployment,
            failoverTime: result.failoverTime,
            totalTime: result.totalTime,
            error: result.error
        });
    } catch (error) {
        console.error('[FrontendFailover] Error performing failover:', error);
        return NextResponse.json(
            { error: 'Failed to perform failover' },
            { status: 500 }
        );
    }
}
