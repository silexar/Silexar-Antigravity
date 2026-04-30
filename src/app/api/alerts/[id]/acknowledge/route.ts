/**
 * Alerts Acknowledgement API Route
 * /api/alerts/[id]/acknowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAlertManager } from '@/lib/monitoring/alert-manager';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/alerts/[id]/acknowledge - Acknowledge an alert
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const userId = body.userId || 'system';

        const alertMgr = getAlertManager();
        const success = await alertMgr.acknowledgeAlert(id, userId);

        return NextResponse.json({
            success,
            alertId: id,
            acknowledgedBy: userId,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}