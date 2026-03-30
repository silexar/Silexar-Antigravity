/**
 * 🎯 REPOSITORY INTERFACE: PROYECTO CREATIVO
 * 
 * Define el contrato para la persistencia de proyectos creativos
 */

import { ProyectoCreativo } from '../entities/ProyectoCreativo'

export interface IProyectoCreativoRepository {
  /**
   * Guarda un proyecto creativo
   */
  save(proyecto: ProyectoCreativo): Promise<void>
  
  /**
   * Busca un proyecto por ID
   */
  findById(id: string): Promise<ProyectoCreativo | null>
  
  /**
   * Busca proyectos por agencia creativa
   */
  findByAgenciaCreativaId(agenciaId: string): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos por cliente
   */
  findByClienteId(clienteId: string): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos por estado
   */
  findByEstado(estado: string): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos activos de una agencia
   */
  findActivosByAgenciaId(agenciaId: string): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos por rango de fechas
   */
  findByFechaRange(fechaInicio: Date, fechaFin: Date): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos próximos a vencer
   */
  findProximosAVencer(dias: number): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos retrasados
   */
  findRetrasados(): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos por tipo
   */
  findByTipo(tipo: string): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos por presupuesto
   */
  findByPresupuestoRange(minimo: number, maximo: number): Promise<ProyectoCreativo[]>
  
  /**
   * Busca proyectos con filtros avanzados
   */
  findWithFilters(filters: {
    agenciaId?: string
    clienteId?: string
    estado?: string
    tipoProyecto?: string
    fechaInicio?: Date
    fechaFin?: Date
    presupuestoMin?: number
    presupuestoMax?: number
    prioridad?: string
    complejidad?: string
  }): Promise<ProyectoCreativo[]>
  
  /**
   * Obtiene estadísticas de proyectos
   */
  getEstadisticas(agenciaId?: string): Promise<{
    total: number
    porEstado: Record<string, number>
    porTipo: Record<string, number>
    promedioCalidad: number
    puntualidadPromedio: number
    presupuestoPromedio: number
  }>
  
  /**
   * Obtiene proyectos para dashboard
   */
  findForDashboard(agenciaId?: string): Promise<{
    activos: ProyectoCreativo[]
    proximosVencimientos: ProyectoCreativo[]
    retrasados: ProyectoCreativo[]
    completadosRecientes: ProyectoCreativo[]
  }>
  
  /**
   * Busca proyectos similares
   */
  findSimilares(
    tipoProyecto: string,
    presupuesto: number,
    complejidad: string,
    limit?: number
  ): Promise<ProyectoCreativo[]>
  
  /**
   * Elimina un proyecto
   */
  delete(id: string): Promise<void>
  
  /**
   * Verifica si existe un proyecto con el código dado
   */
  existsByCodigo(codigo: string): Promise<boolean>
  
  /**
   * Busca proyectos por tenant
   */
  findByTenantId(tenantId: string): Promise<ProyectoCreativo[]>
  
  /**
   * Cuenta proyectos por criterios
   */
  count(filters?: {
    agenciaId?: string
    estado?: string
    fechaInicio?: Date
    fechaFin?: Date
  }): Promise<number>
}