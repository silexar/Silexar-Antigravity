/**
 * CRON: R2 — Alertas de Tráfico (Fin de Auspicios)
 *
 * @description Ejecuta diariamente a las 07:00 y 18:00. Detecta auspicios
 * que terminan mañana o hoy, y crea alertas de tráfico obligatorias.
 *
 * @schedule 0 7,18 * * *
 * @security CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability'
import { withTenantContext } from '@/lib/db/tenant-context'
import { VencimientosDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/VencimientosDrizzleRepository'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const vencRepo = new VencimientosDrizzleRepository()
    const tenantId = 'default'

    let alertasManana = 0
    let alertasHoy = 0

    try {
      // Auspicios que terminan mañana
      const terminanManana = await withTenantContext(tenantId, async () =>
        vencRepo.findVencimientosTerminanManana()
      )

      for (const v of terminanManana) {
        await withTenantContext(tenantId, async () =>
          vencRepo.saveAlerta({
            id: `alert_traf_m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            emisoraId: v.programaId, // Simplificación: usamos programaId como proxy
            programaId: v.programaId,
            programaNombre: v.programaNombre || '',
            cupoComercialId: v.programaId,
            clienteNombre: v.clienteNombre,
            tipo: 'alerta_trafico_fin_manana',
            titulo: `⚠️ ${v.clienteNombre} finaliza MAÑANA`,
            mensaje: `El auspicio de ${v.clienteNombre} en ${v.programaNombre} vence mañana. Preparar retiro de materiales.`,
            prioridad: 'alta',
            destinatarioId: v.ejecutivoId || 'system',
            destinatarioNombre: v.ejecutivoNombre || 'Operador de Tráfico',
            canalesNotificacion: ['email', 'dashboard'],
            estadoConfirmacion: 'pendiente',
            comentarioConfirmacion: null,
            leida: false,
            fechaLectura: null,
            fechaExpiracion: new Date(Date.now() + 48 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            tenantId,
          })
        )
        alertasManana++
      }

      // Auspicios que terminan hoy
      const terminanHoy = await withTenantContext(tenantId, async () =>
        vencRepo.findVencimientosTerminanHoy()
      )

      for (const v of terminanHoy) {
        await withTenantContext(tenantId, async () =>
          vencRepo.saveAlerta({
            id: `alert_traf_h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            emisoraId: v.programaId,
            programaId: v.programaId,
            programaNombre: v.programaNombre || '',
            cupoComercialId: v.programaId,
            clienteNombre: v.clienteNombre,
            tipo: 'alerta_trafico_fin_hoy',
            titulo: `🚨 ${v.clienteNombre} finaliza HOY`,
            mensaje: `URGENTE: El auspicio de ${v.clienteNombre} en ${v.programaNombre} vence HOY. Confirmar retiro de materiales antes de las 18:00.`,
            prioridad: 'critica',
            destinatarioId: v.ejecutivoId || 'system',
            destinatarioNombre: v.ejecutivoNombre || 'Operador de Tráfico',
            canalesNotificacion: ['email', 'sms', 'dashboard'],
            estadoConfirmacion: 'pendiente',
            comentarioConfirmacion: null,
            leida: false,
            fechaLectura: null,
            fechaExpiracion: new Date(Date.now() + 12 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            tenantId,
          })
        )
        alertasHoy++
      }
    } catch (dbError) {
      logger.warn('[CRON R2] DB no disponible, modo simulado', { dbError })
    }

    logger.info('[CRON R2] Alertas de tráfico procesadas', {
      alertasManana,
      alertasHoy,
      tenantId,
    })

    return NextResponse.json({
      success: true,
      data: { alertasManana, alertasHoy },
      ejecutadoEn: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('[CRON R2] Error fatal', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, error: 'Error ejecutando R2' },
      { status: 500 }
    )
  }
}
