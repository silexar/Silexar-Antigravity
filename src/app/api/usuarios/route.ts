/**
 * SILEXAR PULSE - Enhanced API Routes Usuarios (Tier Functional)
 * 
 * @description API REST endpoints completos para gestión de usuarios con BD real
 * @implements FASE 1 - Gestión de Usuarios (1.1.1 - 1.1.10 del plan)
 * 
 * @version 2026.1.0
 * @tier TIER_0_FORTUNE_10
 * @following SILEXAR_MODULE_BUILDER_PROTOCOL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, desc, like, or, inArray, sql } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';
import {
  apiSuccess, apiError, apiUnauthorized, apiForbidden,
  apiServerError, apiNotFound, apiValidationError
} from '@/lib/api/response';
import { auditLogger, logAdminAction } from '@/lib/security/audit-logger';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { getDB } from '@/lib/db';
import { users, userPreferences, tenants, permissions, userPermissions } from '@/lib/db/users-schema';
import { SistemaRBAC } from '@/lib/services/sistema-rbac';
import { logger } from '@/lib/observability';
import { PasswordSecurityEngine, PASSWORD_POLICIES } from '@/lib/security/password-security';
import { generateSecureToken } from '@/lib/security/enterprise-encryption';
import { emailService } from '@/lib/email/email-service';

// ═══════════════════════════════════════════════════════════════════
// ZOD SCHEMAS
// ═══════════════════════════════════════════════════════════════════

const CreateUsuarioSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  nombre: z.string().min(2, 'Nombre demasiado corto').max(100).trim(),
  phone: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  category: z.enum(['super_admin', 'vendedor', 'ejecutivo', 'trafico', 'operacional', 'marketing', 'soporte', 'analista', 'developer']).default('vendedor'),
  password: z.string().min(10, 'La contraseña debe tener al menos 10 caracteres').optional(),
  sendWelcomeEmail: z.boolean().default(true),
  requires2FA: z.boolean().default(false),
  isTenantAdmin: z.boolean().default(false),
});

const UpdateUsuarioSchema = z.object({
  id: z.string().uuid('ID de usuario inválido'),
  email: z.string().email('Email inválido').toLowerCase().optional(),
  nombre: z.string().min(2).max(100).trim().optional(),
  phone: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  category: z.enum(['super_admin', 'vendedor', 'ejecutivo', 'trafico', 'operacional', 'marketing', 'soporte', 'analista', 'developer']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  isTenantAdmin: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

const ImportUsuariosSchema = z.object({
  usuarios: z.array(z.object({
    email: z.string().email().toLowerCase(),
    nombre: z.string().min(2).max(100).trim(),
    phone: z.string().max(50).optional(),
    department: z.string().max(100).optional(),
    position: z.string().max(100).optional(),
    category: z.enum(['super_admin', 'vendedor', 'ejecutivo', 'trafico', 'operacional', 'marketing', 'soporte', 'analista', 'developer']).default('vendedor'),
    password: z.string().min(10).optional(),
  })),
  sendWelcomeEmails: z.boolean().default(true),
  defaultPassword: z.string().min(10).optional(),
});

const SearchUsuariosSchema = z.object({
  query: z.string().optional(),
  rol: z.string().optional(),
  estado: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  department: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hash password using PasswordSecurityEngine
 */
async function hashPassword(password: string): Promise<string> {
  return PasswordSecurityEngine.hashPassword(password);
}

/**
 * Get user stats for tenant
 */
