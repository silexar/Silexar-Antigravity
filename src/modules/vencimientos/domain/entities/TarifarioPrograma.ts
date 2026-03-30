/**
 * ENTIDAD: TARIFARIO PROGRAMA - TIER 0 ENTERPRISE
 *
 * @description Precios dinámicos por programa con factores de ajuste
 * estacionales, demanda, rating y paquetes de descuento.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { ValorComercial } from '../value-objects/ValorComercial.js'
import { FactorTarifa } from '../value-objects/FactorTarifa.js'
import { DuracionSegundos } from '../value-objects/DuracionSegundos.js'

export interface TarifaPorDuracion {
  duracion: DuracionSegundos
  precioBase: number
  precioConFactor: number
}

export interface PaqueteDescuento {
  nombre: string
  cantidadMinima: number
  descuentoPorcentaje: number
}

export interface TarifarioProgramaProps {
  id: string
  programaId: string
  programaNombre: string
  emisoraId: string

  // Precios base por tipo
  precioBaseTipoA: ValorComercial
  precioBaseTipoB: ValorComercial
  precioBaseMencion: ValorComercial

  // Factores activos
  factoresActivos: FactorTarifa[]

  // Paquetes de descuento para menciones
  paquetesDescuento: PaqueteDescuento[]

  // Configuración temporal
  vigenciaDesde: Date
  vigenciaHasta: Date
  revisionAutomatica: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  ajusteInflacion: boolean
  porcentajeInflacion: number

  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor: string
  actualizadoPor: string
  version: number
}

export class TarifarioPrograma {
  private _domainEvents: string[] = []

  private constructor(private props: TarifarioProgramaProps) {}

  static create(props: Omit<TarifarioProgramaProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): TarifarioPrograma {
    const now = new Date()
    return new TarifarioPrograma({
      ...props,
      id: `tar_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: TarifarioProgramaProps): TarifarioPrograma {
    return new TarifarioPrograma(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get programaNombre(): string { return this.props.programaNombre }
  get emisoraId(): string { return this.props.emisoraId }
  get precioBaseTipoA(): ValorComercial { return this.props.precioBaseTipoA }
  get precioBaseTipoB(): ValorComercial { return this.props.precioBaseTipoB }
  get precioBaseMencion(): ValorComercial { return this.props.precioBaseMencion }
  get factoresActivos(): FactorTarifa[] { return [...this.props.factoresActivos] }
  get paquetesDescuento(): PaqueteDescuento[] { return [...this.props.paquetesDescuento] }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  /** Revenue potencial mensual total */
  get revenuePotencialMensual(): number {
    return this.props.precioBaseTipoA.valorFinal * 8 +  // 8 cupos Tipo A estándar
           this.props.precioBaseTipoB.valorFinal * 4 +  // 4 cupos Tipo B estándar
           this.props.precioBaseMencion.valorFinal * 20  // 20 menciones estándar
  }

  /** Factor combinado actual */
  get factorCombinado(): number {
    const vigentes = this.props.factoresActivos.filter(f => f.estaVigente())
    return vigentes.reduce((acum, f) => acum * f.valor, 1)
  }

  // ── Métodos de cálculo ──

  /** Calcula precio de un auspicio por tipo con factores aplicados */
  calcularPrecioAuspicio(tipo: 'tipo_a' | 'tipo_b' | 'solo_menciones'): number {
    let base: number
    switch (tipo) {
      case 'tipo_a': base = this.props.precioBaseTipoA.valorFinal; break
      case 'tipo_b': base = this.props.precioBaseTipoB.valorFinal; break
      case 'solo_menciones': base = this.props.precioBaseMencion.valorFinal; break
    }
    return Math.round(base * this.factorCombinado)
  }

  /** Genera tabla de tarifas por duración usando precio base de 30" */
  generarTablaPrecios(precioBase30s: number): TarifaPorDuracion[] {
    return DuracionSegundos.todasLasDuraciones().map(duracion => ({
      duracion,
      precioBase: duracion.calcularPrecio(precioBase30s),
      precioConFactor: Math.round(duracion.calcularPrecio(precioBase30s) * this.factorCombinado)
    }))
  }

  /** Calcula precio de un paquete de menciones con descuento */
  calcularPaqueteMenciones(cantidad: number): { precioTotal: number; descuento: number; precioUnitario: number } {
    const precioUnitario = this.props.precioBaseMencion.valorFinal
    const paquete = this.props.paquetesDescuento
      .sort((a, b) => b.cantidadMinima - a.cantidadMinima)
      .find(p => cantidad >= p.cantidadMinima)

    const descuento = paquete ? paquete.descuentoPorcentaje : 0
    const precioTotal = Math.round(precioUnitario * cantidad * (1 - descuento / 100))

    return { precioTotal, descuento, precioUnitario }
  }

  // ── Métodos de modificación ──

  agregarFactor(factor: FactorTarifa, responsable: string): void {
    this.props.factoresActivos.push(factor)
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`FactorAgregado: ${factor.descripcion}`)
  }

  removerFactor(motivo: string, responsable: string): void {
    this.props.factoresActivos = this.props.factoresActivos.filter(f => f.motivo !== motivo as FactorTarifa['motivo'])
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  actualizarPrecioBase(tipo: 'tipo_a' | 'tipo_b' | 'mencion', nuevoPrecio: ValorComercial, responsable: string): void {
    switch (tipo) {
      case 'tipo_a': this.props.precioBaseTipoA = nuevoPrecio; break
      case 'tipo_b': this.props.precioBaseTipoB = nuevoPrecio; break
      case 'mencion': this.props.precioBaseMencion = nuevoPrecio; break
    }
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`PrecioActualizado: ${tipo} → ${nuevoPrecio.valorFormateado}`)
  }

  estaVigente(): boolean {
    const hoy = new Date()
    return hoy >= this.props.vigenciaDesde && hoy <= this.props.vigenciaHasta
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): TarifarioProgramaProps { return { ...this.props } }
}
