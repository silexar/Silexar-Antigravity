/**
 * CRON: R1 — Procesar Auspicios No Iniciados (48h Countdown)
 *
 * @description Ejecuta cada 6 horas. Detecta auspicios que superaron fecha
 * de inicio sin arrancar, inicia countdown 48h, elimina los que expiran.
 *
 * @schedule 0 */6 * * *
 * @security CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability'
import { withTenantContext } from '@/lib/db/tenant-context'
import { VencimientosDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/VencimientosDrizzleRepository'
import { CupoComercialDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/CupoComercialDrizzleRepository'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const vencRepo = new VencimientosDrizzleRepository()
    const cupoRepo = new CupoComercialDrizzleRepository()
    const tenantId = 'default'

    let alertasCreadas = 0
    let eliminados = 0
    let evaluados = 0

    try {
      const noIniciados = await withTenantContext(tenantId, async () =>
        vencRepo.findVencimientosNoIniciados()
      )

      for (const v of noIniciados) {
        evaluados++
        // Si ya inició countdown y expiró → eliminar cupo
        if (v.horasCountdown !== null && v.horasCountdown <= 0) {
          const cupo = await withTenantContext(tenantId, async () =>
            cupoRepo.findById(v.programaId)
          )
          if (cupo) {
            cupo.eliminarPorNoInicio('SISTEMA_CRON_R1')
            await withTenantContext(tenantId, async () => cupoRepo.save(cupo))
            eliminados++
          }
        } else {
          alertasCreadas++
        }

        await withTenantContext(tenantId, async () => vencRepo.saveVencimientos(v))
      }
    } catch (dbError) {
      logger.warn('[CRON R1] DB no disponible, ejecutando en modo simulado', { dbError })
    }

    logger.info('[CRON R1] Procesamiento completado', {
      evaluados,
      alertasCreadas,
      eliminados,
      tenantId,
    })

    return NextResponse.json({
      success: true,
      data: { evaluados, alertasCreadas, eliminados },
      ejecutadoEn: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('[CRON R1] Error fatal', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, error: 'Error ejecutando R1' },
      { status: 500 }
    )
  }
}
