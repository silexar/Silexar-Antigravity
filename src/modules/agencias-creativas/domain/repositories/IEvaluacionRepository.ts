/**
 * ⭐ REPOSITORY INTERFACE: EVALUACIÓN CALIDAD
 * 
 * Define el contrato para la persistencia de evaluaciones de calidad
 */

import { EvaluacionCalidad } from '../entities/EvaluacionCalidad'

export interface IEvaluacionRepository {
  /**
   * Guarda una evaluación de calidad
   */
  save(evaluacion: EvaluacionCalidad): Promise<void>
  
  /**
   * Busca una evaluación por ID
   */
  findById(id: string): Promise<EvaluacionCalidad | null>
  
  /**
   * Busca evaluaciones por proyecto
   */
  findByProyectoId(proyectoId: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones por agencia
   */
  findByAgenciaId(agenciaId: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones por evaluador
   */
  findByEvaluadorId(evaluadorId: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones por estado
   */
  findByEstado(estado: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones por rango de score
   */
  findByScoreRange(scoreMin: number, scoreMax: number): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones por rango de fechas
   */
  findByFechaRange(fechaInicio: Date, fechaFin: Date): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones pendientes de revisión
   */
  findPendientesRevision(): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones completadas recientes
   */
  findCompletadasRecientes(dias: number): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones con certificación específica
   */
  findByCertificacion(nivel: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones con filtros avanzados
   */
  findWithFilters(filters: {
    proyectoId?: string
    agenciaId?: string
    evaluadorId?: string
    estado?: string
    scoreMin?: number
    scoreMax?: number
    fechaInicio?: Date
    fechaFin?: Date
    certificacion?: string
    version?: number
  }): Promise<EvaluacionCalidad[]>
  
  /**
   * Obtiene estadísticas de evaluaciones por agencia
   */
  getEstadisticasAgencia(agenciaId: string): Promise<{
    totalEvaluaciones: number
    scorePromedio: number
    distribucionScores: Record<string, number>
    tendenciaCalidad: Array<{ fecha: Date; score: number }>
    certificacionesObtenidas: Record<string, number>
    evaluadoresFrecuentes: Array<{ evaluadorId: string; nombre: string; cantidad: number }>
    tiempoPromedioEvaluacion: number
  }>
  
  /**
   * Obtiene estadísticas generales de evaluaciones
   */
  getEstadisticasGenerales(): Promise<{
    totalEvaluaciones: number
    scorePromedioGeneral: number
    distribucionNiveles: Record<string, number>
    agenciasMejorEvaluadas: Array<{ agenciaId: string; scorePromedio: number }>
    evaluadoresMasActivos: Array<{ evaluadorId: string; nombre: string; cantidad: number }>
    tendenciaCalidadMercado: Array<{ mes: string; scorePromedio: number }>
  }>
  
  /**
   * Obtiene evaluaciones para dashboard de calidad
   */
  findForDashboard(agenciaId?: string): Promise<{
    evaluacionesRecientes: EvaluacionCalidad[]
    pendientesRevision: EvaluacionCalidad[]
    mejoresEvaluaciones: EvaluacionCalidad[]
    evaluacionesBajas: EvaluacionCalidad[]
    tendenciaUltimos30Dias: Array<{ fecha: Date; score: number }>
  }>
  
  /**
   * Busca evaluaciones similares para benchmarking
   */
  findSimilares(
    tipoProyecto: string,
    complejidad: string,
    presupuesto?: number,
    limit?: number
  ): Promise<EvaluacionCalidad[]>
  
  /**
   * Obtiene la última evaluación de un proyecto
   */
  findUltimaByProyecto(proyectoId: string): Promise<EvaluacionCalidad | null>
  
  /**
   * Obtiene evaluaciones por criterio específico
   */
  findByCriterio(
    criterio: string,
    scoreMin: number,
    agenciaId?: string
  ): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones que requieren calibración
   */
  findRequierenCalibracion(): Promise<EvaluacionCalidad[]>
  
  /**
   * Obtiene historial de evaluaciones de una agencia
   */
  getHistorialAgencia(
    agenciaId: string,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<EvaluacionCalidad[]>
  
  /**
   * Busca evaluaciones con sesgo detectado
   */
  findConSesgo(): Promise<EvaluacionCalidad[]>
  
  /**
   * Obtiene comparación entre evaluadores
   */
  getComparacionEvaluadores(
    evaluadorId1: string,
    evaluadorId2: string
  ): Promise<{
    evaluador1: { nombre: string; scorePromedio: number; cantidad: number }
    evaluador2: { nombre: string; scorePromedio: number; cantidad: number }
    diferenciasSignificativas: Array<{ criterio: string; diferencia: number }>
    correlacion: number
  }>
  
  /**
   * Elimina una evaluación
   */
  delete(id: string): Promise<void>
  
  /**
   * Busca evaluaciones por tenant
   */
  findByTenantId(tenantId: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Cuenta evaluaciones por criterios
   */
  count(filters?: {
    agenciaId?: string
    estado?: string
    fechaInicio?: Date
    fechaFin?: Date
  }): Promise<number>
  
  /**
   * Busca evaluaciones por texto libre
   */
  search(query: string, agenciaId?: string): Promise<EvaluacionCalidad[]>
  
  /**
   * Obtiene métricas de calidad por período
   */
  getMetricasPorPeriodo(
    agenciaId: string,
    periodo: 'semana' | 'mes' | 'trimestre' | 'año'
  ): Promise<Array<{
    periodo: string
    scorePromedio: number
    totalEvaluaciones: number
    mejorScore: number
    peorScore: number
  }>>
}