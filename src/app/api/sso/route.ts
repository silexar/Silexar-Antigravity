/**
 * SSO Configuration API - Enterprise Single Sign-On Management
 * CATEGORY: CRITICAL - DDD + CQRS + Event Sourcing
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { getDB } from '@/lib/db';
import { tenants } from '@/lib/db/users-schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { createDirectoryService } from '@/modules/configuracion/infrastructure/DirectoryServices';
import { SSOConfiguration, SSOConfigurationProps, ProviderTypeSchema } from '@/modules/configuracion/domain/entities/SSOConfiguration';

// ==================== SCHEMAS ====================

const CreateSSOConfigSchema = z.object({
    nombre: z.string().min(1).max(255),
    proveedor: z.enum(['ACTIVE_DIRECTORY', 'LDAP', 'SAML', 'OAUTH2', 'OIDC', 'GOOGLE_WORKSPACE', 'MICROSOFT_GRAPH']),

    // Connection config
    host: z.string().optional(),
    puerto: z.number().min(1).max(65535).optional(),
    sslHabilitado: z.boolean().default(false),

    // Credentials
    adminDn: z.string().optional(),
    adminPassword: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),

    // SSO metadata
    metadataUrl: z.string().url().optional(),
    entityId: z.string().optional(),
    acsUrl: z.string().url().optional(),
    sloUrl: z.string().url().optional(),
    certificateMetadata: z.string().optional(),

    // Sync config
    syncConfig: z.object({
        baseDn: z.string().optional(),
        userFilter: z.string().optional(),
        groupFilter: z.string().optional(),
        syncIntervalMinutes: z.number().min(15).max(1440).default(60),
        autoSync: z.boolean().default(true),
        syncNestedGroups: z.boolean().default(false),
        attributeMappings: z.array(z.object({
            directorioAttribute: z.string(),
            userField: z.string(),
            transform: z.enum(['NONE', 'LOWER', 'UPPER', 'TITLE_CASE', 'CUSTOM']).optional(),
            required: z.boolean().default(false),
        })).default([]),
    }).optional(),

    // JIT provisioning
    jitEnabled: z.boolean().default(false),
    jitDefaultRoleId: z.string().uuid().optional(),
    jitAutoCreateUsers: z.boolean().default(true),

    // SSO options
    singleLogoutEnabled: z.boolean().default(true),
    logoutRedirectUrl: z.string().url().optional(),

    // Activation
    estaActivo: z.boolean().default(false),
    esDefault: z.boolean().default(false),
});

const UpdateSSOConfigSchema = CreateSSOConfigSchema.partial();

// ==================== MOCK DATABASE ====================

const mockSSOConfigs: Map<string, SSOConfigurationProps> = new Map();

function getMockConfig(id: string): SSOConfigurationProps | undefined {
    return mockSSOConfigs.get(id);
}

function getMockConfigsByTenant(tenantId: string): SSOConfigurationProps[] {
    return Array.from(mockSSOConfigs.values()).filter(c => c.tenantId === tenantId);
}

function createMockConfig(data: Omit<SSOConfigurationProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): SSOConfigurationProps {
    const now = new Date().toISOString();
    const config: SSOConfigurationProps = {
        ...data,
        id: uuidv4(),
        version: 1,
        creadoAt: now,
        actualizadoAt: now,
    } as SSOConfigurationProps;
    mockSSOConfigs.set(config.id, config);
    return config;
}

function updateMockConfig(id: string, updates: Partial<SSOConfigurationProps>): SSOConfigurationProps | undefined {
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

// ==================== GET /api/sso ====================

export const GET = withApiRoute(
    { resource: 'sso_configurations', action: 'read', skipCsrf: true },
    async ({ ctx }) => {
        try {
            const tenantId = ctx.tenantId;
            const configs = getMockConfigsByTenant(tenantId);

            const response = configs.map(config => {
                const { adminPasswordEncrypted, clientSecretEncrypted, ...publicConfig } = config;
                return {
                    ...publicConfig,
                    tieneCredenciales: !!(adminPasswordEncrypted || clientSecretEncrypted),
                };
            });

            return apiSuccess({
                items: response,
                total: response.length,
                proveedores: {
                    ACTIVE_DIRECTORY: { label: 'Microsoft Active Directory', icono: 'windows' },
                    LDAP: { label: 'Directorio LDAP', icono: 'folder' },
                    SAML: { label: 'SAML 2.0', icono: 'shield' },
                    OAUTH2: { label: 'OAuth 2.0', icono: 'key' },
                    OIDC: { label: 'OpenID Connect', icono: 'openid' },
                    GOOGLE_WORKSPACE: { label: 'Google Workspace', icono: 'google' },
                    MICROSOFT_GRAPH: { label: 'Microsoft Graph', icono: 'microsoft' },
                },
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/sso', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/sso ====================

export const POST = withApiRoute(
    { resource: 'sso_configurations', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const body = await req.json();

            const parsed = CreateSSOConfigSchema.safeParse(body);
            if (!parsed.success) {
                return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
            }

            const data = parsed.data;

            // Check if provider already configured for this tenant
            const existingConfigs = getMockConfigsByTenant(tenantId);
            const providerExists = existingConfigs.some(c => c.proveedor === data.proveedor);
            if (providerExists) {
                return apiError('DUPLICATE_PROVIDER', `Ya existe configuración para ${data.proveedor}`, 409) as unknown as NextResponse;
            }

            // Create configuration entity to validate
            const configProps: Omit<SSOConfigurationProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'> = {
                tenantId,
                nombre: data.nombre,
                proveedor: data.proveedor,
                estado: 'DISCONNECTED',
                host: data.host,
                puerto: data.puerto,
                sslHabilitado: data.sslHabilitado,
                adminDn: data.adminDn,
                adminPasswordEncrypted: data.adminPassword,
                clientId: data.clientId,
                clientSecretEncrypted: data.clientSecret,
                metadataUrl: data.metadataUrl,
                entityId: data.entityId,
                acsUrl: data.acsUrl,
                sloUrl: data.sloUrl,
                certificateMetadata: data.certificateMetadata,
                syncConfig: { syncIntervalMinutes: 60, autoSync: true, syncNestedGroups: false, attributeMappings: [], conflictResolution: 'ASK' as const, ...data.syncConfig },
                syncStatus: 'IDLE',
                syncErrores: [],
                jitEnabled: data.jitEnabled,
                jitDefaultRoleId: data.jitDefaultRoleId,
                jitAutoCreateUsers: data.jitAutoCreateUsers,
                singleLogoutEnabled: data.singleLogoutEnabled,
                logoutRedirectUrl: data.logoutRedirectUrl,
                intentosConexion: 0,
                ultimoError: undefined,
                uptimeSeconds: 0,
                estaActivo: data.estaActivo,
                esDefault: data.esDefault,
                creadoPorId: userId,
            };

            const config = createMockConfig(configProps);

            auditLogger.log({
                type: AuditEventType.DATA_CREATE,
                userId,
                metadata: {
                    module: 'sso_configuration',
                    resourceId: config.id,
                    provider: data.proveedor,
                    nombre: data.nombre,
                }
            });

            return apiSuccess({
                id: config.id,
                nombre: config.nombre,
                proveedor: config.proveedor,
                estado: config.estado,
                tenantId: config.tenantId,
                creadoAt: config.creadoAt,
            }, 201) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error POST /api/sso', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);