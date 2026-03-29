/**
 * CONTROLLER: ALERTAS - TIER 0 ENTERPRISE FASE 3
 */

import { NextRequest, NextResponse } from 'next/server'

export class AlertasController {
  /** GET /api/vencimientos/alertas?programadorId=X */
  static async getAlertas(): Promise<NextResponse> {

    return NextResponse.json({
      success: true,
      data: {
        total: 6, noLeidas: 3, pendientesConfirmacion: 2,
        alertas: [
          { id: 'a1', tipo: 'fin_hoy', titulo: 'Coca-Cola finaliza HOY', prioridad: 'critica', clienteNombre: 'Coca-Cola', programaNombre: 'Buenos Días Radio', leida: false },
          { id: 'a2', tipo: 'fin_manana', titulo: 'Santander finaliza MAÑANA', prioridad: 'alta', clienteNombre: 'Banco Santander', programaNombre: 'Noticiero Central', leida: false },
          { id: 'a3', tipo: 'no_iniciado', titulo: 'Entel no ha iniciado (48h)', prioridad: 'critica', clienteNombre: 'Entel', programaNombre: 'Tarde Deportiva', leida: true }
        ]
      }
    })
  }

  /** POST /api/vencimientos/alertas/:id/confirmar */
  static async confirmarAlerta(req: NextRequest): Promise<NextResponse> {
    const body = await req.json()
    return NextResponse.json({ success: true, alertaId: body.alertaId, confirmada: true })
  }

  /** POST /api/vencimientos/alertas/:id/leer */
  static async marcarLeida(req: NextRequest): Promise<NextResponse> {
    const body = await req.json()
    return NextResponse.json({ success: true, alertaId: body.alertaId, leida: true })
  }
}
