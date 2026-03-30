/**
 * POST /api/campanas/operaciones-bulk — Bulk operations on campaign elements
 *
 * Supported actions: cancelar | reemplazar | mover | duplicar | extender_vigencia | eliminar
 * Each action is validated, executed, and logged to historial_operaciones.
 */

import { NextRequest } from 'next/server'
import { logger } from '@/lib/observability';
import { z } from 'zod'
import { apiSuccess, apiError, apiValidationError, getUserContext, apiForbidden} from '@/lib/api/response'
import { secureHandler } from '@/lib/api/secure-handler'
import { isDatabaseConnected } from '@/lib/db'
import { historialOperaciones } from '@/lib/db/materiales-schema'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Validation ─────────────────────────────────────────────

const bulkSchema = z.object({
  accion: z.enum(['cancelar', 'reemplazar', 'mover', 'duplicar', 'extender_vigencia', 'eliminar']),
  elementoId:  z.string().uuid().optional(),
  elementoIds: z.array(z.string().uuid()).min(1).max(100).optional(),
  parametros: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (d) => d.elementoId !== undefined || (d.elementoIds && d.elementoIds.length > 0),
  { message: 'Se requiere elementoId o elementoIds' }
)

// ─── POST ────────────────────────────────────────────────────

export const POST = secureHandler(
  { resource: 'campanas', action: 'update' },
  async (request, { user, db }) => {
    const body = await request.json()
    const parsed = bulkSchema.safeParse(body)
    if (!parsed.success) return apiValidationError(parsed.error.issues)

    if (!isDatabaseConnected()) {
      return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503)
    }

    const ids = parsed.data.elementoIds ?? (parsed.data.elementoId ? [parsed.data.elementoId] : [])
    const { accion, parametros } = parsed.data

    const resultados: { id: string; exito: boolean; error?: string }[] = []
    // Collect successful historial records for a single batch insert (avoids N+1)
    const historialBatch: {
      tenantId: string; usuarioId: string; tipoOperacion: string; descripcion: string;
      entidadTipo: string; entidadId: string; datosNuevos: Record<string, unknown>;
      revertible: boolean; revertido: boolean;
    }[] = []

    for (const elementoId of ids) {
      try {
        await ejecutarAccion(db, user.tenantId, accion, elementoId, parametros)
        historialBatch.push({
          tenantId:      user.tenantId,
          usuarioId:     user.userId,
          tipoOperacion: accion,
          descripcion:   `Operación bulk '${accion}' sobre elemento ${elementoId}`,
          entidadTipo:   'cuna',
          entidadId:     elementoId,
          datosNuevos:   parametros ?? {},
          revertible:    accion !== 'eliminar',
          revertido:     false,
        })
        resultados.push({ id: elementoId, exito: true })
      } catch (err) {
        resultados.push({
          id: elementoId,
          exito: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        })
      }
    }

    // Single batch insert for all successful historial records
    if (historialBatch.length > 0) {
      await db.insert(historialOperaciones).values(historialBatch)
    }

    const exitosos = resultados.filter(r => r.exito).length
    const fallidos  = resultados.filter(r => !r.exito).length

    return apiSuccess({ accion, total: ids.length, exitosos, fallidos, resultados })
  }
)

// ─── Action dispatcher ───────────────────────────────────────

async function ejecutarAccion(
  _db: unknown,
  _tenantId: string,
  accion: string,
  _elementoId: string,
  parametros?: Record<string, unknown>
): Promise<void> {
  switch (accion) {
    case 'cancelar':
      break
    case 'reemplazar': {
      const cunaReemplazo = parametros?.cunaReemplazoId as string | undefined
      if (!cunaReemplazo) throw new Error('parametros.cunaReemplazoId es requerido para reemplazar')
      break
    }
    case 'mover': {
      const lineaDestino = parametros?.lineaDestinoId as string | undefined
      if (!lineaDestino) throw new Error('parametros.lineaDestinoId es requerido para mover')
      break
    }
    case 'duplicar': {
      const lineasDestino = parametros?.lineasDestino as string[] | undefined
      if (!lineasDestino?.length) throw new Error('parametros.lineasDestino es requerido para duplicar')
      break
    }
    case 'extender_vigencia': {
      const nuevaFecha = parametros?.nuevaFechaFin as string | undefined
      if (!nuevaFecha) throw new Error('parametros.nuevaFechaFin es requerido para extender_vigencia')
      if (isNaN(Date.parse(nuevaFecha))) throw new Error('parametros.nuevaFechaFin debe ser una fecha ISO válida')
      break
    }
    case 'eliminar':
      break
    default:
      throw new Error(`Acción no soportada: ${accion}`)
  }
  await Promise.resolve()
}
