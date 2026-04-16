/**
 * GET /api/campanas  — List campaigns
 * POST /api/campanas — Create campaign
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { PropiedadesIntegrationAPI } from '../../../modules/propiedades/api/PropiedadesIntegrationAPI'
import { TipoPropiedadDrizzleRepository, ValorPropiedadDrizzleRepository } from '../../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
import { logger } from '@/lib/observability';
import { getDB } from '@/lib/db';
import { campanas, anunciantes, users } from '@/lib/db/schema';
import { SQL, eq, ilike, and } from 'drizzle-orm';
import { z } from 'zod';

const createCampanaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  anuncianteId: z.string().uuid('El anuncianteId debe ser un UUID válido'),
  tipoCampana: z.enum(['branding', 'promocional', 'lanzamiento', 'estacional', 'institucional', 'evento', 'mantencion']).optional().default('promocional'),
  medio: z.enum(['fm', 'digital', 'hibrido']).optional().default('fm'),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional(),
  presupuestoTotal: z.union([z.string(), z.number()]).transform((val) => String(val)).optional().default('0'),
  objetivoSpots: z.number().int().nonnegative().optional().default(0),
  prioridad: z.enum(['baja', 'normal', 'alta', 'urgente']).optional().default('normal'),
  propiedades: z.array(z.any()).optional().default([]),
});

// ─── GET /api/campanas ───────────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    try {
      const { searchParams } = new URL(req.url)
      const search = searchParams.get('search') || ''
      const estado = searchParams.get('estado') || ''
      const tipo = searchParams.get('tipo') || ''
      
      const page = parseInt(searchParams.get('page') || '1')
      const pageSize = parseInt(searchParams.get('pageSize') || '20')
      const offset = (page - 1) * pageSize

      const whereClauses: SQL[] = [eq(campanas.tenantId, tenantId)]

      if (search) {
        whereClauses.push(ilike(campanas.nombre, `%${search}%`))
      }
      if (estado) {
        // estado comes from a URL param (string); cast to the column's inferred
        // string type — RLS + Zod-validated enum in the DB keep this safe at runtime.
        whereClauses.push(eq(campanas.estado, estado as typeof campanas.estado._.data))
      }
      if (tipo) {
        whereClauses.push(eq(campanas.tipoCampana, tipo as typeof campanas.tipoCampana._.data))
      }

      const whereCondition = and(...whereClauses)

      // Query data
      const data = await getDB()
        .select({
          campana: campanas,
          anuncianteNombre: anunciantes.nombreRazonSocial,
          ejecutivoNombre: users.name,
        })
        .from(campanas)
        .where(whereCondition)
        .leftJoin(anunciantes, eq(campanas.anuncianteId, anunciantes.id))
        .leftJoin(users, eq(campanas.ejecutivoId, users.id))
        .limit(pageSize)
        .offset(offset)
        
      // For a real production app we would do proper aggregation with count over a left join,
      // but to keep parity with the DTO:
      const mappedData = data.map(row => ({
        id: row.campana.id,
        codigo: row.campana.codigo,
        nombre: row.campana.nombre,
        anuncianteNombre: row.anuncianteNombre || 'Sin Anunciante',
        tipoCampana: row.campana.tipoCampana,
        medio: row.campana.medio,
        fechaInicio: row.campana.fechaInicio,
        fechaFin: row.campana.fechaFin,
        presupuestoTotal: Number(row.campana.presupuestoTotal) || 0,
        presupuestoConsumido: Number(row.campana.presupuestoConsumido) || 0,
        estado: row.campana.estado,
        objetivoSpots: row.campana.objetivoSpots,
        spotsEmitidos: row.campana.spotsEmitidos ?? 0,
        porcentajeAvance: row.campana.objetivoSpots ? Math.round(((row.campana.spotsEmitidos ?? 0) / row.campana.objetivoSpots) * 100) : 0,
        emisorasCount: 0, // Simplified for now
        cunasCount: 0, // Simplified for now
        ejecutivoNombre: row.ejecutivoNombre,
        prioridad: row.campana.prioridad,
      }))

      // Real query for count could be added here
      const stats = {
        total: mappedData.length,
        enAire: mappedData.filter(c => c.estado === 'en_aire').length,
        planificacion: mappedData.filter(c => c.estado === 'planificacion').length,
        completadas: mappedData.filter(c => c.estado === 'completada').length,
        presupuestoTotal: mappedData.reduce((sum, c) => sum + (c.presupuestoTotal || 0), 0),
        spotsEmitidos: mappedData.reduce((sum, c) => sum + (c.spotsEmitidos ?? 0), 0),
      }

      return apiSuccess(mappedData, 200, {
        stats,
        pagination: {
          total: mappedData.length, // mock total
          page,
          pageSize,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in campanas GET', error instanceof Error ? error : undefined, { module: 'campanas', action: 'GET' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── POST /api/campanas ──────────────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'campanas', action: 'create' },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    try {
      let rawBody: unknown
      try {
        rawBody = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parseResult = createCampanaSchema.safeParse(rawBody);
      
      if (!parseResult.success) {
        return apiError(
          'VALIDATION_ERROR', 
          'Error en la validación de los datos', 
          400,
          parseResult.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const body = parseResult.data;

      // Cross-module property validation
      if (body.propiedades && body.propiedades.length > 0) {
        const propiedadesAPI = new PropiedadesIntegrationAPI(
          new TipoPropiedadDrizzleRepository(tenantId),
          new ValorPropiedadDrizzleRepository(tenantId)
        )
        const validacion = await propiedadesAPI.validarCoherenciaPropiedades(body.propiedades)
        if (validacion.isFailure) {
          return apiError(
            'VALIDATION_ERROR',
            `Campaña Rechazada: ${validacion.error?.message || 'Error de coherencia en propiedades comerciales.'}`,
            400
          ) as unknown as NextResponse
        }
      }

      // Default dates if not provided
      const fechaInicio = body.fechaInicio || new Date().toISOString().split('T')[0];
      const fechaFin = body.fechaFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Generate Code
      const result = await getDB()
        .insert(campanas)
        .values({
          tenantId,
          codigo: `CAM-2025-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          nombre: body.nombre,
          anuncianteId: body.anuncianteId,
          tipoCampana: body.tipoCampana,
          medio: body.medio,
          fechaInicio,
          fechaFin,
          presupuestoTotal: body.presupuestoTotal,
          estado: 'planificacion',
          objetivoSpots: body.objetivoSpots,
          creadoPorId: userId,
          prioridad: body.prioridad,
        })
        .returning()

      return apiSuccess(result[0], 201, { message: 'Campaña creada exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in campanas POST', error instanceof Error ? error : undefined, { module: 'campanas', action: 'POST' })
      return apiServerError() as unknown as NextResponse
    }
  }
)
