/**
 * GET /api/cunas/materiales — List ALL materials (radio cuñas + digital assets) for an anunciante
 *
 * Returns a unified list of both radio cuñas and digital assets for a given advertiser,
 * with optional filtering by tipo, estado, and search.
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { logger } from '@/lib/observability'
import { getDB } from '@/lib/db'
import { cunas, anunciantes, digitalAssets } from '@/lib/db/schema'
import { eq, ilike, and, or, desc } from 'drizzle-orm'
import {
  formatDuration,
  getCategoriaTipo,
  TIPO_MATERIAL_LABELS,
  mapLegacyTipo,
} from '@/lib/db/cunas-schema'

// ─── GET /api/cunas/materiales ───────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'cunas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    try {
      const { searchParams } = new URL(req.url)

      const anuncianteId = searchParams.get('anuncianteId')
      if (!anuncianteId) {
        return apiError('MISSING_PARAM', 'anuncianteId is required', 400) as unknown as NextResponse
      }

      const tipo = searchParams.get('tipo') || ''
      const estado = searchParams.get('estado') || ''
      const search = searchParams.get('search') || ''

      const page = parseInt(searchParams.get('page') || '1', 10)
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
      const offset = (page - 1) * limit

      // ─── Fetch radio cuñas ───────────────────────────────────────────────
      const cunasConditions = [
        eq(cunas.tenantId, tenantId),
        eq(cunas.eliminado, false),
        eq(cunas.anuncianteId, anuncianteId),
      ]

      if (search) {
        const searchCond = or(
          ilike(cunas.nombre, `%${search}%`),
          ilike(cunas.codigo, `%${search}%`)
        )
        if (searchCond) cunasConditions.push(searchCond)
      }

      if (tipo) {
        const tipoNormalized = mapLegacyTipo(tipo)
        cunasConditions.push(eq(cunas.tipoCuna, tipoNormalized))
      }

      if (estado) {
        cunasConditions.push(eq(cunas.estado, estado as any))
      }

      const cunasWhere = and(...cunasConditions) ?? eq(cunas.tenantId, tenantId)

      const cunasData = await getDB()
        .select({
          cuna: cunas,
          anuncianteNombre: anunciantes.nombreRazonSocial,
        })
        .from(cunas)
        .where(cunasWhere)
        .leftJoin(anunciantes, eq(cunas.anuncianteId, anunciantes.id))
        .orderBy(desc(cunas.fechaSubida))
        .limit(limit)
        .offset(offset)

      const cunasRows = cunasData.map(item => {
        const c = item.cuna
        const tipoMapped = mapLegacyTipo(c.tipoCuna)
        return {
          id: c.id,
          codigo: c.codigo,
          nombre: c.nombre,
          tipo: tipoMapped,
          tipoLabel: TIPO_MATERIAL_LABELS[tipoMapped] || tipoMapped,
          categoria: getCategoriaTipo(tipoMapped),
          estado: c.estado,
          duracionSegundos: c.duracionSegundos ?? 0,
          duracionFormateada: formatDuration(c.duracionSegundos ?? 0),
          pesoBytes: 0,
          urlOriginal: c.pathAudio !== 'placeholder' ? c.pathAudio : null,
          urlThumbnail: null,
          anuncianteId: c.anuncianteId,
          anuncianteNombre: item.anuncianteNombre || 'Desconocido',
          cunaId: c.id,
          createdAt: c.fechaSubida.toISOString(),
        }
      })

      // ─── Fetch digital assets ────────────────────────────────────────────
      // digital_assets.cunaId -> cunas.id, cunas.anuncianteId -> anunciantes.id
      const digitalConditions = [
        eq(digitalAssets.tenantId, tenantId),
        eq(digitalAssets.activo, true),
      ]

      if (search) {
        const searchCond = or(
          ilike(digitalAssets.nombre, `%${search}%`),
          ilike(digitalAssets.codigo, `%${search}%`)
        )
        if (searchCond) digitalConditions.push(searchCond)
      }

      if (estado) {
        digitalConditions.push(eq(digitalAssets.estado, estado))
      }

      const digitalWhere = and(...digitalConditions) ?? eq(digitalAssets.tenantId, tenantId)

      const digitalData = await getDB()
        .select({
          asset: digitalAssets,
          anuncianteNombre: anunciantes.nombreRazonSocial,
        })
        .from(digitalAssets)
        .innerJoin(cunas, and(
          eq(digitalAssets.cunaId, cunas.id),
          eq(cunas.anuncianteId, anuncianteId),
          eq(cunas.tenantId, tenantId),
          eq(cunas.eliminado, false)
        ))
        .leftJoin(anunciantes, eq(cunas.anuncianteId, anunciantes.id))
        .where(digitalWhere)
        .orderBy(desc(digitalAssets.fechaSubida))
        .limit(limit)
        .offset(offset)

      const digitalRows = digitalData.map(item => {
        const a = item.asset
        const tipoMapped = mapLegacyTipo(a.tipoAsset)
        return {
          id: a.id,
          codigo: a.codigo,
          nombre: a.nombre,
          tipo: tipoMapped,
          tipoLabel: TIPO_MATERIAL_LABELS[tipoMapped] || tipoMapped,
          categoria: getCategoriaTipo(tipoMapped),
          estado: a.estado,
          duracionSegundos: a.duracionSegundos ?? 0,
          duracionFormateada: formatDuration(a.duracionSegundos ?? 0),
          pesoBytes: a.pesoBytes ?? 0,
          urlOriginal: a.urlOriginal,
          urlThumbnail: a.urlThumbnail,
          anuncianteId: anuncianteId,
          anuncianteNombre: item.anuncianteNombre || 'Desconocido',
          cunaId: a.cunaId,
          createdAt: a.fechaSubida.toISOString(),
        }
      })

      // ─── Merge & sort by createdAt desc ──────────────────────────────────
      const allMaterials = [...cunasRows, ...digitalRows]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)

      // ─── Metrics ─────────────────────────────────────────────────────────
      const radioCount = cunasRows.length
      const digitalCount = digitalRows.length

      const metricas = {
        total: radioCount + digitalCount,
        radio: radioCount,
        digital: digitalCount,
      }

      return apiSuccess(allMaterials, 200, { metricas }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in cunas/materiales GET', error instanceof Error ? error : undefined, {
        module: 'cunas',
        action: 'GET',
        route: '/api/cunas/materiales',
      })
      return apiServerError() as unknown as NextResponse
    }
  }
)
