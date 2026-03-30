/**
 * ENTIDAD: TANDA COMERCIAL - TIER 0 ENTERPRISE
 *
 * @description Tipos de tanda (Prime AM/PM, Repartida, Noche)
 * con tarifas por duración y factor multiplicador.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { DuracionSegundos, type DuracionValida } from '../value-objects/DuracionSegundos.js'

export type TipoTanda = 'prime_am' | 'prime_pm' | 'repartida' | 'noche' | 'madrugada'

export interface TarifaDuracion {
  duracionSegundos: DuracionValida
  precio: number
}

export interface TandaComercialProps {
  id: string
  emisoraId: string
  emisoraNombre: string
  tipo: TipoTanda
  nombre: string
  horaInicio: string
  horaFin: string
  factorMultiplicador: number
  audienciaPromedio: number
  ratingPromedio: number
  tarifasPorDuracion: TarifaDuracion[]
  estado: 'activa' | 'inactiva'
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class TandaComercial {
  private constructor(private props: TandaComercialProps) {}

  static create(props: Omit<TandaComercialProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): TandaComercial {
    const now = new Date()
    return new TandaComercial({
      ...props,
      id: `tanda_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: TandaComercialProps): TandaComercial {
    return new TandaComercial(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get emisoraId(): string { return this.props.emisoraId }
  get tipo(): TipoTanda { return this.props.tipo }
  get nombre(): string { return this.props.nombre }
  get horaInicio(): string { return this.props.horaInicio }
  get horaFin(): string { return this.props.horaFin }
  get factorMultiplicador(): number { return this.props.factorMultiplicador }
  get audienciaPromedio(): number { return this.props.audienciaPromedio }
  get ratingPromedio(): number { return this.props.ratingPromedio }
  get tarifasPorDuracion(): TarifaDuracion[] { return [...this.props.tarifasPorDuracion] }
  get estado(): string { return this.props.estado }
  get version(): number { return this.props.version }

  get tipoLabel(): string {
    const labels: Record<TipoTanda, string> = {
      'prime_am': '🏆 PRIME AM', 'prime_pm': '🥇 PRIME PM',
      'repartida': '📊 Repartida', 'noche': '🌙 Noche', 'madrugada': '🌠 Madrugada'
    }
    return labels[this.props.tipo]
  }

  get rangoHorario(): string { return `${this.props.horaInicio}-${this.props.horaFin}` }

  esPrime(): boolean { return this.props.tipo === 'prime_am' || this.props.tipo === 'prime_pm' }

  /** Obtener precio por duración específica */
  getPrecio(duracion: DuracionSegundos): number {
    const tarifa = this.props.tarifasPorDuracion.find(t => t.duracionSegundos === duracion.valor)
    return tarifa?.precio ?? 0
  }

  /** Actualizar tarifas */
  actualizarTarifas(nuevasTarifas: TarifaDuracion[]): void {
    this.props.tarifasPorDuracion = [...nuevasTarifas]
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  /** Generar tarifas automáticamente para el set común de duraciones.
   * Ahora soporta de 1 a 90, pero por defecto rellenamos las "clásicas" para legacy.
   */
  generarTarifasDesdeBase(precioBase30s: number): void {
    const duracionesComunes = [5, 10, 15, 20, 30, 45, 60]
    this.props.tarifasPorDuracion = duracionesComunes.map(d => {
      const segs = DuracionSegundos.create(d)
      return {
        duracionSegundos: segs.valor,
        precio: Math.round(segs.calcularPrecio(precioBase30s) * this.props.factorMultiplicador)
      }
    })
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  toSnapshot(): TandaComercialProps { return { ...this.props } }
}
