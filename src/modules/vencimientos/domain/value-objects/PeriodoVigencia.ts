/**
 * VALUE OBJECT: PERÍODO DE VIGENCIA - TIER 0 ENTERPRISE
 *
 * @description Fecha inicio/fin con validaciones, cálculo de días restantes,
 * detección de solapamiento y lógica de vencimiento.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type EstadoVigencia = 'futuro' | 'activo' | 'vencido' | 'por_vencer'

export interface PeriodoVigenciaProps {
  fechaInicio: Date
  fechaFin: Date
}

export class PeriodoVigencia {
  private constructor(
    private readonly _fechaInicio: Date,
    private readonly _fechaFin: Date
  ) {}

  static create(props: PeriodoVigenciaProps): PeriodoVigencia {
    PeriodoVigencia.validate(props)
    return new PeriodoVigencia(new Date(props.fechaInicio), new Date(props.fechaFin))
  }

  static fromPersistence(props: PeriodoVigenciaProps): PeriodoVigencia {
    return new PeriodoVigencia(new Date(props.fechaInicio), new Date(props.fechaFin))
  }

  /** Crea un período desde hoy por N meses */
  static desdeHoyPorMeses(meses: number): PeriodoVigencia {
    const inicio = new Date()
    const fin = new Date()
    fin.setMonth(fin.getMonth() + meses)
    return new PeriodoVigencia(inicio, fin)
  }

  private static validate(props: PeriodoVigenciaProps): void {
    if (!(props.fechaInicio instanceof Date) || isNaN(props.fechaInicio.getTime())) {
      throw new Error('Fecha de inicio inválida')
    }
    if (!(props.fechaFin instanceof Date) || isNaN(props.fechaFin.getTime())) {
      throw new Error('Fecha de fin inválida')
    }
    if (props.fechaFin <= props.fechaInicio) {
      throw new Error('Fecha fin debe ser posterior a fecha inicio')
    }
  }

  // ── Getters ──
  get fechaInicio(): Date { return new Date(this._fechaInicio) }
  get fechaFin(): Date { return new Date(this._fechaFin) }

  /** Días totales del período */
  get duracionDias(): number {
    return Math.ceil((this._fechaFin.getTime() - this._fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  /** Meses aproximados */
  get duracionMeses(): number {
    return Math.round(this.duracionDias / 30.44)
  }

  /** Días restantes desde hoy */
  get diasRestantes(): number {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return Math.ceil((this._fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  /** Días hasta que inicie (si es futuro) */
  get diasParaInicio(): number {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const diff = Math.ceil((this._fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  /** Días transcurridos desde fecha inicio sin que haya iniciado */
  get diasSinIniciar(): number {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const diff = Math.ceil((hoy.getTime() - this._fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  /** Porcentaje transcurrido del período */
  get porcentajeTranscurrido(): number {
    const hoy = new Date()
    if (hoy < this._fechaInicio) return 0
    if (hoy > this._fechaFin) return 100
    const transcurrido = hoy.getTime() - this._fechaInicio.getTime()
    const total = this._fechaFin.getTime() - this._fechaInicio.getTime()
    return Math.round((transcurrido / total) * 100)
  }

  /** Estado actual del período */
  get estado(): EstadoVigencia {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (hoy < this._fechaInicio) return 'futuro'
    if (hoy > this._fechaFin) return 'vencido'
    if (this.diasRestantes <= 30) return 'por_vencer'
    return 'activo'
  }

  get estadoDescripcion(): string {
    const desc: Record<EstadoVigencia, string> = {
      'futuro': `Inicia en ${this.diasParaInicio} días`,
      'activo': `${this.diasRestantes} días restantes`,
      'vencido': 'Período finalizado',
      'por_vencer': `⚠️ Vence en ${this.diasRestantes} días`
    }
    return desc[this.estado]
  }

  get estadoColor(): string {
    const colores: Record<EstadoVigencia, string> = {
      'futuro': 'bg-blue-500',
      'activo': 'bg-green-500',
      'vencido': 'bg-gray-500',
      'por_vencer': 'bg-orange-500'
    }
    return colores[this.estado]
  }

  // ── Métodos de consulta ──
  estaActivo(fecha: Date = new Date()): boolean {
    return fecha >= this._fechaInicio && fecha <= this._fechaFin
  }

  estaVencido(fecha: Date = new Date()): boolean {
    return fecha > this._fechaFin
  }

  esFuturo(fecha: Date = new Date()): boolean {
    return fecha < this._fechaInicio
  }

  venceEnDias(dias: number): boolean {
    return this.diasRestantes > 0 && this.diasRestantes <= dias
  }

  /** Verifica si superó fecha inicio sin iniciar (para regla 48h - R1) */
  superoFechaInicio(): boolean {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return hoy > this._fechaInicio
  }

  /** Verifica si pasaron más de 48h desde que debía iniciar (R1) */
  supero48hSinIniciar(): boolean {
    return this.diasSinIniciar >= 2
  }

  /** Verifica si termina mañana (R2) */
  terminaManana(): boolean {
    return this.diasRestantes === 1
  }

  /** Verifica si termina hoy (R2) */
  terminaHoy(): boolean {
    return this.diasRestantes === 0
  }

  /** Detecta solapamiento con otro período */
  seSolapaCon(otro: PeriodoVigencia): boolean {
    return this._fechaInicio < otro._fechaFin && this._fechaFin > otro._fechaInicio
  }

  /** Calcula días de solapamiento */
  diasDeSolapamiento(otro: PeriodoVigencia): number {
    if (!this.seSolapaCon(otro)) return 0
    const inicioOverlap = this._fechaInicio > otro._fechaInicio ? this._fechaInicio : otro._fechaInicio
    const finOverlap = this._fechaFin < otro._fechaFin ? this._fechaFin : otro._fechaFin
    return Math.ceil((finOverlap.getTime() - inicioOverlap.getTime()) / (1000 * 60 * 60 * 24))
  }

  /** Contiene una fecha específica */
  contieneFecha(fecha: Date): boolean {
    return fecha >= this._fechaInicio && fecha <= this._fechaFin
  }

  // ── Display ──
  get fechaInicioFormateada(): string {
    return this._fechaInicio.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  get fechaFinFormateada(): string {
    return this._fechaFin.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ── Igualdad ──
  equals(other: PeriodoVigencia): boolean {
    return this._fechaInicio.getTime() === other._fechaInicio.getTime() &&
           this._fechaFin.getTime() === other._fechaFin.getTime()
  }

  toString(): string {
    return `${this.fechaInicioFormateada} — ${this.fechaFinFormateada}`
  }

  toJSON(): { fechaInicio: string; fechaFin: string } {
    return {
      fechaInicio: this._fechaInicio.toISOString(),
      fechaFin: this._fechaFin.toISOString()
    }
  }
}
