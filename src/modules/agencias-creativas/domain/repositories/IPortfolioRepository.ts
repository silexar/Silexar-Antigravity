/**
 * 🎨 REPOSITORY INTERFACE: PORTFOLIO
 * 
 * Define el contrato para la persistencia de portfolios de trabajos
 */

import { PortfolioTrabajo } from '../entities/PortfolioTrabajo'

export interface IPortfolioRepository {
  /**
   * Guarda un trabajo de portfolio
   */
  save(portfolio: PortfolioTrabajo): Promise<void>
  
  /**
   * Busca un trabajo por ID
   */
  findById(id: string): Promise<PortfolioTrabajo | null>
  
  /**
   * Busca trabajos por agencia creativa
   */
  findByAgenciaCreativaId(agenciaId: string): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por categoría
   */
  findByCategoria(categoria: string): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por tipo de proyecto
   */
  findByTipoProyecto(tipo: string): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos destacados
   */
  findDestacados(limit?: number): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por cliente
   */
  findByCliente(cliente: string): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por rango de fechas
   */
  findByFechaRange(fechaInicio: Date, fechaFin: Date): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por score de calidad
   */
  findByScoreRange(scoreMin: number, scoreMax: number): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por industria/sector
   */
  findByIndustria(industria: string): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos con premios
   */
  findConPremios(): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por tags
   */
  findByTags(tags: string[]): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos similares
   */
  findSimilares(
    tipoProyecto: string,
    categoria: string,
    industria?: string,
    limit?: number
  ): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos con filtros avanzados
   */
  findWithFilters(filters: {
    agenciaId?: string
    categoria?: string
    tipoProyecto?: string
    cliente?: string
    industria?: string
    fechaInicio?: Date
    fechaFin?: Date
    scoreMin?: number
    scoreMax?: number
    conPremios?: boolean
    destacado?: boolean
    tags?: string[]
  }): Promise<PortfolioTrabajo[]>
  
  /**
   * Obtiene el portfolio completo de una agencia
   */
  getPortfolioCompleto(agenciaId: string): Promise<{
    trabajos: PortfolioTrabajo[]
    estadisticas: {
      totalTrabajos: number
      scorePromedio: number
      categorias: Record<string, number>
      clientes: string[]
      premios: number
      añosExperiencia: number
    }
  }>
  
  /**
   * Obtiene trabajos destacados por agencia
   */
  getDestacadosPorAgencia(agenciaId: string, limit?: number): Promise<PortfolioTrabajo[]>
  
  /**
   * Obtiene mejores trabajos por categoría
   */
  getMejoresPorCategoria(categoria: string, limit?: number): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos para showcase
   */
  findForShowcase(
    agenciaId: string,
    tipoProyecto?: string,
    limit?: number
  ): Promise<PortfolioTrabajo[]>
  
  /**
   * Obtiene estadísticas de portfolio
   */
  getEstadisticas(agenciaId?: string): Promise<{
    totalTrabajos: number
    scorePromedio: number
    distribucionCategorias: Record<string, number>
    distribucionIndustrias: Record<string, number>
    tendenciaCalidad: Array<{ año: number; score: number }>
    clientesUnicos: number
    premiosTotales: number
  }>
  
  /**
   * Busca trabajos recientes
   */
  findRecientes(agenciaId?: string, limit?: number): Promise<PortfolioTrabajo[]>
  
  /**
   * Busca trabajos por rango de presupuesto
   */
  findByPresupuestoRange(minimo: number, maximo: number): Promise<PortfolioTrabajo[]>
  
  /**
   * Obtiene trabajos para análisis competitivo
   */
  findForCompetitiveAnalysis(
    categoria: string,
    industria?: string
  ): Promise<PortfolioTrabajo[]>
  
  /**
   * Elimina un trabajo del portfolio
   */
  delete(id: string): Promise<void>
  
  /**
   * Busca trabajos por tenant
   */
  findByTenantId(tenantId: string): Promise<PortfolioTrabajo[]>
  
  /**
   * Cuenta trabajos por criterios
   */
  count(filters?: {
    agenciaId?: string
    categoria?: string
    fechaInicio?: Date
    fechaFin?: Date
  }): Promise<number>
  
  /**
   * Busca trabajos por texto libre
   */
  search(query: string, agenciaId?: string): Promise<PortfolioTrabajo[]>
}