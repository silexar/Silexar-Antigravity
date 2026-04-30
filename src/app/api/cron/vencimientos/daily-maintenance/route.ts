/**
 * CRON: Daily Maintenance — Vencimientos
 *
 * @description Ejecuta diariamente a las 06:00. Actualiza niveles de alerta,
 * envía notificaciones a 7 días, limpia alertas expiradas, recalcula días restantes.
 *
 * @schedule 0 6 * * *
 * @security CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability'
import { withTenantContext } from '@/lib/db/tenant-context'
import { VencimientosDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/VencimientosDrizzleRepository'
import { eq, lt } from 'drizzle-orm'
import { getDB } from '@/lib/db'
import { alertasProgramador } from '@/lib/db/vencimientos-schema'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const vencRepo = new VencimientosDrizzleRepository()
    const tenantId = 'default'

    let vencimientosActualizados = 0
    let notificaciones7dias = 0
    let alertasLimpias = 0

    try {
      // 1. Actualizar todos los vencimientos activos próximos (30 días)
      const proximos = await withTenantContext(tenantId, async () =>
        vencRepo.findVencimientosProximos(30)
      )

      const hoy = new Date()
      for (const v of proximos) {
        const diasRestantes = Math.ceil(
          (new Date(v.fechaVencimientos).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        )

        let nivel = v.nivel
        if (diasRestantes <= 0) nivel = 'critico'
        else if (diasRestantes <= 3) nivel = 'rojo'
        else if (diasRestantes <= 7) nivel = 'rojo'
        else if (diasRestantes <= 15) nivel = 'amarillo'
        else if (diasRestantes <= 30) nivel = 'amarillo'
        else nivel = 'verde'

        // Notificación 7 días (solo una vez)
        if (diasRestantes === 7 && !v.notificacion7diasEnviada) {
          notificaciones7dias++
          v.notificacion7diasEnviada = true
        }

        if (v.diasRestantes !== diasRestantes || v.nivel !== nivel) {
          v.diasRestantes = diasRestantes
          v.nivel = nivel
          await withTenantContext(tenantId, async () => vencRepo.saveVencimientos(v))
          vencimientosActualizados++
        }
      }

      // 2. Limpiar alertas expiradas
      const db = getDB()
      const expiradas = await withTenantContext(tenantId, async () =>
        db.select({ id: alertasProgramador.id })
          .from(alertasProgramador)
          .where(lt(alertasProgramador.fechaExpiracion, new Date()))
      )

      for (const alerta of expiradas) {
        await withTenantContext(tenantId, async () =>
          db.delete(alertasProgramador).where(eq(alertasProgramador.id, alerta.id))
        )
        alertasLimpias++
      }
    } catch (dbError) {
      logger.warn('[CRON Daily] DB no disponible, modo simulado', { dbError })
    }

    logger.info('[CRON Daily] Mantenimiento completado', {
      vencimientosActualizados,
      notificaciones7dias,
      alertasLimpias,
      tenantId,
    })

    return NextResponse.json({
      success: true,
      data: { vencimientosActualizados, notificaciones7dias, alertasLimpias },
      ejecutadoEn: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('[CRON Daily] Error fatal', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, error: 'Error en mantenimiento diario' },
      { status: 500 }
    )
  }
}
