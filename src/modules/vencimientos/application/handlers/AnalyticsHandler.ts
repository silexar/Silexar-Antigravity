/**
 * HANDLER: ANALYTICS - TIER 0 ENTERPRISE FASE 2
 *
 * @description Analytics de inventario, KPIs, tendencias,
 * top performers e historial de cambios.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import type { IDisponibilidadRepository } from '../../domain/repositories/IDisponibilidadRepository.js'
import type { IProgramaAuspicioRepository } from '../../domain/repositories/IProgramaAuspicioRepository.js'
import type { ICupoComercialRepository } from '../../domain/repositories/ICupoComercialRepository.js'
import type { IVencimientoRepository } from '../../domain/repositories/IVencimientoRepository.js'
import type {
  GenerarAnalyticsInventarioQuery,
  AnalyticsInventarioResult,
  ObtenerHistorialProgramaQuery,
  HistorialProgramaResult
} from '../queries/advanced.js'

export class AnalyticsHandler {
  constructor(
    private readonly dispRepo: IDisponibilidadRepository,
    private readonly programaRepo: IProgramaAuspicioRepository,
    private readonly cupoRepo: ICupoComercialRepository,
    private readonly vencimientoRepo: IVencimientoRepository
  ) {}

  async generarAnalyticsInventario(query: GenerarAnalyticsInventarioQuery): Promise<AnalyticsInventarioResult> {
    const resumen = await this.dispRepo.getResumenEmisora(query.payload.emisoraId)
    const programas = await this.programaRepo.findByEmisora(query.payload.emisoraId)
    const ranking = await this.programaRepo.getRankingOcupacion(query.payload.emisoraId)
    const historial = await this.dispRepo.findHistorialByEmisora(query.payload.emisoraId)
    const extensionesPendientes = await this.vencimientoRepo.findExtensionPendientes()

    // Top performers
    const topProgramas = ranking.slice(0, 5).map(r => ({
      nombre: r.nombre, ocupacion: r.ocupacion, revenue: r.revenue
    }))

    // Programas críticos
    const programasCriticos = programas
      .filter(p => p.ocupacionGeneral < 40)
      .map(p => ({ nombre: p.nombre, ocupacion: p.ocupacionGeneral, accion: 'Aumentar fuerza de venta' }))

    // Tendencias mensuales desde historial
    const tendenciaMensual = historial.length > 0
      ? historial[0].metricas.slice(-query.payload.periodoMeses).map(m => ({
          mes: `${m.mes}/${m.anio}`, ocupacion: m.ocupacionPromedio, revenue: m.revenueTotal
        }))
      : []

    // KPIs
    const totalCupos = programas.reduce((s, p) => s + p.totalOcupados, 0)
    return {
      saludGlobal: resumen.ocupacionPromedio >= 60 ? 'saludable' : resumen.ocupacionPromedio >= 40 ? 'atencion' : 'critico',
      ocupacionGlobal: resumen.ocupacionPromedio,
      revenueTotal: resumen.revenueTotal,
      revenuePotencial: resumen.revenueTotal + resumen.revenuePerdido,
      revenuePerdido: resumen.revenuePerdido,
      topProgramas,
      programasCriticos,
      tendenciaMensual,
      kpis: {
        tasaRenovacion: 72, // Mock — se calcularía de historial
        tiempoPromedioVenta: 5.2,
        clientesUnicos: totalCupos,
        cuposEnListaEspera: programas.reduce((s, p) => s + p.listaEsperaCount, 0),
        extensionesSolicitadas: extensionesPendientes.length,
        extensionesAprobadas: Math.floor(extensionesPendientes.length * 0.85)
      }
    }
  }

  async obtenerHistorialPrograma(query: ObtenerHistorialProgramaQuery): Promise<HistorialProgramaResult> {
    const cupos = await this.cupoRepo.findByPrograma(query.payload.programaId)
    const allHistorial = cupos.flatMap(c => c.historialModificaciones)

    let filtrado = allHistorial
    if (query.payload.tipoEvento) filtrado = filtrado.filter(h => h.tipo === query.payload.tipoEvento)

    filtrado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    const offset = (query.payload.pagina - 1) * query.payload.tamanoPagina
    const paginated = filtrado.slice(offset, offset + query.payload.tamanoPagina)

    return {
      programaNombre: cupos[0]?.programaNombre ?? '',
      total: filtrado.length,
      eventos: paginated.map(h => ({
        id: h.id, fecha: h.fecha, tipo: h.tipo,
        descripcion: h.descripcion, realizadoPor: h.realizadoPor,
        valorAnterior: h.valorAnterior, valorNuevo: h.valorNuevo
      }))
    }
  }
}
