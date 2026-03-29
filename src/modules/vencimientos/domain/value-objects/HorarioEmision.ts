/**
 * VALUE OBJECT: HORARIO DE EMISIÓN - TIER 0 ENTERPRISE
 *
 * @description Horario de emisión con validaciones de rango, días de emisión,
 * y clasificación automática por franja (Prime AM, Prime PM, Repartida, Noche).
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type FranjaHoraria = 'prime_am' | 'prime_pm' | 'repartida' | 'noche' | 'madrugada'
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export interface HorarioEmisionProps {
  horaInicio: string   // Formato "HH:mm"
  horaFin: string      // Formato "HH:mm"
  diasEmision: DiaSemana[]
}

export class HorarioEmision {
  private constructor(
    private readonly _horaInicio: string,
    private readonly _horaFin: string,
    private readonly _diasEmision: DiaSemana[]
  ) {}

  static create(props: HorarioEmisionProps): HorarioEmision {
    HorarioEmision.validate(props)
    return new HorarioEmision(props.horaInicio, props.horaFin, [...props.diasEmision])
  }

  static fromPersistence(props: HorarioEmisionProps): HorarioEmision {
    return new HorarioEmision(props.horaInicio, props.horaFin, [...props.diasEmision])
  }

  private static validate(props: HorarioEmisionProps): void {
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!regexHora.test(props.horaInicio)) {
      throw new Error(`Hora inicio inválida: ${props.horaInicio}. Formato requerido: HH:mm`)
    }
    if (!regexHora.test(props.horaFin)) {
      throw new Error(`Hora fin inválida: ${props.horaFin}. Formato requerido: HH:mm`)
    }
    if (props.diasEmision.length === 0) {
      throw new Error('Debe seleccionar al menos un día de emisión')
    }
    const diasValidos: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    for (const dia of props.diasEmision) {
      if (!diasValidos.includes(dia)) {
        throw new Error(`Día de emisión inválido: ${dia}`)
      }
    }
  }

  // ── Getters ──
  get horaInicio(): string { return this._horaInicio }
  get horaFin(): string { return this._horaFin }
  get diasEmision(): DiaSemana[] { return [...this._diasEmision] }

  /** Clasificación automática de franja horaria basada en hora de inicio */
  get franja(): FranjaHoraria {
    const hora = this.horaInicioMinutos
    if (hora >= 0 && hora < 360) return 'madrugada'     // 00:00 - 05:59
    if (hora >= 360 && hora < 600) return 'prime_am'      // 06:00 - 09:59
    if (hora >= 600 && hora < 1020) return 'repartida'    // 10:00 - 16:59
    if (hora >= 1020 && hora < 1200) return 'prime_pm'    // 17:00 - 19:59
    return 'noche'                                         // 20:00 - 23:59
  }

  get franjaDescripcion(): string {
    const descripciones: Record<FranjaHoraria, string> = {
      'prime_am': 'Prime AM (06:00-10:00)',
      'prime_pm': 'Prime PM (17:00-20:00)',
      'repartida': 'Repartida Estándar (10:00-17:00)',
      'noche': 'Noche (20:00-00:00)',
      'madrugada': 'Madrugada (00:00-06:00)'
    }
    return descripciones[this.franja]
  }

  get franjaColor(): string {
    const colores: Record<FranjaHoraria, string> = {
      'prime_am': 'bg-amber-500',
      'prime_pm': 'bg-orange-500',
      'repartida': 'bg-blue-500',
      'noche': 'bg-indigo-800',
      'madrugada': 'bg-slate-700'
    }
    return colores[this.franja]
  }

  get factorMultiplicador(): number {
    const factores: Record<FranjaHoraria, number> = {
      'prime_am': 2.5,
      'prime_pm': 2.2,
      'repartida': 1.0,
      'noche': 0.7,
      'madrugada': 0.4
    }
    return factores[this.franja]
  }

  /** Duración total del programa en minutos */
  get duracionMinutos(): number {
    const diff = this.horaFinMinutos - this.horaInicioMinutos
    return diff > 0 ? diff : diff + 1440 // Manejo de cruce medianoche
  }

  get esDiasSemana(): boolean {
    const diasSemana: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    return this._diasEmision.every(d => diasSemana.includes(d))
  }

  get esFinDeSemana(): boolean {
    return this._diasEmision.every(d => d === 'sabado' || d === 'domingo')
  }

  get totalDiasEmision(): number {
    return this._diasEmision.length
  }

  get descripcionDias(): string {
    if (this.esDiasSemana && this._diasEmision.length === 5) return 'Lunes a Viernes'
    if (this.esFinDeSemana && this._diasEmision.length === 2) return 'Sábado y Domingo'
    if (this._diasEmision.length === 7) return 'Todos los días'
    return this._diasEmision.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')
  }

  // ── Métodos privados ──
  private get horaInicioMinutos(): number {
    const [h, m] = this._horaInicio.split(':').map(Number)
    return h * 60 + m
  }

  private get horaFinMinutos(): number {
    const [h, m] = this._horaFin.split(':').map(Number)
    return h * 60 + m
  }

  // ── Métodos de consulta ──
  contieneDia(dia: DiaSemana): boolean {
    return this._diasEmision.includes(dia)
  }

  seSolapaCon(otro: HorarioEmision): boolean {
    const tienenDiasComunes = this._diasEmision.some(d => otro._diasEmision.includes(d))
    if (!tienenDiasComunes) return false
    return this.horaInicioMinutos < otro.horaFinMinutos && this.horaFinMinutos > otro.horaInicioMinutos
  }

  esPrime(): boolean {
    return this.franja === 'prime_am' || this.franja === 'prime_pm'
  }

  // ── Comparación ──
  equals(other: HorarioEmision): boolean {
    return this._horaInicio === other._horaInicio &&
           this._horaFin === other._horaFin &&
           this._diasEmision.length === other._diasEmision.length &&
           this._diasEmision.every(d => other._diasEmision.includes(d))
  }

  toString(): string {
    return `${this.descripcionDias} ${this._horaInicio}-${this._horaFin}`
  }

  toJSON(): HorarioEmisionProps {
    return {
      horaInicio: this._horaInicio,
      horaFin: this._horaFin,
      diasEmision: [...this._diasEmision]
    }
  }
}
