/**
 * SSO Configuration Individual Route - Enterprise SSO Management
 * CATEGORY: CRITICAL - DDD + CQRS
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { v4 as uuidv4 } from 'uuid';
import { createDirectoryService } from '@/modules/configuracion/infrastructure/DirectoryServices';
import { SSOConfigurationProps } from '@/modules/configuracion/domain/entities/SSOConfiguration';

// Import mock storage from parent route
declare const mockSSOConfigs: Map<string, SSOConfigurationProps>;
declare function getMockConfig(id: string): SSOConfigurationProps | undefined;
declare function updateMockConfig(id: string, updates: Partial<SSOConfigurationProps>): SSOConfigurationProps | undefined;

// ==================== SCHEMAS ====================

const UpdateSSOConfigSchema = z.object({
    nombre: z.string().min(1).max(255).optional(),
    host: z.string().optional(),
    puerto: z.number().min(1).max(65535).optional(),
    sslHabilitado: z.boolean().optional(),
    adminDn: z.string().optional(),
    adminPassword: z.string().optional().transform(v => v === '' ? undefined : v),
    clientId: z.string().optional(),
    clientSecret: z.string().optional().transform(v => v === '' ? undefined : v),
    metadataUrl: z.string().url().optional(),
    entityId: z.string().optional(),
    acsUrl: z.string().url().optional(),
    sloUrl: z.string().url().optional(),
    certificateMetadata: z.string().optional(),
    syncConfig: z.object({
        baseDn: z.string().optional(),
        userFilter: z.string().optional(),
        groupFilter: z.string().optional(),
        syncIntervalMinutes: z.number().min(15).max(1440).optional(),
        autoSync: z.boolean().optional(),
        syncNestedGroups: z.boolean().optional(),
        attributeMappings: z.array(z.object({
            directorioAttribute: z.string(),
            userField: z.string(),
            transform: z.enum(['NONE', 'LOWER', 'UPPER', 'TITLE_CASE', 'CUSTOM']).optional(),
            required: z.boolean().default(false),
        })).optional(),
    }).optional(),
    jitEnabled: z.boolean().optional(),
    jitDefaultRoleId: z.string().uuid().optional(),
    jitAutoCreateUsers: z.boolean().optional(),
    singleLogoutEnabled: z.boolean().optional(),
    logoutRedirectUrl: z.string().url().optional(),
    estaActivo: z.boolean().optional(),
    esDefault: z.boolean().optional(),
});

// ==================== GET /api/sso/[id] ====================

export const GET = withApiRoute(
    { resource: 'sso_configurations', action: 'read', skipCsrf: true },
    async ({ ctx, params: paramsPromise }) => {
        try {
            const params = paramsPromise ? await paramsPromise : null;
            if (!params) {
                return apiServerError() as unknown as NextResponse;
            }
            const configId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
            const config = getMockConfig(configId);

            if (!config || config.tenantId !== ctx.tenantId) {
                return apiError('NOT_FOUND', 'Configuración SSO no encontrada', 404) as unknown as NextResponse;
            }

            // Return public data (hide credentials)
            const { adminPasswordEncrypted, clientSecretEncrypted, ...publicConfig } = config;

            return apiSuccess({
                ...publicConfig,
                tieneCredenciales: !!(adminPasswordEncrypted || clientSecretEncrypted),
                proveedorInfo: {
                    ACTIVE_DIRECTORY: { label: 'Microsoft Active Directory', color: '#0078D4' },
                    LDAP: { label: 'Directorio LDAP', color: '#6B7280' },
                    SAML: { label: 'SAML 2.0', color: '#10B981' },
                    OAUTH2: { label: 'OAuth 2.0', color: '#F59E0B' },
                    OIDC: { label: 'OpenID Connect', color: '#6366F1' },
                    GOOGLE_WORKSPACE: { label: 'Google Workspace', color: '#EA4335' },
                    MICROSOFT_GRAPH: { label: 'Microsoft Graph', color: '#0078D4' },
                }[config.proveedor],
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/sso/[id]', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== PUT /api/sso/[id] ====================

export const PUT = withApiRoute(
    { resource: 'sso_configurations', action: 'update' },
    async ({ ctx, req, params: paramsPromise }) => {
        try {
            const params = paramsPromise ? await paramsPromise : null;
            if (!params) {
                return apiServerError() as unknown as NextResponse;
            }
            const configId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
            const userId = ctx.userId;
            const body = await req.json();

            const existing = getMockConfig(configId);
            if (!existing || existing.tenantId !== ctx.tenantId) {
                return apiError('NOT_FOUND', 'Configuración SSO no encontrada', 404) as unknown as NextResponse;
            }

            const parsed = UpdateSSOConfigSchema.safeParse(body);
            if (!parsed.success) {
                return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
            }

            const updates: Partial<SSOConfigurationProps> = {
                actualizadoPorId: userId,
            };

            if (parsed.data.nombre !== undefined) updates.nombre = parsed.data.nombre;
            if (parsed.data.host !== undefined) updates.host = parsed.data.host;
            if (parsed.data.puerto !== undefined) updates.puerto = parsed.data.puerto;
            if (parsed.data.sslHabilitado !== undefined) updates.sslHabilitado = parsed.data.sslHabilitado;
            if (parsed.data.adminDn !== undefined) updates.adminDn = parsed.data.adminDn;
            if (parsed.data.adminPassword !== undefined) updates.adminPasswordEncrypted = parsed.data.adminPassword;
            if (parsed.data.clientId !== undefined) updates.clientId = parsed.data.clientId;
            if (parsed.data.clientSecret !== undefined) updates.clientSecretEncrypted = parsed.data.clientSecret;
            if (parsed.data.metadataUrl !== undefined) updates.metadataUrl = parsed.data.metadataUrl;
            if (parsed.data.entityId !== undefined) updates.entityId = parsed.data.entityId;
            if (parsed.data.acsUrl !== undefined) updates.acsUrl = parsed.data.acsUrl;
            if (parsed.data.sloUrl !== undefined) updates.sloUrl = parsed.data.sloUrl;
            if (parsed.data.certificateMetadata !== undefined) updates.certificateMetadata = parsed.data.certificateMetadata;
            if (parsed.data.syncConfig !== undefined) {
                updates.syncConfig = { ...existing.syncConfig, ...parsed.data.syncConfig };
            }
            if (parsed.data.jitEnabled !== undefined) updates.jitEnabled = parsed.data.jitEnabled;
            if (parsed.data.jitDefaultRoleId !== undefined) updates.jitDefaultRoleId = parsed.data.jitDefaultRoleId;
            if (parsed.data.jitAutoCreateUsers !== undefined) updates.jitAutoCreateUsers = parsed.data.jitAutoCreateUsers;
            if (parsed.data.singleLogoutEnabled !== undefined) updates.singleLogoutEnabled = parsed.data.singleLogoutEnabled;
            if (parsed.data.logoutRedirectUrl !== undefined) updates.logoutRedirectUrl = parsed.data.logoutRedirectUrl;
            if (parsed.data.estaActivo !== undefined) updates.estaActivo = parsed.data.estaActivo;
            if (parsed.data.esDefault !== undefined) updates.esDefault = parsed.data.esDefault;

            const updated = updateMockConfig(configId, updates);

            auditLogger.log({
                type: AuditEventType.DATA_UPDATE,
                userId,
                metadata: {
                    module: 'sso_configuration',
                    resourceId: configId,
                    updates: Object.keys(updates),
                }
            });

            const { adminPasswordEncrypted, clientSecretEncrypted, ...publicUpdated } = updated!;
            return apiSuccess({
                ...publicUpdated,
                tieneCredenciales: !!(adminPasswordEncrypted || clientSecretEncrypted),
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error PUT /api/sso/[id]', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== DELETE /api/sso/[id] ====================

export const DELETE = withApiRoute(
    { resource: 'sso_configurations', action: 'delete' },
    async ({ ctx, params: paramsPromise }) => {
        try {
            const params = paramsPromise ? await paramsPromise : null;
            if (!params) {
                return apiServerError() as unknown as NextResponse;
            }
            const configId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
            const userId = ctx.userId;

            const existing = getMockConfig(configId);
            if (!existing || existing.tenantId !== ctx.tenantId) {
                return apiError('NOT_FOUND', 'Configuración SSO no encontrada', 404) as unknown as NextResponse;
            }

            // Prevent deletion of active authenticated configurations
            if (existing.estado === 'AUTHENTICATED') {
                return apiError('INVALID_STATE', 'No se puede eliminar una configuración activa. Desactívela primero.', 400) as unknown as NextResponse;
            }

            // In production, mark as deleted or actually delete
            mockSSOConfigs.delete(configId);

            auditLogger.log({
                type: AuditEventType.DATA_DELETE,
                userId,
                metadata: {
                    module: 'sso_configuration',
                    resourceId: configId,
                    provider: existing.proveedor,
                }
            });

            return apiSuccess({ deleted: true, id: configId }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error DELETE /api/sso/[id]', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);