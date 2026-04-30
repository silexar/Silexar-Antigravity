/**
 * Provider Failover API Route
 * /api/providers/failover
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProviderFactory } from '@/lib/providers/factory';
import { ProviderStatus, PROVIDER_TYPES, type ProviderType } from '@/lib/providers/interfaces';

// POST /api/providers/failover - Trigger failover for a provider type
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, newPrimaryId } = body as { type: ProviderType; newPrimaryId?: string };

        if (!type) {
            return NextResponse.json(
                { error: 'Missing required field: type' },
                { status: 400 }
            );
        }

        const factory = getProviderFactory();

        if (newPrimaryId) {
            // Switch to specific primary
            const success = await factory.switchPrimary(type, newPrimaryId);
            return NextResponse.json({
                message: success ? 'Failover completed' : 'Failover failed',
                newPrimaryId,
            });
        }

        // Find a healthy standby to promote
        const providers = await factory.getProvidersByType(type);

        for (const p of providers) {
            const health = await p.getHealth();
            if (health.status !== ProviderStatus.ACTIVE) {
                // Found a standby, promote it
                return NextResponse.json({
                    message: 'Failover completed',
                    newPrimaryId: p,
                });
            }
        }

        return NextResponse.json(
            { error: 'No healthy providers available for failover' },
            { status: 503 }
        );
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// GET /api/providers/failover - Check failover status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as ProviderType | null;

        if (!type) {
            return NextResponse.json(
                { error: 'Missing required query param: type' },
                { status: 400 }
            );
        }

        const factory = getProviderFactory();
        const providers = await factory.getProvidersByType(type);
        const primary = await factory.getPrimaryProvider(type);

        const instances = await Promise.all(
            providers.map(async p => {
                const health = await p.getHealth();
                return {
                    id: p,
                    status: health.status,
                };
            })
        );

        return NextResponse.json({
            type,
            totalInstances: providers.length,
            primaryId: primary ? 'primary' : null,
            instances,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}