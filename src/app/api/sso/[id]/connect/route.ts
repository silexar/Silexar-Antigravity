/**
 * SSO Sync and Operations Route - Enterprise SSO Synchronization
 * CATEGORY: CRITICAL - DDD + CQRS
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { createDirectoryService } from '@/modules/configuracion/infrastructure/DirectoryServices';
import { SSOConfiguration, SSOConfigurationProps } from '@/modules/configuracion/domain/entities/SSOConfiguration';

// Shared mock storage (in production, use database)
const mockSSOConfigs = new Map<string, SSOConfigurationProps>();

export function getMockConfig(id: string): SSOConfigurationProps | undefined {
    return mockSSOConfigs.get(id);
}

export function updateMockConfig(id: string, updates: Partial<SSOConfigurationProps>): SSOConfigurationProps | undefined {
    const existing = mockSSOConfigs.get(id);
    if (!existing) return undefined;

    const updated: SSOConfigurationProps = {
        ...existing,
        ...updates,
        version: existing.version + 1,
        actualizadoAt: new Date().toISOString(),
    } as SSOConfigurationProps;
    mockSSOConfigs.set(id, updated);
    return updated;
}

export function getMockConfigsByTenant(tenantId: string): SSOConfigurationProps[] {
    return Array.from(mockSSOConfigs.values()).filter(c => c.tenantId === tenantId);
}

// ==================== POST /api/sso/[id]/connect ====================

export const POST = withApiRoute(
    { resource: 'sso_configurations', action: 'update' },
    async ({ ctx, req, params }) => {
        try {
            const paramsPayload = params ? await params : null;
            if (!paramsPayload) {
                return apiError('INVALID_PARAMS', 'Parámetros no disponibles', 500) as unknown as NextResponse;
            }
            const configId = typeof paramsPayload.id === 'string' ? paramsPayload.id : Array.isArray(paramsPayload.id) ? paramsPayload.id[0] : '';
            const userId = ctx.userId;
            const body = await req.json();
            const { action } = body;

            if (!configId) {
                return apiError('INVALID_PARAMS', 'ID de configuración inválido', 400) as unknown as NextResponse;
            }

            const config = getMockConfig(configId);
            if (!config || config.tenantId !== ctx.tenantId) {
                return apiError('NOT_FOUND', 'Configuración SSO no encontrada', 404) as unknown as NextResponse;
            }

            const ssoEntity = SSOConfiguration.fromSnapshot(config);
            const directoryService = createDirectoryService(ssoEntity);

            switch (action) {
                case 'connect': {
                    // Update state to connecting
                    updateMockConfig(configId, { estado: 'CONNECTING', ultimoIntentoAt: new Date().toISOString() });

                    const connectResult = await (directoryService as any).connect();

                    if (connectResult.success) {
                        updateMockConfig(configId, {
                            estado: 'CONNECTED',
                            intentosConexion: 0,
                            ultimoError: undefined,
                        });

                        auditLogger.log({
                            type: AuditEventType.SSO_CONNECTION,
                            userId,
                            metadata: { configId, action: 'connect_success', provider: config.proveedor },
                        });

                        return apiSuccess({
                            success: true,
                            estado: 'CONNECTED',
                            message: 'Conexión establecida exitosamente'
                        }) as unknown as NextResponse;
                    } else {
                        updateMockConfig(configId, {
                            estado: 'ERROR',
                            intentosConexion: config.intentosConexion + 1,
                            ultimoError: connectResult.error,
                        });

                        return apiError('CONNECTION_FAILED', connectResult.error || 'Error de conexión', 400) as unknown as NextResponse;
                    }
                }

                case 'authenticate': {
                    if (config.estado !== 'CONNECTED') {
                        return apiError('INVALID_STATE', 'Debe estar conectado primero', 400) as unknown as NextResponse;
                    }

                    const authResult = await (directoryService as any).authenticate(
                        config.adminDn || '',
                        config.adminPasswordEncrypted || ''
                    );

                    if (authResult.success) {
                        updateMockConfig(configId, {
                            estado: 'AUTHENTICATED',
                            uptimeSeconds: 0,
                        });

                        auditLogger.log({
                            type: AuditEventType.SSO_AUTHENTICATION,
                            userId,
                            metadata: { configId, action: 'auth_success', provider: config.proveedor },
                        });

                        return apiSuccess({
                            success: true,
                            estado: 'AUTHENTICATED',
                            user: authResult.user ? { email: authResult.user.email, name: authResult.user.displayName } : undefined,
                        }) as unknown as NextResponse;
                    } else {
                        return apiError('AUTH_FAILED', authResult.error || 'Autenticación fallida', 401) as unknown as NextResponse;
                    }
                }

                case 'sync': {
                    if (config.estado !== 'AUTHENTICATED') {
                        return apiError('INVALID_STATE', 'Debe estar autenticado primero', 400) as unknown as NextResponse;
                    }

                    updateMockConfig(configId, {
                        syncStatus: 'SYNCING',
                        ultimoSyncAt: new Date().toISOString(),
                    });

                    const syncResult = await (directoryService as any).syncUsers({
                        baseDn: config.syncConfig?.baseDn,
                        userFilter: config.syncConfig?.userFilter,
                        attributeMappings: config.syncConfig?.attributeMappings || [],
                    });

                    if (syncResult.success) {
                        updateMockConfig(configId, {
                            syncStatus: 'COMPLETED',
                            syncErrores: [],
                        });

                        auditLogger.log({
                            type: AuditEventType.SSO_SYNC,
                            userId,
                            metadata: {
                                configId,
                                action: 'sync_complete',
                                usersCreated: syncResult.usersCreated,
                                usersUpdated: syncResult.usersUpdated,
                                errors: syncResult.errors.length,
                            },
                        });

                        return apiSuccess({
                            success: true,
                            syncStatus: 'COMPLETED',
                            result: {
                                usersCreated: syncResult.usersCreated,
                                usersUpdated: syncResult.usersUpdated,
                                usersDeactivated: syncResult.usersDeactivated,
                                groupsCreated: syncResult.groupsCreated,
                                groupsUpdated: syncResult.groupsUpdated,
                                durationMs: syncResult.durationMs,
                            },
                        }) as unknown as NextResponse;
                    } else {
                        updateMockConfig(configId, {
                            syncStatus: 'FAILED',
                            syncErrores: syncResult.errors.map((e: { message?: string; identifier?: string }) => ({
                                timestamp: new Date().toISOString(),
                                mensaje: e.message,
                                usuarioOGrupo: e.identifier,
                            })),
                        });

                        return apiSuccess({
                            success: false,
                            syncStatus: 'FAILED',
                            errors: syncResult.errors,
                        }) as unknown as NextResponse;
                    }
                }

                case 'test': {
                    const testResult = await (directoryService as any).testConnection();

                    return apiSuccess({
                        success: testResult.success,
                        latencyMs: testResult.latencyMs,
                        error: testResult.error,
                        provider: config.proveedor,
                    }) as unknown as NextResponse;
                }

                case 'disconnect': {
                    try {
                        await (directoryService as any).disconnect();
                    } catch (e) {
                        // Ignore disconnect errors
                    }

                    updateMockConfig(configId, { estado: 'DISCONNECTED' });

                    auditLogger.log({
                        type: AuditEventType.SSO_DISCONNECTION,
                        userId,
                        metadata: { configId, provider: config.proveedor },
                    });

                    return apiSuccess({
                        success: true,
                        estado: 'DISCONNECTED',
                        message: 'Desconectado exitosamente'
                    }) as unknown as NextResponse;
                }

                case 'maintenance': {
                    updateMockConfig(configId, { estado: 'MAINTENANCE' });

                    auditLogger.log({
                        type: AuditEventType.SSO_MAINTENANCE,
                        userId,
                        metadata: { configId, provider: config.proveedor },
                    });

                    return apiSuccess({
                        success: true,
                        estado: 'MAINTENANCE',
                        message: 'Modo mantenimiento activado'
                    }) as unknown as NextResponse;
                }

                default:
                    return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
            }
        } catch (error) {
            logger.error('Error POST /api/sso/[id]/connect', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);