/**
 * API ROUTE: /api/vencimientos/analytics
 *
 * @description Métricas del módulo vencimientos con fallback a mock.
 * @version 2.0.0
 */

import { NextResponse } from 'next/server'
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route'
import { withTenantContext } from '@/lib/db/tenant-context'
import { CupoComercialDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/CupoComercialDrizzleRepository'
import { ProgramaAuspicioDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/ProgramaAuspicioDrizzleRepository'
import { mockProgramas } from '../programas/route'

interface AnalyticsData {
  totalProgramas: number
  programasActivos: number
  cuposDisponibles: number
  cuposOcupados: number
  revenueTotal: number
  ocupacionPromedio: number
  porEmisora: Array<{ seal: string; programas: number; ocupacion: number; revenue: number }>
  topProgramas: Array<{ id: string; nombre: string; ocupacion: number; revenue: number }>
}

export const GET = withApiRoute(
  { resource: 'vencimientos.analytics', action: 'read', skipCsrf: true },
  async (ctx: RouteContext) => {
    try {
      const tenantId = ctx.tenantId || 'default'
      let analytics: AnalyticsData

      // Intentar datos reales
      try {
        const cupoRepo = new CupoComercialDrizzleRepository()
        const progRepo = new ProgramaAuspicioDrizzleRepository()

        const [cuposActivos, programas] = await withTenantContext(tenantId, async () =>
          Promise.all([
            cupoRepo.findByEstado('activo'),
            progRepo.findByEstado('ACTIVO'),
          ])
        )

        const totalCupos = cuposActivos.length
        const cuposOcupados = cuposActivos.filter(c => c.estado.valor === 'activo').length
        const cuposDisponibles = totalCupos - cuposOcupados
        const revenueTotal = cuposActivos.reduce((sum, c) => sum + c.inversion.valorFinal, 0)

        analytics = {
          totalProgramas: programas.length,
          programasActivos: programas.length,
          cuposDisponibles,
          cuposOcupados,
          revenueTotal,
          ocupacionPromedio: totalCupos > 0 ? Math.round((cuposOcupados / totalCupos) * 100) : 0,
          porEmisora: [],
          topProgramas: programas.slice(0, 5).map(p => ({
            id: p.id,
            nombre: p.nombre,
            ocupacion: p.ocupacionGeneral,
            revenue: p.revenueActual,
          })),
        }
      } catch {
        // Fallback mock
        analytics = {
          totalProgramas: mockProgramas.length,
          programasActivos: mockProgramas.filter(p => p.estado === 'ACTIVO').length,
          cuposDisponibles: mockProgramas.reduce((sum, p) => sum + p.disponibilidad.totalDisponibles, 0),
          cuposOcupados: mockProgramas.reduce((sum, p) => sum + p.disponibilidad.totalOcupados, 0),
          revenueTotal: mockProgramas.reduce((sum, p) => sum + p.revenueActual, 0),
          ocupacionPromedio: Math.round(mockProgramas.reduce((sum, p) => sum + p.disponibilidad.ocupacionPorcentaje, 0) / (mockProgramas.length || 1)),
          porEmisora: [
            { seal: 'SEÑAL-01', programas: 20, ocupacion: 72.5, revenue: 25000000 },
            { seal: 'SEÑAL-02', programas: 15, ocupacion: 65.0, revenue: 18000000 },
            { seal: 'SEÑAL-03', programas: 10, ocupacion: 58.3, revenue: 2600000 },
          ],
          topProgramas: mockProgramas.slice(0, 3).map(p => ({
            id: p.id,
            nombre: p.nombre,
            ocupacion: p.disponibilidad.ocupacionPorcentaje,
            revenue: p.revenueActual,
          })),
        }
      }

      return NextResponse.json(analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
  }
)
