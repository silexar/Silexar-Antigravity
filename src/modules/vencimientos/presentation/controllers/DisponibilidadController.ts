/**
 * CONTROLLER: DISPONIBILIDAD - TIER 0 ENTERPRISE FASE 3
 */

import { NextRequest, NextResponse } from 'next/server'

export class DisponibilidadController {
  /** GET /api/vencimientos/disponibilidad?emisoraId=X&programaId=Y&fecha=Z */
  static async getDisponibilidad(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url)
    const emisoraId = searchParams.get('emisoraId')
    if (!emisoraId) return NextResponse.json({ error: 'emisoraId requerido' }, { status: 400 })

    // Mock response
    return NextResponse.json({
      success: true,
      data: {
        emisoraId,
        programas: [
          { programaId: 'p1', nombre: 'Buenos Días Radio', cuposTipoA: { total: 4, disponibles: 0 }, cuposTipoB: { total: 3, disponibles: 1 }, cuposMenciones: { total: 20, disponibles: 2 }, ocupacion: 89, saludInventario: 'saludable' },
          { programaId: 'p2', nombre: 'Noticiero Central', cuposTipoA: { total: 3, disponibles: 0 }, cuposTipoB: { total: 2, disponibles: 1 }, cuposMenciones: { total: 15, disponibles: 5 }, ocupacion: 70, saludInventario: 'saludable' }
        ]
      }
    })
  }

  /** GET /api/vencimientos/disponibilidad/periodo */
  static async getDisponibilidadPeriodo(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url)
    const emisoraId = searchParams.get('emisoraId')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (!emisoraId || !desde || !hasta) {
      return NextResponse.json({ error: 'emisoraId, desde y hasta requeridos' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { emisoraId, periodo: { desde, hasta }, ocupacionPromedio: 76, diasAnalizados: 30 }
    })
  }
}
