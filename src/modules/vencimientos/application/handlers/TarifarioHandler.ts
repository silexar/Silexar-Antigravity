/**
 * HANDLER: TARIFARIO - TIER 0 ENTERPRISE
 *
 * @description Configuración y cálculo de tarifas con pricing dinámico.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { TarifarioPrograma } from '../../domain/entities/TarifarioPrograma.js'
import { ValorComercial } from '../../domain/value-objects/ValorComercial.js'
import type { ITarifarioRepository } from '../../domain/repositories/ITarifarioRepository.js'
import type { IProgramaAuspicioRepository } from '../../domain/repositories/IProgramaAuspicioRepository.js'
import type { ConfigurarTarifarioCommand } from '../commands/index.js'
import type { ObtenerTarifarioActualQuery, TarifarioActualResult } from '../queries/index.js'

export class TarifarioHandler {
  constructor(
    private readonly tarifarioRepo: ITarifarioRepository,
    private readonly programaRepo: IProgramaAuspicioRepository
  ) {}

  async configurarTarifario(command: ConfigurarTarifarioCommand): Promise<{ success: boolean; tarifarioId?: string; error?: string }> {
    try {
      const programa = await this.programaRepo.findById(command.payload.programaId)
      if (!programa) return { success: false, error: 'Programa no encontrado' }

      const tarifario = TarifarioPrograma.create({
        programaId: command.payload.programaId,
        programaNombre: programa.nombre,
        emisoraId: command.payload.emisoraId,
        precioBaseTipoA: ValorComercial.sinDescuento(command.payload.precioBaseTipoA, command.payload.moneda),
        precioBaseTipoB: ValorComercial.sinDescuento(command.payload.precioBaseTipoB, command.payload.moneda),
        precioBaseMencion: ValorComercial.sinDescuento(command.payload.precioBaseMencion, command.payload.moneda),
        factoresActivos: [],
        paquetesDescuento: [
          { nombre: 'Pack 10 menciones', cantidadMinima: 10, descuentoPorcentaje: 5 },
          { nombre: 'Pack 20 menciones', cantidadMinima: 20, descuentoPorcentaje: 10 },
          { nombre: 'Pack 50 menciones', cantidadMinima: 50, descuentoPorcentaje: 18 }
        ],
        vigenciaDesde: command.payload.vigenciaDesde,
        vigenciaHasta: command.payload.vigenciaHasta,
        revisionAutomatica: 'mensual',
        ajusteInflacion: false,
        porcentajeInflacion: 0,
        creadoPor: command.payload.configuradoPor,
        actualizadoPor: command.payload.configuradoPor
      })

      await this.tarifarioRepo.saveTarifario(tarifario)
      return { success: true, tarifarioId: tarifario.id }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  async obtenerTarifarioActual(query: ObtenerTarifarioActualQuery): Promise<TarifarioActualResult | null> {
    const tarifario = await this.tarifarioRepo.findTarifarioVigente(query.payload.programaId)
    if (!tarifario) return null

    return {
      programaId: tarifario.programaId,
      programaNombre: tarifario.programaNombre,
      preciosTipoA: {
        valorBase: tarifario.precioBaseTipoA.valorBase,
        valorConFactores: tarifario.calcularPrecioAuspicio('tipo_a'),
        moneda: tarifario.precioBaseTipoA.moneda
      },
      preciosTipoB: {
        valorBase: tarifario.precioBaseTipoB.valorBase,
        valorConFactores: tarifario.calcularPrecioAuspicio('tipo_b'),
        moneda: tarifario.precioBaseTipoB.moneda
      },
      preciosMencion: {
        valorBase: tarifario.precioBaseMencion.valorBase,
        valorConFactores: tarifario.calcularPrecioAuspicio('solo_menciones'),
        moneda: tarifario.precioBaseMencion.moneda
      },
      factoresActivos: tarifario.factoresActivos.map(f => ({
        motivo: f.motivo, valor: f.valor, descripcion: f.descripcion
      })),
      tablaPreciosPorDuracion: tarifario.generarTablaPrecios(tarifario.precioBaseMencion.valorBase).map(t => ({
        duracion: t.duracion.segundos,
        precioBase: t.precioBase,
        precioFinal: t.precioConFactor
      })),
      paquetesDescuento: tarifario.paquetesDescuento.map(p => ({
        nombre: p.nombre, cantidadMinima: p.cantidadMinima, descuento: p.descuentoPorcentaje
      }))
    }
  }
}
