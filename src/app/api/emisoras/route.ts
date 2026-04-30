/**
 * 🌐 SILEXAR PULSE - API Routes Emisoras TIER 0
 * 
 * @description API REST endpoints para el módulo de Emisoras
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { z } from 'zod';
import { apiSuccess, apiValidationError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';
import { DrizzleEmisoraRepository } from '@/modules/emisoras/infrastructure/repositories/DrizzleEmisoraRepository';

const repository = new DrizzleEmisoraRepository();

// Zod schema for input validation
const createEmisoraSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  nombreComercial: z.string().max(200).optional(),
  tipoFrecuencia: z.enum(['fm', 'am', 'dab', 'online']).optional(),
  frecuencia: z.string().max(20).optional(),
  ciudad: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  streamUrl: z.string().url('URL de stream inválida').or(z.literal('')).optional(),
  formatoExportacion: z.enum(['csv', 'json', 'xml']).optional(),
});

/**
 * GET - Listar emisoras
 * Requiere: emisoras:read
 */
export const GET = withApiRoute(
  { resource: 'emisoras', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const ciudad = searchParams.get('ciudad') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const tenantId = ctx.tenantId;

        // Construir filtros para el repository
        const filters = {
          search: search || undefined,
          ciudad: ciudad || undefined,
        };

        // Consultar base de datos con repository
        const emisorasDB = await repository.findAll(
          tenantId,
          filters,
          { field: 'nombre', direction: 'asc' },
          limit,
          (page - 1) * limit
        );

        // Obtener total para paginación
        const total = await repository.count(tenantId, filters);
        const totalPages = Math.ceil(total / limit);

        return apiSuccess(emisorasDB, 200, {
          pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
          consultadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/Emisoras] Error:', error instanceof Error ? error : undefined, {
        module: 'emisoras',
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        action: 'GET'
      });

      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'emisoras',
          accion: 'GET',
          tenantId: ctx.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return apiServerError(error instanceof Error ? error.message : 'Error al obtener emisoras');
    }
  }
);

/**
 * POST - Crear emisora
 * Requiere: emisoras:create
 */
export const POST = withApiRoute(
  { resource: 'emisoras', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();

        // Validate input with Zod
        const parsed = createEmisoraSchema.safeParse(body);
        if (!parsed.success) {
          return apiValidationError(parsed.error.flatten().fieldErrors);
        }

        const tenantId = ctx.tenantId;

        // Generar código secuencial del repository
        const codigo = await repository.generateCode(tenantId);

        // Crear emisora en base de datos
        const createdEmisora = await repository.create({
          tenantId,
          codigo,
          nombre: parsed.data.nombre,
          nombreComercial: parsed.data.nombreComercial || null,
          tipoFrecuencia: (parsed.data.tipoFrecuencia || 'fm') as 'fm' | 'am' | 'dab' | 'online',
          frecuencia: parsed.data.frecuencia || null,
          ciudad: parsed.data.ciudad || null,
          region: parsed.data.region || null,
          streamUrl: parsed.data.streamUrl || null,
          formatoExportacion: (parsed.data.formatoExportacion || 'csv') as 'dalet' | 'rcs' | 'enco' | 'csv' | 'xml' | 'txt',
          estado: 'activa',
          activa: true,
          eliminado: false,
          creadoPorId: ctx.userId,
        });

        return apiSuccess(createdEmisora, 201, { message: 'Emisora creada exitosamente' });
      });
    } catch (error) {
      logger.error('[API/Emisoras] Error:', error instanceof Error ? error : undefined, {
        module: 'emisoras',
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        action: 'POST'
      });

      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'emisoras',
          accion: 'POST',
          tenantId: ctx.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return apiServerError(error instanceof Error ? error.message : 'Error al crear emisora');
    }
  }
);
