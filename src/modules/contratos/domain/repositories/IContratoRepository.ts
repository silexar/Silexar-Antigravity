/**
 * INTERFAZ REPOSITORIO CONTRATOS - TIER 0
 * 
 * @description Interfaz del repositorio con métodos optimizados para consultas complejas
 */

import { Contrato } from '../entities/Contrato'

export interface BusquedaCriteria {
  busquedaTexto?: string
  anuncianteId?: string
  ejecutivoId?: string
  estados?: string[]
  prioridad?: string[]
  tipoContrato?: string[]
  fechaCreacionDesde?: Date
  fechaCreacionHasta?: Date
  valorMinimoNeto?: number
  valorMaximoNeto?: number
  ordenarPor?: 'fecha' | 'valor' | 'cliente' | 'estado'
  direccionOrden?: 'asc' | 'desc'
  pagina: number
  tamanoPagina: number
}

export interface ResultadoBusqueda {
  contratos: Contrato[]
  total: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

export interface AlertaCritica {
  id: string
  tipo: 'vencimientos_proximo' | 'pago_pendiente' | 'renovacion_sugerida' | 'revision_requerida'
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  titulo: string
  descripcion: string
  contratoId: string
  numeroContrato: string
  diasRestantes?: number
  monto?: number
  fechaLimite?: Date
}

export interface PrediccionRenovacion {
  contratoId: string
  numeroContrato: string
  anunciante: string
  valorContrato: number
  fechaFin: Date
  probabilidadRenovacion: number
  factores: string[]
  recomendacion: 'renovar' | 'negociar' | 'no_renovar'
  proximoContact: Date
}

export interface IContratoRepository {
  // Operaciones básicas
  save(contrato: Contrato): Promise<void>
  findById(id: string): Promise<Contrato | null>
  findByNumero(numero: string): Promise<Contrato | null>
  delete(id: string): Promise<void>

  // Búsquedas específicas
  findByAnunciante(anuncianteId: string): Promise<Contrato[]>
  findByEjecutivo(ejecutivoId: string): Promise<Contrato[]>
  findByEstado(estado: string): Promise<Contrato[]>
  findVencenEnDias(dias: number): Promise<Contrato[]>

  // Búsqueda avanzada
  search(criteria: BusquedaCriteria): Promise<ResultadoBusqueda>

  // Alertas y predicciones
  obtenerAlertasCriticas(filtros: { diasAnticipacion?: number; estados?: string[]; ejecuticoId?: string }): Promise<AlertaCritica[]>
  generarPrediccionRenovacion(filtros: { diasAnticipacion?: number; ejecuticoId?: string }): Promise<PrediccionRenovacion[]>

  // Métricas y reportes
  getPipelineData(filtros: unknown): Promise<unknown>
  getMetricasEjecutivo(ejecutivoId: string, periodo: { fechaDesde: Date | string; fechaHasta: Date | string }): Promise<unknown>
  getAnalisisRentabilidad(filtros: unknown): Promise<unknown>
  getContratosParaRenovacion(diasAnticipacion: number): Promise<Contrato[]>

  // Utilidades
  getNextSequence(año: number): Promise<number>
  existeNumero(numero: string): Promise<boolean>

  // Operaciones en lote
  saveMany(contratos: Contrato[]): Promise<void>
  updateEstadoMasivo(ids: string[], nuevoEstado: string): Promise<number>
}