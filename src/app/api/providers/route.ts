/**
 * Provider Management API Routes
 * Silexar Pulse
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProviderFactory, type ProviderConfig } from '@/lib/providers/factory';
import { PROVIDER_TYPES, type ProviderType } from '@/lib/providers/interfaces';

// GET /api/providers - List all providers and instances
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as ProviderType | null;
        const instanceId = searchParams.get('id');
        const factory = getProviderFactory();

        if (instanceId) {
            const instance = await factory.getProvider(instanceId);
            if (!instance) {
                return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
            }
            return NextResponse.json({
                id: instanceId,
                provider: instance,
            });
        }

        if (type) {
            const instances = await factory.getProvidersByType(type);
            return NextResponse.json(instances);
        }

        // Get all provider configs and health
        const health = await factory.getAllHealth();
        const configs = Array.from(health.entries()).map(([id, healthData]) => ({
            id,
            health: healthData,
        }));

        return NextResponse.json({
            providers: configs,
            totalCount: configs.length,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// POST /api/providers - Create a new provider instance (registration only, actual creation is in factory)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, config, id } = body as {
            type: ProviderType;
            config: ProviderConfig;
            id?: string;
        };

        if (!type || !config) {
            return NextResponse.json(
                { error: 'Missing required fields: type and config' },
                { status: 400 }
            );
        }

        const factory = getProviderFactory();
        // Register the provider config (actual instance is created lazily)
        factory.registerProvider({
            id: id || `${type}-${Date.now()}`,
            providerClass: config.providerClass || type,
            isPrimary: config.isPrimary || false,
            config: config.config || {},
        });

        return NextResponse.json({
            id: id || `${type}-${Date.now()}`,
            type,
            status: 'registered',
            message: 'Provider registered successfully',
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}