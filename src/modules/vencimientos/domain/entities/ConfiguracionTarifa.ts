/**
 * ENTIDAD: CONFIGURACIÓN DE TARIFA - TIER 0 ENTERPRISE
 *
 * @description Pricing por duración/horario con factores de ajuste y vigencia.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { DuracionSegundos, type DuracionValida } from '../value-objects/DuracionSegundos.js'

export interface PrecioConfiguracion {
  duracion: DuracionValida
  precioBase: number
  precioConAjuste: number
}

export interface ConfiguracionTarifaProps {
  id: string
  emisoraId: string
  emisoraNombre: string
  nombre: string
  descripcion: string
  precios: PrecioConfiguracion[]
  factorHorarioAM: number
  factorHorarioPM: number
  factorRepartida: number
  factorNoche: number
  ajusteIPC: boolean
  porcentajeIPC: number
  vigenciaDesde: Date
  vigenciaHasta: Date
  estado: 'vigente' | 'borrador' | 'vencida'
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class ConfiguracionTarifa {
  private constructor(private props: ConfiguracionTarifaProps) {}

  static create(props: Omit<ConfiguracionTarifaProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): ConfiguracionTarifa {
    const now = new Date()
    return new ConfiguracionTarifa({
      ...props,
      id: `cfg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: ConfiguracionTarifaProps): ConfiguracionTarifa {
    return new ConfiguracionTarifa(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get emisoraId(): string { return this.props.emisoraId }
  get nombre(): string { return this.props.nombre }
  get precios(): PrecioConfiguracion[] { return [...this.props.precios] }
  get estado(): string { return this.props.estado }
  get version(): number { return this.props.version }

  estaVigente(): boolean {
    const hoy = new Date()
    return hoy >= this.props.vigenciaDesde && hoy <= this.props.vigenciaHasta && this.props.estado === 'vigente'
  }

  /** Calcular precio para una duración y franja horaria */
  calcularPrecio(duracion: DuracionSegundos, franja: 'prime_am' | 'prime_pm' | 'repartida' | 'noche'): number {
    const config = this.props.precios.find(p => p.duracion === duracion.valor)
    if (!config) return 0

    const factores: Record<string, number> = {
      'prime_am': this.props.factorHorarioAM,
      'prime_pm': this.props.factorHorarioPM,
      'repartida': this.props.factorRepartida,
      'noche': this.props.factorNoche
    }

    let precio = config.precioBase * (factores[franja] || 1)
    if (this.props.ajusteIPC) precio *= (1 + this.props.porcentajeIPC / 100)
    return Math.round(precio)
  }

  /** Generar precios automáticos desde precio base 30" */
  generarDesdeBase(precioBase30s: number): void {
    this.props.precios = DuracionSegundos.todasLasDuraciones().map(d => ({
      duracion: d.valor,
      precioBase: d.calcularPrecio(precioBase30s),
      precioConAjuste: Math.round(d.calcularPrecio(precioBase30s) * (this.props.ajusteIPC ? 1 + this.props.porcentajeIPC / 100 : 1))
    }))
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  activar(): void { this.props.estado = 'vigente' }
  desactivar(): void { this.props.estado = 'vencida' }

  toSnapshot(): ConfiguracionTarifaProps { return { ...this.props } }
}
