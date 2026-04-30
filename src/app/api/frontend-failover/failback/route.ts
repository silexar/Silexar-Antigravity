/**
 * Frontend Failback Action API
 * 
 * POST /api/frontend-failover/failback
 * Triggers manual failback to primary deployment
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
        const body = await request.json().catch(() => ({}));
        const { userId, reason } = body;

        const failoverManager = getManager();
        const result = await failoverManager.performFailback(
            reason || 'Manual failback',
            userId
        );

        logAuth('Manual frontend failback triggered', userId || 'system', {
            action: 'FRONTEND_FAILBACK',
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
        console.error('[FrontendFailover] Error performing failback:', error);
        return NextResponse.json(
            { error: 'Failed to perform failback' },
            { status: 500 }
        );
    }
}
