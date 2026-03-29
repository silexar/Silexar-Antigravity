/**
 * 🗄️ REPOSITORIO AGENCIA CREATIVA - INTERFACE
 * 
 * Define el contrato para la persistencia de agencias creativas
 * Incluye operaciones CRUD y consultas especializadas
 */

import { AgenciaCreativa } from '../entities/AgenciaCreativa'
import { RutAgenciaCreativa } from '../value-objects/RutAgenciaCreativa'
import { TipoAgenciaCreativa } from '../value-objects/TipoAgenciaCreativa'
import { EspecializacionCreativa } from '../value-objects/EspecializacionCreativa'
import { EstadoDisponibilidad } from '../value-objects/EstadoDisponibilidad'
import { ScoreCreativo } from '../value-objects/ScoreCreativo'

export interface AgenciaCreativaFilters {
  // Filtros básicos
  nombre?: string
  activo?: boolean
  tenantId?: string
  
  // Filtros por tipo y especialización
  tipos?: TipoAgenciaCreativa[]
  especializaciones?: EspecializacionCreativa[]
  
  // Filtros por ubicación
  ciudad?: string
  region?: string
  pais?: string
  
  // Filtros por performance
  scoreMinimo?: number
  scoreMaximo?: number
  disponibilidad?: EstadoDisponibilidad[]
  
  // Filtros por capacidades
  capacidadesTecnicas?: string[]
  certificaciones?: string[]
  
  // Filtros por experiencia
  añosExperienciaMinimo?: number
  añosExperienciaMaximo?: number
  numeroEmpleadosMinimo?: number
  numeroEmpleadosMaximo?: number
  
  // Filtros por métricas
  promedioCalidadMinimo?: number
  puntualidadMinima?: number
  proyectosCompletadosMinimo?: number
  
  // Filtros por presupuesto
  presupuestoMinimo?: number
  presupuestoMaximo?: number
  
  // Filtros por fecha
  fechaRegistroDesde?: Date
  fechaRegistroHasta?: Date
  fechaUltimaActividadDesde?: Date
  fechaUltimaActividadHasta?: Date
  
  // Búsqueda de texto
  busqueda?: string // Búsqueda en nombre, razón social, especialidades
}

export interface AgenciaCreativaSortOptions {
  campo: 'nombre' | 'scoreCreativo' | 'fechaRegistro' | 'fechaUltimaActividad' | 
         'promedioCalidad' | 'puntualidadEntregas' | 'proyectosCompletados'
  direccion: 'ASC' | 'DESC'
}

