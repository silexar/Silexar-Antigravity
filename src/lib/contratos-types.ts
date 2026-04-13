/**
 * Contratos Module Type Stubs
 *
 * These type stubs provide type information for the contratos module
 * which is currently excluded from tsconfig (SIL-300).
 * 
 * Once SIL-300 is resolved, this file can be removed and imports
 * can point to the actual module.
 */

// Value Object Stubs
export interface NumeroContrato {
  valor: string
}

export interface TotalesContrato {
  valorBruto: number
  valorNeto: number
}

export interface TerminosPago {
  diasPlazo: number
}

export interface RiesgoCredito {
  nivel: number
}

export interface MetricasRentabilidad {
  margenBruto: number
  roi: number
  valorVida: number
  costoAdquisicion: number
}

export interface EstadoContrato {
  valor: string
}

// Entity Stub
export interface Contrato {
  id: string
  toSnapshot(): ContratoSnapshot
}

export interface ContratoSnapshot {
  id: string
  numero: { valor: string }
  producto: string
  anunciante: string
  agencia: string
  ejecutivo: string
  fechaInicio: Date
  fechaFin: Date
  tipoContrato: string
  moneda: string
  totales: { valorNeto: number }
  estado: { valor: string }
  progreso: number
  fechaCreacion: Date
}

// Repository Stub
export interface DrizzleContratoRepository {
  new(tenantId: string): DrizzleContratoRepository
  search(criteria: unknown): Promise<{
    contratos: Contrato[]
    total: number
    pagina: number
    tamanoPagina: number
    totalPaginas: number
  }>
  getPipelineData(criteria: unknown): Promise<unknown>
  save(contrato: Contrato): Promise<void>
}

// Value Object Factory Stubs
export const NumeroContrato: {
  generate(): NumeroContrato
}

export const TotalesContrato: {
  create(bruto: number, neto: number): TotalesContrato
}

export const TerminosPago: {
  create(dias: number): TerminosPago
}

export const RiesgoCredito: {
  create(nivel: number): RiesgoCredito
}

export const MetricasRentabilidad: {
  create(metrics: Partial<MetricasRentabilidad>): MetricasRentabilidad
}

export const EstadoContrato: {
  borrador(): EstadoContrato
}

// Entity Factory Stub
export const Contrato: {
  create(data: Record<string, unknown>): Contrato
}

// Repository Constructor Stub
export const DrizzleContratoRepository: {
  new(tenantId: string): DrizzleContratoRepository
}
