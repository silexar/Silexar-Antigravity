/**
 * VALUE OBJECT: ESPECIFICACION PAUTA - TIER 0
 */

export interface EspecificacionPautaProps {
  medioId: string
  medio: string
  formatoId: string
  formato: string
  horario: string
  duracion: number
  frecuencia: number
  fechaInicio: Date
  fechaFin: Date
  valorUnitario: number
  grps?: number
  rating?: number
  codigoSistema?: string
  parametrosEspeciales?: Record<string, unknown>
}

export class EspecificacionPauta {
  constructor(private props: EspecificacionPautaProps) {
    this.validate()
  }

  private validate(): void {
    if (!this.props.medioId?.trim()) throw new Error('ID del medio es requerido')
    if (!this.props.formatoId?.trim()) throw new Error('ID del formato es requerido')
    if (this.props.duracion <= 0) throw new Error('Duración debe ser mayor a cero')
    if (this.props.frecuencia <= 0) throw new Error('Frecuencia debe ser mayor a cero')
    if (this.props.fechaFin <= this.props.fechaInicio) throw new Error('Fecha fin debe ser posterior a fecha inicio')
  }

  // Getters
  get medioId(): string { return this.props.medioId }
  get medio(): string { return this.props.medio }
  get formatoId(): string { return this.props.formatoId }
  get formato(): string { return this.props.formato }
  get horario(): string { return this.props.horario }
  get duracion(): number { return this.props.duracion }
  get frecuencia(): number { return this.props.frecuencia }
  get fechaInicio(): Date { return this.props.fechaInicio }
  get fechaFin(): Date { return this.props.fechaFin }
  get valorUnitario(): number { return this.props.valorUnitario }
  get grps(): number | undefined { return this.props.grps }
  get rating(): number | undefined { return this.props.rating }
  get codigoSistema(): string | undefined { return this.props.codigoSistema }
  get parametrosEspeciales(): Record<string, unknown> | undefined { return this.props.parametrosEspeciales }

  toSnapshot(): EspecificacionPautaProps { return { ...this.props } }
}