/**
 * SILEXAR PULSE - Usuario Controller (Example Implementation)
 * 
 * @description Example concrete controller demonstrating the BaseController pattern
 *              This shows how to migrate from inline route handlers to controller-based architecture
 * 
 * @example Migration from route.ts:
 * 
 * BEFORE (route.ts):
 * ```typescript
 * export const GET = withApiRoute({ resource: 'usuarios', action: 'read' }, async ({ ctx, req }) => {
 *   const db = getDB();
 *   const users = await db.select().from(users).where(eq(users.tenantId, ctx.tenantId));
 *   return apiSuccess(users);
 * });
 * ```
 * 
 * AFTER (using controller):
 * ```typescript
 * import { UsuarioController } from '@/lib/controllers/examples/UsuarioController';
 * const controller = new UsuarioController();
 * export const GET = controller.list.bind(controller);
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import { BaseController, ControllerContext, ControllerRequest } from '@/lib/controllers/BaseController';
import { container } from '@/lib/di/Container';
import { getDB } from '@/lib/db';
import { users, userPreferences, tenants } from '@/lib/db/users-schema';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/observability';
import { generateSecureToken } from '@/lib/security/enterprise-encryption';
import { PasswordSecurityEngine } from '@/lib/security/password-security';
import { logAdminAction } from '@/lib/security/audit-logger';

// Zod Schemas
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

const SearchSchema = z.object({
    query: z.string().optional(),
    rol: z.string().optional(),
    estado: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export class UsuarioController extends BaseController {
    constructor() {
        super('UsuarioController');
    }

    /**
     * GET /api/usuarios - List usuarios with pagination
     */
    async list(req: NextRequest): Promise<NextResponse> {
        return this.handleRequest('list', async () => {
            const { searchParams } = new URL(req.url);
            const query = searchParams.get('query') || '';
            const rol = searchParams.get('rol') || '';
            const estado = searchParams.get('estado') || '';
            const page = parseInt(searchParams.get('page') || '1');
            const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
            const offset = (page - 1) * pageSize;

            const db = getDB();
            const conditions = [eq(users.tenantId, this.getContext().tenantId)];

            if (estado) {
                conditions.push(eq(users.status, estado as 'active' | 'inactive' | 'suspended' | 'pending'));
            }
            if (rol) {
                conditions.push(eq(users.category, rol as 'vendedor' | 'ejecutivo' | 'trafico' | 'operacional'));
            }
            if (query) {
                conditions.push(or(like(users.name, `%${query}%`), like(users.email, `%${query}%`))!);
            }

            const [usersList, [{ count: total }]] = await Promise.all([
                db.select({
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
                    .offset(offset),
                db.select({ count: sql<number>`count(*)` }).from(users).where(and(...conditions)),
            ]);

            return {
                usuarios: usersList,
                pagination: { page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) },
            };
        }, { tenantId: this.getContext().tenantId });
    }

    /**
     * GET /api/usuarios/[id] - Get single usuario
     */
    async getById(req: NextRequest, id: string): Promise<NextResponse> {
        return this.handleRequest('getById', async () => {
            const db = getDB();
            const [user] = await db
                .select()
                .from(users)
                .where(and(eq(users.id, id), eq(users.tenantId, this.getContext().tenantId)))
                .limit(1);

            if (!user) {
                throw new NotFoundError('Usuario', id);
            }

            return user;
        }, { userId: id });
    }

    /**
     * POST /api/usuarios - Create usuario
     */
    async create(req: NextRequest): Promise<NextResponse> {
        return this.handleRequest('create', async () => {
            const body = await req.json();
            const parsed = CreateUsuarioSchema.safeParse(body);

            if (!parsed.success) {
                const fieldErrors = Object.entries(parsed.error.flatten().fieldErrors).flatMap(
                    ([field, messages]) => messages.map(message => ({ field, message }))
                );
                throw new ValidationError('Datos de usuario inválidos', fieldErrors);
            }

            const db = getDB();
            const { email, nombre, phone, department, position, category, password, sendWelcomeEmail: sendEmail, requires2FA, isTenantAdmin } = parsed.data;

            // Check duplicate
            const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
            if (existing) {
                throw new ValidationError('El email ya está registrado');
            }

            // Check max users
            const [tenant] = await db.select({ maxUsers: tenants.maxUsers }).from(tenants).where(eq(tenants.id, this.getContext().tenantId)).limit(1);
            const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.tenantId, this.getContext().tenantId));

            if (tenant && Number(count) >= tenant.maxUsers) {
                throw new ValidationError(`Has alcanzado el límite de ${tenant.maxUsers} usuarios`);
            }

            const passwordToUse = password || generateSecureToken(12);
            const hashedPassword = await PasswordSecurityEngine.hashPassword(passwordToUse);

            const [newUser] = await db.insert(users).values({
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
                createdById: this.getContext().userId || null,
            }).returning();

            await db.insert(userPreferences).values({ userId: newUser.id });

            await logAdminAction(this.getContext().userId, 'CREATE_USER', `usuarios:${newUser.id}`, {
                createdUserId: newUser.id,
                email: newUser.email,
            });

            return newUser;
        });
    }

    /**
     * PATCH /api/usuarios/[id] - Update usuario
     */
    async update(req: NextRequest, id: string): Promise<NextResponse> {
        return this.handleRequest('update', async () => {
            const body = await req.json();
            const parsed = UpdateUsuarioSchema.safeParse(body);

            if (!parsed.success) {
                const fieldErrors = Object.entries(parsed.error.flatten().fieldErrors).flatMap(
                    ([field, messages]) => messages.map(message => ({ field, message }))
                );
                throw new ValidationError('Datos de actualización inválidos', fieldErrors);
            }

            const db = getDB();
            const [existing] = await db
                .select({ id: users.id })
                .from(users)
                .where(and(eq(users.id, id), eq(users.tenantId, this.getContext().tenantId)))
                .limit(1);

            if (!existing) {
                throw new NotFoundError('Usuario', id);
            }

            const updates: Record<string, unknown> = { updatedAt: new Date() };
            const { email, nombre, phone, department, position, category, status, isTenantAdmin, twoFactorEnabled } = parsed.data;

            if (email) updates.email = email;
            if (nombre) updates.name = nombre;
            if (phone !== undefined) updates.phone = phone;
            if (department !== undefined) updates.department = department;
            if (position !== undefined) updates.position = position;
            if (category) updates.category = category;
            if (status) updates.status = status;
            if (isTenantAdmin !== undefined) updates.isTenantAdmin = isTenantAdmin;
            if (twoFactorEnabled !== undefined) updates.twoFactorEnabled = twoFactorEnabled;

            const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();

            return updated;
        }, { userId: id });
    }

    /**
     * DELETE /api/usuarios/[id] - Deactivate usuario
     */
    async delete(req: NextRequest, id: string): Promise<NextResponse> {
        return this.handleRequest('delete', async () => {
            const db = getDB();

            // Prevent self-deletion
            if (id === this.getContext().userId) {
                throw new ValidationError('No puedes eliminarte a ti mismo');
            }

            const [existing] = await db
                .select({ id: users.id, email: users.email })
                .from(users)
                .where(and(eq(users.id, id), eq(users.tenantId, this.getContext().tenantId)))
                .limit(1);

            if (!existing) {
                throw new NotFoundError('Usuario', id);
            }

            const [deactivated] = await db
                .update(users)
                .set({ status: 'inactive', updatedAt: new Date() })
                .where(eq(users.id, id))
                .returning();

            await logAdminAction(this.getContext().userId, 'DEACTIVATE_USER', `usuarios:${id}`, {
                deactivatedUserId: id,
                deactivatedEmail: existing.email,
            });

            return { success: true, message: 'Usuario desactivado correctamente' };
        }, { userId: id });
    }

    private _context: ControllerContext | null = null;

    private getContext(): ControllerContext {
        if (!this._context) {
            this._context = {
                userId: '',
                role: '',
                tenantId: '',
                tenantSlug: '',
                sessionId: '',
                requestId: '',
                isImpersonating: false,
            };
        }
        return this._context;
    }

    setContext(ctx: ControllerContext): void {
        this._context = ctx;
    }
}

// Controller singleton for route handlers
export const usuarioController = new UsuarioController();

// DI Registration helper
export function registerUsuarioController(): void {
    container.register('UsuarioController', () => usuarioController, 'singleton');
}