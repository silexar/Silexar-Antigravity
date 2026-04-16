/**
 * GET /api/cunas  — List cuñas/spots
 * POST /api/cunas — Create cuña (via DDD CrearCunaHandler)
 * PUT /api/cunas  — Bulk update cuñas (via DDD BulkUpdateCunasHandler)
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { logger } from '@/lib/observability'
import { getDB } from '@/lib/db'
import { cunas, anunciantes } from '@/lib/db/schema'
import type { TipoCuna, EstadoCuna } from '@/lib/db/cunas-schema'
import { eq, ilike, and, gte, lte, or, sql, desc, asc } from 'drizzle-orm'
import { z } from 'zod'
import { formatDuration } from '@/lib/db/cunas-schema'
// DDD handlers
import { CrearCunaHandler } from '@/modules/cunas/application/handlers/CrearCunaHandler'
import { BulkUpdateCunasHandler } from '@/modules/cunas/application/handlers/BulkUpdateCunasHandler'
import { CrearCunaCommand } from '@/modules/cunas/application/commands/CrearCunaCommand'
import { BulkUpdateCunasCommand } from '@/modules/cunas/application/commands/BulkUpdateCunasCommand'
import { CunaDrizzleRepository } from '@/modules/cunas/infrastructure/repositories/CunaDrizzleRepository'

// ─── Zod Schemas (frontend → API boundary) ────────────────────────────────────
const createCunaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.enum(['spot', 'mencion', 'auspicio', 'jingle', 'promo', 'institucional', 'promo_ida', 'presentacion', 'cierre', 'audio']).optional().default('spot'),
  anuncianteId: z.string().uuid('El anuncianteId debe ser un UUID válido'),
  producto: z.string().optional().nullable(),
  duracionSegundos: z.number().int().positive().optional().default(30),
  urgencia: z.string().optional().default('programada'),
  fechaInicioVigencia: z.string().optional(),
  fechaFinVigencia: z.string().optional(),
})

const bulkUpdateSchema = z.object({
  cunaIds: z.array(z.string().uuid('Ids inválidos')).min(1, 'Se requiere al menos 1 ID de cuña'),
  accion: z.enum(['aprobar', 'poner_en_aire', 'pausar', 'finalizar', 'eliminar', 'cambiar_urgencia']),
  urgencia: z.string().optional(),
})

// ─── GET /api/cunas ──────────────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'cunas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    try {
      const { searchParams } = new URL(req.url)

      const search = searchParams.get('search') || ''
      const tipo = searchParams.get('tipo') || ''
      const estado = searchParams.get('estado') || ''
      const anuncianteId = searchParams.get('anuncianteId') || ''
      const venceEnDias = searchParams.get('venceEnDias')
      const soloEnAire = searchParams.get('soloEnAire') === 'true'
      const soloPendientes = searchParams.get('soloPendientes') === 'true'

      const page = parseInt(searchParams.get('page') || '1', 10)
      const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
      const offset = (page - 1) * limit
      // orderBy is reserved for future use
      const _orderByStr = searchParams.get('orderBy') || 'fechaSubida'
      const orderDir = searchParams.get('orderDir') || 'desc'

      // Construcción del where — always at least 2 conditions so and() is never undefined
      const conditions = [eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false)]

      if (search) {
        const searchCond = or(
          ilike(cunas.nombre, `%${search}%`),
          ilike(cunas.codigo, `%${search}%`)
        );
        if (searchCond) conditions.push(searchCond);
      }

      if (tipo) {
        // Normalización básica de tipos legacy del frontend
        let tipoParsed = tipo
        if (['promo_ida', 'presentacion', 'cierre'].includes(tipo)) tipoParsed = 'promo'
        if (tipo === 'audio') tipoParsed = 'spot'
        conditions.push(eq(cunas.tipoCuna, tipoParsed as TipoCuna))
      }

      if (estado) conditions.push(eq(cunas.estado, estado as EstadoCuna))
      if (anuncianteId) conditions.push(eq(cunas.anuncianteId, anuncianteId))

      if (venceEnDias) {
        const fechaLimite = new Date()
        fechaLimite.setDate(fechaLimite.getDate() + parseInt(venceEnDias, 10))
        conditions.push(lte(cunas.fechaFinVigencia, fechaLimite))
        conditions.push(gte(cunas.fechaFinVigencia, new Date()))
      }

      if (soloEnAire) conditions.push(eq(cunas.estado, 'en_aire'))
      if (soloPendientes) conditions.push(eq(cunas.estado, 'pendiente_aprobacion'))

      // and() is always defined — conditions always has at least 2 items
      const whereCondition = and(...conditions) ?? eq(cunas.tenantId, tenantId)

      // Query Data
      const data = await getDB()
        .select({
          cuna: cunas,
          anuncianteNombre: anunciantes.nombreRazonSocial
        })
        .from(cunas)
        .where(whereCondition)
        .leftJoin(anunciantes, eq(cunas.anuncianteId, anunciantes.id))
        .orderBy(orderDir === 'desc' ? desc(cunas.fechaSubida) : asc(cunas.fechaSubida))
        .limit(limit)
        .offset(offset)

      // Mapeo al frontend
      const mappedData = data.map(item => {
        const c = item.cuna
        let diasRest = 0
        if (c.fechaFinVigencia) {
          diasRest = Math.ceil((new Date(c.fechaFinVigencia).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }

        return {
          id: c.id,
          spxCodigo: c.codigo,
          nombre: c.nombre,
          tipo: c.tipoCuna,
          anuncianteId: c.anuncianteId,
          anuncianteNombre: item.anuncianteNombre || 'Desconocido',
          producto: c.productoNombre,
          duracionSegundos: c.duracionSegundos,
          duracionFormateada: formatDuration(c.duracionSegundos),
          estado: c.estado,
          urgencia: 'programada' as const,
          diasRestantes: Math.max(0, diasRest),
          totalEmisiones: 0, // Mock
          fechaCreacion: c.fechaSubida.toISOString(),
          fechaInicioVigencia: c.fechaInicioVigencia?.toISOString() || new Date().toISOString(),
          fechaFinVigencia: c.fechaFinVigencia?.toISOString() || new Date().toISOString(),
          audioUrl: c.pathAudio !== 'placeholder' ? c.pathAudio : undefined,
        }
      })

      // Count
      const countRes = await getDB()
        .select({ count: sql<number>`count(*)` })
        .from(cunas)
        .where(whereCondition)
      const total = Number(countRes[0].count)
      const totalPages = Math.ceil(total / limit)

      const metricas = {
        total,
        enAire: mappedData.filter(c => c.estado === 'en_aire').length,
        pendientes: mappedData.filter(c => c.estado === 'pendiente_aprobacion').length,
        porVencer: mappedData.filter(c => c.diasRestantes <= 7 && c.diasRestantes > 0).length,
        emisionesTotal: 0,
      }

      return apiSuccess(mappedData, 200, {
        metricas,
        pagination: {
          total,
          page,
          pageSize: limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in cunas GET', error instanceof Error ? error : undefined, { module: 'cunas', action: 'GET' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── POST /api/cunas ─────────────────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'cunas', action: 'create' },
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

      const parseResult = createCunaSchema.safeParse(rawBody)

      if (!parseResult.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          400,
          parseResult.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const body = parseResult.data

      // Delegar al handler DDD — genera código SPX atómicamente
      const repository = new CunaDrizzleRepository()
      const handler = new CrearCunaHandler(repository)
      const command = new CrearCunaCommand({
        tenantId,
        nombre: body.nombre,
        tipo: body.tipo,
        anuncianteId: body.anuncianteId,
        productoNombre: body.producto ?? null,
        pathAudio: 'placeholder', // Se sube después via /api/cunas/[id]/audio
        duracionSegundos: body.duracionSegundos,
        formatoAudio: 'mp3',
        urgencia: body.urgencia ?? null,
        fechaInicioVigencia: body.fechaInicioVigencia ? new Date(body.fechaInicioVigencia) : null,
        fechaFinVigencia: body.fechaFinVigencia ? new Date(body.fechaFinVigencia) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subidoPorId: userId,
      })

      const result = await handler.execute(command)
      if (!result.success) {
        return apiError('CUNA_CREATE_FAILED', result.error, 422) as unknown as NextResponse
      }

      return apiSuccess(result.data.toJSON(), 201, { message: 'Cuña creada exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in cunas POST', error instanceof Error ? error : undefined, { module: 'cunas', action: 'POST' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── PUT /api/cunas — Bulk operations ────────────────────────────────────────

export const PUT = withApiRoute(
  { resource: 'cunas', action: 'update' },
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

      const parseResult = bulkUpdateSchema.safeParse(rawBody)

      if (!parseResult.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en validación',
          400,
          parseResult.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const body = parseResult.data

      // Delegar al handler DDD — valida transiciones y ejecuta best-effort
      const repository = new CunaDrizzleRepository()
      const handler = new BulkUpdateCunasHandler(repository)
      const command = new BulkUpdateCunasCommand({
        cunaIds: body.cunaIds,
        tenantId,
        userId,
        accion: body.accion,
        urgencia: body.urgencia,
      })

      const result = await handler.execute(command)
      if (!result.success) {
        return apiError('BULK_UPDATE_FAILED', result.error, 500) as unknown as NextResponse
      }

      const { exitosos, fallidos, errores } = result.data
      return apiSuccess(
        { exitosos, fallidos, errores },
        200,
        { message: `${exitosos} cuñas actualizadas${fallidos > 0 ? `, ${fallidos} con errores` : ''}` }
      ) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in cunas PUT', error instanceof Error ? error : undefined, { module: 'cunas', action: 'PUT' })
      return apiServerError() as unknown as NextResponse
    }
  }
)