export interface AgenciaCreativaSearchResult {
  agencias: AgenciaCreativa[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface AgenciaCreativaMatchingCriteria {
  tipoProyecto: string
  presupuesto: number
  fechaEntrega: Date
  complejidad: 'Baja' | 'Media' | 'Alta' | 'Critica'
  especializacionesRequeridas: string[]
  ubicacionPreferida?: string
  certificacionesRequeridas?: string[]
}

export interface AgenciaCreativaMatchResult {
  agencia: AgenciaCreativa
  matchScore: number
  razonesMatch: string[]
  riesgos: string[]
  recomendaciones: string[]
}

export interface IAgenciaCreativaRepository {
  /**
   * Operaciones CRUD básicas
   */
  
  // Crear nueva agencia
  save(agencia: AgenciaCreativa): Promise<void>
  
  // Buscar por ID
  findById(id: string): Promise<AgenciaCreativa | null>
  
  // Buscar por RUT
  findByRut(rut: RutAgenciaCreativa): Promise<AgenciaCreativa | null>
  
  // Actualizar agencia existente
  update(agencia: AgenciaCreativa): Promise<void>
  
  // Eliminar agencia (soft delete)
  delete(id: string): Promise<void>
  
  // Verificar si existe
  exists(id: string): Promise<boolean>
  
  // Verificar si RUT existe
  existsByRut(rut: RutAgenciaCreativa): Promise<boolean>
  
  /**
   * Consultas de búsqueda y filtrado
   */
  
  // Buscar con filtros y paginación
  findWithFilters(
    filtros: AgenciaCreativaFilters,
    ordenamiento?: AgenciaCreativaSortOptions,
    pagina?: number,
    limite?: number
  ): Promise<AgenciaCreativaSearchResult>
  
  // Buscar todas las agencias activas
  findAllActive(tenantId: string): Promise<AgenciaCreativa[]>
  
  // Buscar por tenant ID
  findByTenantId(tenantId: string): Promise<AgenciaCreativa[]>
  
  // Buscar por especialización
  findByEspecializacion(
    especializacion: EspecializacionCreativa,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Buscar por tipo
  findByTipo(
    tipo: TipoAgenciaCreativa,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Buscar por ubicación
  findByUbicacion(
    ciudad?: string,
    region?: string,
    pais?: string,
    tenantId?: string
  ): Promise<AgenciaCreativa[]>
  
  // Buscar disponibles
  findAvailable(tenantId: string): Promise<AgenciaCreativa[]>
  
  /**
   * Consultas especializadas para matching
   */
  
  // Encontrar mejores matches para un proyecto
  findBestMatches(
    criterios: AgenciaCreativaMatchingCriteria,
    tenantId: string,
    limite?: number
  ): Promise<AgenciaCreativaMatchResult[]>
  
  // Buscar agencias por score mínimo
  findByMinScore(
    scoreMinimo: ScoreCreativo,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Buscar agencias premium (score alto)
  findPremiumAgencies(tenantId: string): Promise<AgenciaCreativa[]>
  
  // Buscar agencias con capacidad disponible
  findWithAvailableCapacity(
    proyectosMaximos: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  /**
   * Consultas de analytics y reportes
   */
  
  // Obtener estadísticas generales
  getStatistics(tenantId: string): Promise<{
    totalAgencias: number
    agenciasActivas: number
    scorePromedio: number
    distribucionTipos: Record<string, number>
    distribucionEspecializaciones: Record<string, number>
    agenciasDisponibles: number
  }>
  
  // Top agencias por performance
  getTopPerformers(
    limite: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Agencias con mejor puntualidad
  getMostReliable(
    limite: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Agencias más innovadoras (score alto reciente)
  getMostInnovative(
    limite: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  /**
   * Operaciones de mantenimiento
   */
  
  // Actualizar scores masivamente
  updateScores(
    actualizaciones: Array<{ id: string; nuevoScore: number }>,
    tenantId: string
  ): Promise<void>
  
  // Actualizar disponibilidad masiva
  updateAvailability(
    actualizaciones: Array<{ id: string; disponibilidad: EstadoDisponibilidad }>,
    tenantId: string
  ): Promise<void>
  
  // Limpiar agencias inactivas
  cleanupInactive(
    diasInactividad: number,
    tenantId: string
  ): Promise<number>
  
  // Sincronizar con servicios externos
  syncWithExternalServices(tenantId: string): Promise<void>
  
  /**
   * Consultas geográficas
   */
  
  // Buscar por proximidad geográfica
  findNearby(
    latitud: number,
    longitud: number,
    radioKm: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Buscar en zona metropolitana
  findInMetropolitanArea(
    ciudad: string,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  /**
   * Consultas de colaboración histórica
   */
  
  // Agencias que han trabajado con un cliente específico
  findByClienteHistory(
    clienteId: string,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Agencias con experiencia en sector específico
  findBySectorExperience(
    sector: string,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  // Agencias recomendadas por otras agencias
  findRecommended(
    agenciaRecomendadoraId: string,
    tenantId: string
  ): Promise<AgenciaCreativa[]>
  
  /**
   * Búsqueda inteligente con IA
   */
  
  // Búsqueda semántica con procesamiento de lenguaje natural
  searchSemantic(
    consulta: string,
    tenantId: string,
    limite?: number
  ): Promise<AgenciaCreativaMatchResult[]>
  
  // Recomendaciones basadas en IA
  getAIRecommendations(
    contexto: {
      proyectoTipo?: string
      presupuesto?: number
      urgencia?: 'baja' | 'media' | 'alta' | 'critica'
      historialColaboracion?: string[]
    },
    tenantId: string,
    limite?: number
  ): Promise<AgenciaCreativaMatchResult[]>
  
  /**
   * Operaciones de auditoría
   */
  
  // Obtener historial de cambios
  getAuditLog(
    agenciaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<Array<{
    fecha: Date
    usuario: string
    accion: string
    cambios: Record<string, unknown>
  }>>
  
  // Validar integridad de datos
  validateDataIntegrity(tenantId: string): Promise<{
    errores: string[]
    advertencias: string[]
    agenciasAfectadas: string[]
  }>
}