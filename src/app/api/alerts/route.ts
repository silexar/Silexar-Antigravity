/**
 * Alerts API Routes
 * Silexar Pulse - CEO Command Center
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPredictiveAlertEngine } from '@/lib/monitoring/predictive-alert-engine';
import { getAlertManager } from '@/lib/monitoring/alert-manager';

// GET /api/alerts - Get alerts and rules
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const predictiveEngine = getPredictiveAlertEngine();
        const alertMgr = getAlertManager();

        if (type === 'active') {
            const alerts = alertMgr.getAlerts({ acknowledged: false });
            return NextResponse.json({ active: alerts });
        }

        if (type === 'history') {
            const alerts = alertMgr.getAlerts({ limit: 50 });
            return NextResponse.json({ history: alerts });
        }

        if (type === 'stats') {
            const stats = alertMgr.getAlertStats();
            return NextResponse.json({ stats });
        }

        if (type === 'predictions') {
            const predictions = await predictiveEngine.analyzeAndPredict();
            return NextResponse.json({ predictions });
        }

        // Default: return all info
        const alerts = alertMgr.getAlerts({ limit: 50 });
        const predictions = await predictiveEngine.analyzeAndPredict();
        const stats = alertMgr.getAlertStats();

        return NextResponse.json({
            alerts,
            predictions,
            stats,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// POST /api/alerts - Check and trigger alerts
export async function POST(request: NextRequest) {
    try {
        const predictiveEngine = getPredictiveAlertEngine();
        const alertMgr = getAlertManager();

        // Run prediction analysis
        const predictions = await predictiveEngine.analyzeAndPredict();

        // Create alerts for critical/high severity predictions
        for (const prediction of predictions) {
            if (prediction.severity === 'critical' || prediction.severity === 'high') {
                await alertMgr.createAlert({
                    type: 'predictive',
                    severity: prediction.severity,
                    title: `Predicción: ${prediction.metric}`,
                    message: prediction.recommendation,
                    source: 'predictive-engine',
                    metadata: { prediction },
                });
            }
        }

        return NextResponse.json({
            triggered: predictions.filter(p => p.severity === 'critical' || p.severity === 'high').length,
            predictions,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}