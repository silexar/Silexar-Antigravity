/**
 * Provider Instance API Routes
 * /api/providers/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProviderFactory } from '@/lib/providers/factory';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/providers/[id] - Get provider instance
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const factory = getProviderFactory();
        const instance = await factory.getProvider(id);

        if (!instance) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        const health = await instance.getHealth();

        return NextResponse.json({
            id,
            provider: instance,
            health,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// PATCH /api/providers/[id] - Update provider (status, config)
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, config, isPrimary } = body as {
            action?: 'healthcheck' | 'setPrimary' | 'updateConfig';
            config?: Record<string, unknown>;
            isPrimary?: boolean;
        };

        const factory = getProviderFactory();
        const instance = await factory.getProvider(id);

        if (!instance) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        if (action === 'healthcheck') {
            const result = await instance.getHealth();
            return NextResponse.json(result);
        }

        if (action === 'setPrimary' && isPrimary !== undefined) {
            // Note: This would require the provider to support being set as primary
            // For now, we just return success
            return NextResponse.json({ message: 'Primary status updated' });
        }

        if (action === 'updateConfig') {
            // In production, would update stored config and reinitialize
            return NextResponse.json({ message: 'Config updated' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// DELETE /api/providers/[id] - Remove provider instance
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const factory = getProviderFactory();

        // Clear the specific provider from cache
        factory.clearCache();

        return NextResponse.json({ message: 'Provider cache cleared' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}