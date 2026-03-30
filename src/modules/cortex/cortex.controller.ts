/**
 * CortexController — HTTP route handlers for the cortex module
 *
 * NOTE: This is NOT a NestJS controller. It exports plain async functions
 * that are called from Next.js API route files in src/app/api/cortex/.
 *
 * Each function follows the standard API route pattern from CLAUDE.md:
 *   1. Extract auth context
 *   2. Validate input
 *   3. Check permissions
 *   4. Execute via CortexService (tenant-isolated)
 *   5. Return standardized response
 */

import { type NextRequest } from 'next/server'
import { getUserContext, apiSuccess, apiUnauthorized, apiServerError } from '@/lib/api/response'
import { checkPermission } from '@/lib/security/rbac'
import { logger } from '@/lib/observability'
import { CortexService } from './cortex.service'
import type { MotorCortex } from './domain/entities/MotorCortex'

export async function handleListarMotores(request: NextRequest) {
  const ctx = getUserContext(request)
  if (!ctx.userId) return apiUnauthorized()

  const perm = checkPermission(ctx, 'configuracion', 'read')
  if (!perm) return apiUnauthorized()

  try {
    const svc = new CortexService(ctx.tenantId)
    const motores = await svc.listarMotores(ctx.tenantId)
    const resumen = await svc.obtenerResumenEstados(ctx.tenantId)
    return apiSuccess({ motores: motores.map(serializeMotor), resumen })
  } catch (error) {
    logger.error('CortexController.listarMotores failed', error instanceof Error ? error : undefined)
    return apiServerError()
  }
}

function serializeMotor(motor: MotorCortex) {
  return {
    id: motor.id,
    tipo: motor.tipo,
    nombre: motor.nombre,
    version: motor.version,
    estado: motor.estado.valor,
    estaOperacional: motor.estado.estaOperacional,
    metricas: {
      precision: motor.metricas.precision,
      latenciaMs: motor.metricas.latenciaMs,
      solicitudesTotal: motor.metricas.solicitudesTotal,
      solicitudesExitosas: motor.metricas.solicitudesExitosas,
      tasaExito: motor.metricas.tasaExito,
      ultimaEjecucion: motor.metricas.ultimaEjecucion?.toISOString() ?? null,
    },
    creadoEn: motor.creadoEn.toISOString(),
    actualizadoEn: motor.actualizadoEn.toISOString(),
  }
}
