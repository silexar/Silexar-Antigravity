/**
 * SILEXAR PULSE - API Module Template
 * 
 * @description Template for creating new API modules following
 *              the architectural patterns established in Phases 1-6.
 * 
 * @usage
 * 1. Copy this directory structure for new modules
 * 2. Replace NOMBRE_MODULO with your module name
 * 3. Follow the checklist at the end
 * 
 * Directory structure:
 * src/app/api/nombre-modulo/
 * ├── route.ts           # Main route (GET, POST, PUT, PATCH, DELETE)
 * ├── [id]/
 * │   └── route.ts       # Single resource routes
 * └── schema.ts          # Zod validation schemas
 * 
 * src/modules/nombre-modulo/
 * ├── domain/
 * │   ├── entities/      # Domain entities (if DDD)
 * │   └── value-objects/ # Value objects (if DDD)
 * ├── application/
 * │   └── services/      # Application services
 * └── infrastructure/
 *     ├── repositories/  # Data access
 *     └── controllers/   # Route handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import type { RouteConfig } from '@/lib/api/with-api-route';
import type { Resource } from '@/lib/security/rbac';
import { apiSuccess, apiError, apiValidationError, apiServerError, apiNotFound } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { requirePermission } from '@/lib/middleware/authorization';
import { validateBody, paginationSchema } from '@/lib/middleware/validation';
import { cacheService } from '@/lib/cache';
import { withTransaction } from '@/lib/db';
import { distributedLock } from '@/lib/lock';
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors';
import { getDB } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════════
// ZOD SCHEMAS - Replace with your module's schemas
// ═══════════════════════════════════════════════════════════════════

const CreateSchema = z.object({
  // TODO: Define create validation schema
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const UpdateSchema = z.object({
  id: z.string().uuid('Invalid ID'),
  // TODO: Define update validation schema
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const SearchSchema = paginationSchema.extend({
  query: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - Add your module's helpers
// ═══════════════════════════════════════════════════════════════════

function getCacheKey(id: string): string {
  return `nombre-modulo:${id}`;
}

// ═══════════════════════════════════════════════════════════════════
// GET - List resources
// ═══════════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'nombre-modulo' as Resource, action: 'read' },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get('query') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);

      // Try cache first (cache-aside pattern)
      const cacheKey = `nombre-modulo:list:${query}:${page}:${pageSize}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return apiSuccess(cached);
      }

      // TODO: Fetch from database
      // const db = getDB();
      // const items = await db.select().from(table).where(...).limit(pageSize);

      const result = {
        items: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      };

      // Cache result
      cacheService.set(cacheKey, result, { ttl: 300 });

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/NombreModulo] Error GET:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// POST - Create resource
// ═══════════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'nombre-modulo' as Resource, action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      const parsed = CreateSchema.safeParse(body);

      if (!parsed.success) {
        return apiValidationError(parsed.error.flatten());
      }

      // Use distributed lock to prevent duplicate creation
      const lockKey = `nombre-modulo:create:${parsed.data.name}`;

      return await distributedLock.execute(lockKey, async () => {
        return withTransaction(async (tx) => {
          // TODO: Check for duplicates
          // const existing = await tx.select().from(table).where(eq(table.name, parsed.data.name));
          // if (existing.length > 0) {
          //   throw new ConflictError('Resource already exists');
          // }

          // TODO: Insert into database
          // const [created] = await tx.insert(table).values(parsed.data).returning();

          const created = { id: crypto.randomUUID(), ...parsed.data };

          // Invalidate list cache
          cacheService.invalidatePattern('nombre-modulo:list:*');

          return apiSuccess(created);
        }, { isolationLevel: 'read-committed' });
      }, { ttl: 5000 }).catch((error) => {
        if (error instanceof ValidationError || error instanceof ConflictError) {
          return apiError(error.code, error.message, error.statusCode);
        }
        throw error;
      });
    } catch (error) {
      logger.error('[API/NombreModulo] Error POST:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE FOR PATCH (Update)
// ═══════════════════════════════════════════════════════════════════

/*
export const PATCH = withApiRoute(
  { resource: 'nombre-modulo', action: 'update' },
  async ({ ctx, req }: { ctx: Record<string, string>; req: NextRequest }) => {
    try {
      const body = await req.json();
      const parsed = UpdateSchema.safeParse(body);

      if (!parsed.success) {
        return apiValidationError(parsed.error.flatten());
      }

      const { id, ...updates } = parsed.data;

      return await distributedLock.execute(`nombre-modulo:${id}`, async () => {
        return withTransaction(async (tx) => {
          // Check exists
          // const [existing] = await tx.select().from(table).where(eq(table.id, id));
          // if (!existing) {
          //   throw new NotFoundError('Resource', id);
          // }

          // Update
          // const [updated] = await tx.update(table).set(updates).where(eq(table.id, id)).returning();

          // Invalidate cache
          cacheService.invalidate(`nombre-modulo:${id}`);
          cacheService.invalidatePattern('nombre-modulo:list:*');

          return { id, ...updates };
        });
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return apiNotFound('resource');
      }
      logger.error('[API/NombreModulo] Error PATCH:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);
*/

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE FOR DELETE
// ═══════════════════════════════════════════════════════════════════

/*
export const DELETE = withApiRoute(
  { resource: 'nombre-modulo', action: 'delete' },
  async ({ ctx, req }: { ctx: Record<string, string>; req: NextRequest }) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return apiError('MISSING_ID', 'ID is required', 400);
      }

      return await distributedLock.execute(`nombre-modulo:${id}`, async () => {
        return withTransaction(async (tx) => {
          // Delete
          // await tx.delete(table).where(eq(table.id, id));

          // Invalidate cache
          cacheService.invalidate(`nombre-modulo:${id}`);
          cacheService.invalidatePattern('nombre-modulo:list:*');

          return { success: true };
        });
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return apiNotFound('resource');
      }
      logger.error('[API/NombreModulo] Error DELETE:', error instanceof Error ? error : undefined);
      return apiServerError();
    }
  }
);
*/