async function getUserStats(tenantId: string): Promise<{
  total: number;
  activos: number;
  inactivos: number;
  pending: number;
  suspended: number;
  porCategoria: Record<string, number>;
}> {
  const db = getDB();

  const allUsers = await db
    .select({
      status: users.status,
      category: users.category,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId));

  const stats = {
    total: allUsers.length,
    activos: 0,
    inactivos: 0,
    pending: 0,
    suspended: 0,
    porCategoria: {} as Record<string, number>,
  };

  for (const user of allUsers) {
    if (user.status === 'active') stats.activos++;
    else if (user.status === 'inactive') stats.inactivos++;
    else if (user.status === 'pending') stats.pending++;
    else if (user.status === 'suspended') stats.suspended++;

    if (user.category) {
      stats.porCategoria[user.category] = (stats.porCategoria[user.category] || 0) + 1;
    }
  }

  return stats;
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(email: string, nombre: string, temporalPassword: string): Promise<boolean> {
  try {
    if (emailService) {
      await emailService.sendWelcome(email, nombre, 'Silexar Pulse', 'usuario');
      return true;
    }
  } catch (error) {
    logger.warn('[UsuariosAPI] Failed to send welcome email', { email, error });
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// GET - List usuarios with pagination and filters
// ═══════════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'usuarios', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const result = await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const rol = searchParams.get('rol') || '';
        const estado = searchParams.get('estado') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
        const offset = (page - 1) * pageSize;

        const db = getDB();
        let conditions = [eq(users.tenantId, ctx.tenantId)];

        if (estado) {
          conditions.push(eq(users.status, estado as 'active' | 'inactive' | 'suspended' | 'pending'));
        }

        if (rol) {
          conditions.push(eq(users.category, rol as 'vendedor' | 'ejecutivo' | 'trafico' | 'operacional'));
        }

        if (query) {
          conditions.push(
            or(
              like(users.name, `%${query}%`),
              like(users.email, `%${query}%`)
            )!
          );
        }

        // Get users with pagination
        const usersList = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            phone: users.phone,
            department: users.department,
            position: users.position,
            category: users.category,
            status: users.status,
            isTenantAdmin: users.isTenantAdmin,
            twoFactorEnabled: users.twoFactorEnabled,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(and(...conditions))
          .orderBy(desc(users.createdAt))
          .limit(pageSize)
          .offset(offset);

        // Get total count
        const [{ count: total }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(...conditions));

        // Get tenant info
        const [tenant] = await db
          .select({ name: tenants.name, maxUsers: tenants.maxUsers })
          .from(tenants)
          .where(eq(tenants.id, ctx.tenantId))
          .limit(1);

        // Get stats
        const stats = await getUserStats(ctx.tenantId);

        return {
          usuarios: usersList,
          roles: SistemaRBAC.getRoles(),
          stats,
          pagination: {
            page,
            pageSize,
            total: Number(total),
            totalPages: Math.ceil(Number(total) / pageSize),
          },
          tenant: tenant || null,
        };
      });

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/Usuarios] Error GET:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// POST - Create usuario
// ═══════════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'usuarios', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      const parsed = CreateUsuarioSchema.safeParse(body);

      if (!parsed.success) {
        return apiValidationError(parsed.error.flatten());
      }

      const result = await withTenantContext(ctx.tenantId, async () => {
        const db = getDB();
        const { email, nombre, phone, department, position, category, password, sendWelcomeEmail: sendEmail, requires2FA, isTenantAdmin } = parsed.data;

        // Check if email already exists
        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existing) {
          return { error: 'DUPLICATE_EMAIL', message: 'El email ya está registrado en el sistema' };
        }

        // Check max users limit
        const [tenant] = await db
          .select({ maxUsers: tenants.maxUsers })
          .from(tenants)
          .where(eq(tenants.id, ctx.tenantId))
          .limit(1);

        const currentCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(eq(users.tenantId, ctx.tenantId));

        if (tenant && Number(currentCount[0].count) >= tenant.maxUsers) {
          return { error: 'MAX_USERS_REACHED', message: `Has alcanzado el límite de ${tenant.maxUsers} usuarios para tu plan` };
        }

        // Generate password if not provided
        const passwordToUse = password || generateSecureToken(12);
        const hashedPassword = await hashPassword(passwordToUse);

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            name: nombre,
            phone: phone || null,
            department: department || null,
            position: position || null,
            category: category as 'vendedor' | 'ejecutivo' | 'trafico' | 'operacional' | 'marketing' | 'soporte' | 'analista' | 'developer',
            passwordHash: hashedPassword,
            status: 'pending',
            isTenantAdmin: isTenantAdmin || false,
            twoFactorEnabled: requires2FA || false,
            requirePasswordChange: true,
            createdById: ctx.userId || null,
          })
          .returning();

        // Create user preferences
        await db
          .insert(userPreferences)
          .values({
            userId: newUser.id,
          });

        // Send welcome email if requested
        if (sendEmail) {
          await sendWelcomeEmail(email, nombre, passwordToUse);
        }

        // Log admin action
        await logAdminAction(ctx.userId, 'CREATE_USER', `usuarios:${newUser.id}`, {
          createdUserId: newUser.id,
          email: newUser.email,
          category: newUser.category,
        });

        return newUser;
      });

      if (result && 'error' in result) {
        return apiError(result.error, result.message, 400);
      }

      return apiSuccess(result, 201);
    } catch (error) {
      logger.error('[API/Usuarios] Error POST:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// PUT - Bulk import usuarios from CSV/Excel
// ═══════════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
  { resource: 'usuarios', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      const parsed = ImportUsuariosSchema.safeParse(body);

      if (!parsed.success) {
        return apiValidationError(parsed.error.flatten());
      }

      const result = await withTenantContext(ctx.tenantId, async () => {
        const db = getDB();
        const { usuarios, sendWelcomeEmails, defaultPassword } = parsed.data;

        const results = {
          success: 0,
          failed: 0,
          errors: [] as { row: number; email: string; error: string }[],
          created: [] as { id: string; email: string; nombre: string }[],
        };

        const passwordToUse = defaultPassword || generateSecureToken(12);

        for (let i = 0; i < usuarios.length; i++) {
          const row = usuarios[i];

          try {
            // Check if email exists
            const [existing] = await db
              .select({ id: users.id })
              .from(users)
              .where(eq(users.email, row.email))
              .limit(1);

            if (existing) {
              results.failed++;
              results.errors.push({ row: i + 1, email: row.email, error: 'Email ya existe' });
              continue;
            }

            const hashedPassword = await hashPassword(row.password || passwordToUse);

            const [newUser] = await db
              .insert(users)
              .values({
                email: row.email,
                name: row.nombre,
                phone: row.phone || null,
                department: row.department || null,
                position: row.position || null,
                category: row.category as 'vendedor' | 'ejecutivo' | 'trafico' | 'operacional' | 'marketing' | 'soporte' | 'analista' | 'developer',
                passwordHash: hashedPassword,
                status: 'pending',
                requirePasswordChange: true,
                createdById: ctx.userId || null,
              })
              .returning();

            // Create preferences
            await db
              .insert(userPreferences)
              .values({ userId: newUser.id });

            results.success++;
            results.created.push({ id: newUser.id, email: newUser.email, nombre: newUser.name });

            if (sendWelcomeEmails) {
              await sendWelcomeEmail(row.email, row.nombre, row.password || passwordToUse);
            }
          } catch (rowError) {
            results.failed++;
            results.errors.push({
              row: i + 1,
              email: row.email,
              error: rowError instanceof Error ? rowError.message : 'Error desconocido',
            });
          }
        }

        // Log bulk import
        await logAdminAction(ctx.userId, 'BULK_IMPORT_USERS', 'usuarios', {
          total: usuarios.length,
          success: results.success,
          failed: results.failed,
        });

        return results;
      });

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/Usuarios] Error PUT (Bulk Import):', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// PATCH - Update usuario or check permissions
// ═══════════════════════════════════════════════════════════════════

export const PATCH = withApiRoute(
  { resource: 'usuarios', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();

      // Check if this is a permission check request
      if (body.action === 'checkPermission') {
        const permissionCheck = z.object({
          action: z.literal('checkPermission'),
          userId: z.string().uuid(),
          recurso: z.string(),
          accion: z.string(),
        }).safeParse(body);

        if (!permissionCheck.success) {
          return apiValidationError(permissionCheck.error.flatten());
        }

        return apiSuccess({
          tienePermiso: SistemaRBAC.tienePermiso(
            { id: permissionCheck.data.userId, rol: ctx.role } as never,
            permissionCheck.data.recurso as never,
            permissionCheck.data.accion as never
          )
        });
      }

      // Otherwise, treat as update
      const parsed = UpdateUsuarioSchema.safeParse(body);
      if (!parsed.success) {
        return apiValidationError(parsed.error.flatten());
      }

      const result = await withTenantContext(ctx.tenantId, async () => {
        const db = getDB();
        const { id, email, nombre, phone, department, position, category, status, isTenantAdmin, twoFactorEnabled } = parsed.data;

        // Verify user belongs to tenant
        const [existing] = await db
          .select({ id: users.id, tenantId: users.tenantId })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!existing) {
          return { error: 'USER_NOT_FOUND' };
        }

        // Build update object
        const updates: Partial<typeof users.$inferInsert> = {
          updatedAt: new Date(),
        };

        if (email) updates.email = email;
        if (nombre) updates.name = nombre;
        if (phone !== undefined) updates.phone = phone;
        if (department !== undefined) updates.department = department;
        if (position !== undefined) updates.position = position;
        if (category) updates.category = category as 'vendedor' | 'ejecutivo' | 'trafico' | 'operacional' | 'marketing' | 'soporte' | 'analista' | 'developer';
        if (status) updates.status = status as 'active' | 'inactive' | 'suspended' | 'pending';
        if (isTenantAdmin !== undefined) updates.isTenantAdmin = isTenantAdmin;
        if (twoFactorEnabled !== undefined) updates.twoFactorEnabled = twoFactorEnabled;

        const [updated] = await db
          .update(users)
          .set(updates)
          .where(eq(users.id, id))
          .returning();

        if (!updated) {
          return { error: 'UPDATE_FAILED' };
        }

        // Log update
        await logAdminAction(ctx.userId, 'UPDATE_USER', `usuarios:${id}`, {
          updatedFields: Object.keys(updates).filter(k => k !== 'updatedAt'),
        });

        return updated;
      });

      if (result && 'error' in result) {
        return apiNotFound('usuario');
      }

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/Usuarios] Error PATCH:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// DELETE - Deactivate usuario (soft delete)
// ═══════════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
  { resource: 'usuarios', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('id');

      if (!userId) {
        return apiError('MISSING_ID', 'ID de usuario requerido', 400);
      }

      const result = await withTenantContext(ctx.tenantId, async () => {
        const db = getDB();

        // Verify user exists and belongs to tenant
        const [existing] = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(and(eq(users.id, userId), eq(users.tenantId, ctx.tenantId)))
          .limit(1);

        if (!existing) {
          return { error: 'USER_NOT_FOUND' };
        }

        // Prevent self-deletion
        if (userId === ctx.userId) {
          return { error: 'CANNOT_DELETE_SELF', message: 'No puedes eliminarte a ti mismo' };
        }

        // Soft delete - set status to inactive
        const [deactivated] = await db
          .update(users)
          .set({ status: 'inactive', updatedAt: new Date() })
          .where(eq(users.id, userId))
          .returning();

        // Log deactivation
        await logAdminAction(ctx.userId, 'DEACTIVATE_USER', `usuarios:${userId}`, {
          deactivatedUserId: userId,
          deactivatedEmail: existing.email,
        });

        return deactivated;
      });

      if (result && 'error' in result) {
        if (result.error === 'USER_NOT_FOUND') {
          return apiNotFound('usuario');
        }
        return apiError(result.error, (result as { message?: string }).message || 'Error', 400);
      }

      return apiSuccess({ success: true, message: 'Usuario desactivado correctamente' });
    } catch (error) {
      logger.error('[API/Usuarios] Error DELETE:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);
