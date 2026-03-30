/**
 * CONTROLLER: MOBILE VENCIMIENTOS - TIER 0 ENTERPRISE FASE 3
 */

import { NextRequest, NextResponse } from 'next/server'

export class MobileVencimientosController {
  /** GET /api/vencimientos/mobile/dashboard */
  static async getDashboard(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url)
    const emisoraId = searchParams.get('emisoraId')

    return NextResponse.json({
      success: true,
      data: {
        emisora: { id: emisoraId, nombre: 'Radio Futuro FM', ocupacion: 81, revenue: 45_000_000, alertas: 3 },
        kpisRapidos: { ocupacion: 81, revenue: 45_000_000, alertas: 3 },
        alertasUrgentes: [
          { id: 'a1', cliente: 'Coca-Cola', tipo: 'fin_hoy', urgencia: 'critica' },
          { id: 'a2', cliente: 'Entel', tipo: 'no_iniciado', urgencia: 'critica', countdown: 22 }
        ],
        programasResumen: [
          { nombre: 'Buenos Días Radio', ocupacion: 89, cupos: '24/27' },
          { nombre: 'Drive Time PM', ocupacion: 78, cupos: '21/27' }
        ]
      }
    })
  }

  /** GET /api/vencimientos/mobile/consulta-rapida */
  static async consultaRapida(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url)
    const programaId = searchParams.get('programaId')

    return NextResponse.json({
      success: true,
      data: {
        programaId,
        disponible: true,
        cuposLibres: { tipoA: 0, tipoB: 1, menciones: 2 },
        precioDesde: 450_000,
        listaEspera: { tipoA: 2, tipoB: 0, menciones: 0 }
      }
    })
  }

  /** GET /api/vencimientos/mobile/oportunidades */
  static async getOportunidades(): Promise<NextResponse> {
    return NextResponse.json({
      success: true,
      data: {
        oportunidades: [
          { tipo: 'upsell', titulo: 'Upgrade Coca-Cola', revenueEstimado: 1_200_000, prioridad: 9 },
          { tipo: 'retencion', titulo: 'Plan retención Entel', revenueEstimado: 2_000_000, prioridad: 10 }
        ]
      }
    })
  }
}
