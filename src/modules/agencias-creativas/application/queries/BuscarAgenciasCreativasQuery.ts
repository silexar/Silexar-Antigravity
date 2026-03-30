/**
 * 🔍 QUERY: BUSCAR AGENCIAS CREATIVAS
 * 
 * Query para buscar agencias creativas con filtros avanzados y criterios de matching
 */

import { TipoAgenciaCreativa } from '../../domain/value-objects/TipoAgenciaCreativa'
import { EspecializacionCreativa } from '../../domain/value-objects/EspecializacionCreativa'
import { NivelExperiencia } from '../../domain/value-objects/NivelExperiencia'
import { EstadoDisponibilidad } from '../../domain/value-objects/EstadoDisponibilidad'
import { RangoPresupuesto } from '../../domain/value-objects/RangoPresupuesto'

export interface BuscarAgenciasCreativasQueryProps {
  // Filtros básicos
  nombre?: string
  ciudad?: string
  region?: string
  pais?: string
  
  // Filtros de clasificación
  tipos?: TipoAgenciaCreativa[]
  especializaciones?: EspecializacionCreativa[]
  nivelesExperiencia?: NivelExperiencia[]
  rangosPresupuesto?: RangoPresupuesto[]
  
  // Filtros de estado
  estadosDisponibilidad?: EstadoDisponibilidad[]
  soloActivas?: boolean
  
  // Filtros de capacidades
  capacidadesTecnicas?: {
    video4K?: boolean
    audioHD?: boolean
    motionGraphics?: boolean
    colorGrading?: boolean
    animacion3D?: boolean
    liveAction?: boolean
    postProduccion?: boolean
    efectosEspeciales?: boolean
    realidadAumentada?: boolean
    realidadVirtual?: boolean
  }
  
  // Filtros de performance
  scoreMinimo?: number
  scoreMaximo?: number
  puntualidadMinima?: number // porcentaje
  calidadMinima?: number // 0-10
  satisfaccionMinima?: number // 0-10
  
  // Filtros de experiencia
  añosExperienciaMinimo?: number
  numeroEmpleadosMinimo?: number
  numeroEmpleadosMaximo?: number
  
  // Filtros de portfolio
  clientesPrincipales?: string[]
  sectoresExperiencia?: string[]
  conPremios?: boolean
  certificacionesRequeridas?: string[]
  
  // Filtros de proyecto específico
  tipoProyecto?: string
  presupuestoProyecto?: number
  urgencia?: 'baja' | 'media' | 'alta' | 'critica'
  complejidadProyecto?: 'baja' | 'media' | 'alta' | 'critica'
  
  // Filtros geográficos avanzados
  coordenadas?: {
    latitud: number
    longitud: number
    radioKm?: number
  }
  
  // Filtros de colaboración
  tiempoRespuestaMaximo?: number // horas
  metodologiasTrabajo?: string[]
  herramientasColaboracion?: string[]
  
  // Filtros de disponibilidad
  fechaRequerida?: Date
  duracionProyecto?: number // días
  
  // Opciones de búsqueda
  busquedaTexto?: string // búsqueda libre en nombre, descripción, etc.
  incluirInactivas?: boolean
  
  // Opciones de ordenamiento
  ordenarPor?: 'nombre' | 'score' | 'puntualidad' | 'calidad' | 'experiencia' | 'matching' | 'distancia'
  direccionOrden?: 'asc' | 'desc'
  
  // Paginación
  pagina?: number
  limite?: number
  
  // Opciones de resultado
  incluirMetricas?: boolean
  incluirPortfolio?: boolean
  incluirContactos?: boolean
  incluirProyectosActivos?: boolean
  
  // Contexto de búsqueda
  tenantId: string
  usuarioId?: string
  
  // Configuración de matching IA
  usarMatchingIA?: boolean
  pesoCalidad?: number // 0-1
  pesoPuntualidad?: number // 0-1
  pesoDisponibilidad?: number // 0-1
  pesoExperiencia?: number // 0-1
  pesoPresupuesto?: number // 0-1
}

export interface AgenciaCreativaSearchResult {
  id: string
  nombre: string
  razonSocial: string
  tipo: TipoAgenciaCreativa
  especializaciones: EspecializacionCreativa[]
  scoreCreativo: number
  estadoDisponibilidad: EstadoDisponibilidad
  
  // Información de contacto
  email: string
  telefono: string
  ciudad: string
  region: string
  
  // Métricas de performance
  metricas: {
    proyectosCompletados: number
    proyectosActivos: number
    promedioCalidad: number
    puntualidadEntregas: number
    satisfaccionClientes: number
    volumenFacturado: number
  }
  
  // Información comercial
  añosExperiencia: number
  numeroEmpleados: number
  clientesPrincipales: string[]
  
  // Capacidades técnicas
  capacidadesTecnicas: Record<string, boolean>
  
  // Certificaciones y premios
  certificaciones: string[]
  premios: Array<{
    nombre: string
    año: number
    categoria: string
  }>
  
  // Información de matching (si se usa IA)
  matchingScore?: number
  matchingFactors?: {
    especialización: number
    calidad: number
    puntualidad: number
    disponibilidad: number
    presupuesto: number
    experiencia: number
  }
  
  // Información adicional (opcional)
  portfolio?: Array<{
    id: string
    nombre: string
    categoria: string
    cliente: string
    año: number
    score: number
    destacado: boolean
  }>
  
  contactos?: Array<{
    id: string
    nombre: string
    cargo: string
    email: string
    esPrincipal: boolean
  }>
  
  proyectosActivos?: Array<{
    id: string
    nombre: string
    estado: string
    fechaEntrega: Date
    progreso: number
  }>
  
  // Información de distancia (si se usa filtro geográfico)
  distanciaKm?: number
}

export interface BuscarAgenciasCreativasResult {
  agencias: AgenciaCreativaSearchResult[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
  
  // Estadísticas de búsqueda
  estadisticas: {
    scorePromedio: number
    distribucionTipos: Record<string, number>
    distribucionEspecializaciones: Record<string, number>
    distribucionRegiones: Record<string, number>
    rangoExperiencia: { min: number; max: number }
    rangoEmpleados: { min: number; max: number }
  }
  
  // Sugerencias de búsqueda
  sugerencias?: {
    filtrosAlternativos: Array<{
      descripcion: string
      filtros: Partial<BuscarAgenciasCreativasQueryProps>
      resultadosEstimados: number
    }>
    agenciasSimilares: string[] // IDs de agencias similares a los criterios
  }
  
  // Información de matching IA (si se usa)
  matchingInfo?: {
    criteriosUsados: string[]
    pesosAplicados: Record<string, number>
    factoresDescartados: string[]
    confianzaResultados: number // 0-100%
  }
}

export class BuscarAgenciasCreativasQuery {
  constructor(public readonly props: BuscarAgenciasCreativasQueryProps) {
    this.validate()
    this.setDefaults()
  }
  
  /**
   * Valida la query
   */
  private validate(): void {
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    // Validar paginación
    if (this.props.pagina !== undefined && this.props.pagina < 1) {
      throw new Error('La página debe ser mayor a 0')
    }
    
    if (this.props.limite !== undefined && (this.props.limite < 1 || this.props.limite > 100)) {
      throw new Error('El límite debe estar entre 1 y 100')
    }
    
    // Validar scores
    if (this.props.scoreMinimo !== undefined && (this.props.scoreMinimo < 0 || this.props.scoreMinimo > 1000)) {
      throw new Error('El score mínimo debe estar entre 0 y 1000')
    }
    
    if (this.props.scoreMaximo !== undefined && (this.props.scoreMaximo < 0 || this.props.scoreMaximo > 1000)) {
      throw new Error('El score máximo debe estar entre 0 y 1000')
    }
    
    if (this.props.scoreMinimo !== undefined && this.props.scoreMaximo !== undefined && 
        this.props.scoreMinimo > this.props.scoreMaximo) {
      throw new Error('El score mínimo no puede ser mayor al score máximo')
    }
    
    // Validar porcentajes
    if (this.props.puntualidadMinima !== undefined && 
        (this.props.puntualidadMinima < 0 || this.props.puntualidadMinima > 100)) {
      throw new Error('La puntualidad mínima debe estar entre 0 y 100')
    }
    
    // Validar calidad y satisfacción
    if (this.props.calidadMinima !== undefined && 
        (this.props.calidadMinima < 0 || this.props.calidadMinima > 10)) {
      throw new Error('La calidad mínima debe estar entre 0 y 10')
    }
    
    if (this.props.satisfaccionMinima !== undefined && 
        (this.props.satisfaccionMinima < 0 || this.props.satisfaccionMinima > 10)) {
      throw new Error('La satisfacción mínima debe estar entre 0 y 10')
    }
    
    // Validar experiencia
    if (this.props.añosExperienciaMinimo !== undefined && this.props.añosExperienciaMinimo < 0) {
      throw new Error('Los años de experiencia mínimo no pueden ser negativos')
    }
    
    // Validar número de empleados
    if (this.props.numeroEmpleadosMinimo !== undefined && this.props.numeroEmpleadosMinimo < 1) {
      throw new Error('El número mínimo de empleados debe ser mayor a 0')
    }
    
    if (this.props.numeroEmpleadosMaximo !== undefined && this.props.numeroEmpleadosMaximo < 1) {
      throw new Error('El número máximo de empleados debe ser mayor a 0')
    }
    
    if (this.props.numeroEmpleadosMinimo !== undefined && this.props.numeroEmpleadosMaximo !== undefined &&
        this.props.numeroEmpleadosMinimo > this.props.numeroEmpleadosMaximo) {
      throw new Error('El número mínimo de empleados no puede ser mayor al máximo')
    }
    
    // Validar coordenadas
    if (this.props.coordenadas) {
      const { latitud, longitud, radioKm } = this.props.coordenadas
      
      if (latitud < -90 || latitud > 90) {
        throw new Error('La latitud debe estar entre -90 y 90')
      }
      
      if (longitud < -180 || longitud > 180) {
        throw new Error('La longitud debe estar entre -180 y 180')
      }
      
      if (radioKm !== undefined && radioKm <= 0) {
        throw new Error('El radio debe ser mayor a 0')
      }
    }
    
    // Validar pesos de matching IA
    if (this.props.usarMatchingIA) {
      const pesos = [
        this.props.pesoCalidad,
        this.props.pesoPuntualidad,
        this.props.pesoDisponibilidad,
        this.props.pesoExperiencia,
        this.props.pesoPresupuesto
      ].filter(p => p !== undefined)
      
      pesos.forEach(peso => {
        if (peso! < 0 || peso! > 1) {
          throw new Error('Los pesos de matching deben estar entre 0 y 1')
        }
      })
    }
  }
  
  /**
   * Establece valores por defecto
   */
  private setDefaults(): void {
    if (this.props.pagina === undefined) {
      this.props.pagina = 1
    }
    
    if (this.props.limite === undefined) {
      this.props.limite = 20
    }
    
    if (this.props.ordenarPor === undefined) {
      this.props.ordenarPor = this.props.usarMatchingIA ? 'matching' : 'score'
    }
    
    if (this.props.direccionOrden === undefined) {
      this.props.direccionOrden = 'desc'
    }
    
    if (this.props.soloActivas === undefined) {
      this.props.soloActivas = true
    }
    
    if (this.props.incluirInactivas === undefined) {
      this.props.incluirInactivas = false
    }
    
    // Valores por defecto para matching IA
    if (this.props.usarMatchingIA) {
      if (this.props.pesoCalidad === undefined) this.props.pesoCalidad = 0.25
      if (this.props.pesoPuntualidad === undefined) this.props.pesoPuntualidad = 0.20
      if (this.props.pesoDisponibilidad === undefined) this.props.pesoDisponibilidad = 0.20
      if (this.props.pesoExperiencia === undefined) this.props.pesoExperiencia = 0.20
      if (this.props.pesoPresupuesto === undefined) this.props.pesoPresupuesto = 0.15
    }
  }
  
  /**
   * Verifica si la búsqueda incluye filtros de proyecto específico
   */
  hasProjectSpecificFilters(): boolean {
    return !!(
      this.props.tipoProyecto ||
      this.props.presupuestoProyecto ||
      this.props.urgencia ||
      this.props.complejidadProyecto ||
      this.props.fechaRequerida ||
      this.props.duracionProyecto
    )
  }
  
  /**
   * Verifica si la búsqueda usa filtros geográficos
   */
  hasGeographicFilters(): boolean {
    return !!(
      this.props.ciudad ||
      this.props.region ||
      this.props.pais ||
      this.props.coordenadas
    )
  }
  
  /**
   * Verifica si la búsqueda usa filtros de performance
   */
  hasPerformanceFilters(): boolean {
    return !!(
      this.props.scoreMinimo ||
      this.props.scoreMaximo ||
      this.props.puntualidadMinima ||
      this.props.calidadMinima ||
      this.props.satisfaccionMinima
    )
  }
  
  /**
   * Verifica si la búsqueda requiere matching IA
   */
  requiresAIMatching(): boolean {
    return this.props.usarMatchingIA === true || this.hasProjectSpecificFilters()
  }
  
  /**
   * Obtiene los filtros activos como texto descriptivo
   */
  getActiveFiltersDescription(): string[] {
    const descriptions: string[] = []
    
    if (this.props.nombre) {
      descriptions.push(`Nombre: "${this.props.nombre}"`)
    }
    
    if (this.props.tipos && this.props.tipos.length > 0) {
      descriptions.push(`Tipos: ${this.props.tipos.map(t => t.displayName).join(', ')}`)
    }
    
    if (this.props.especializaciones && this.props.especializaciones.length > 0) {
      descriptions.push(`Especializaciones: ${this.props.especializaciones.map(e => e.displayName).join(', ')}`)
    }
    
    if (this.props.ciudad) {
      descriptions.push(`Ciudad: ${this.props.ciudad}`)
    }
    
    if (this.props.scoreMinimo || this.props.scoreMaximo) {
      const min = this.props.scoreMinimo || 0
      const max = this.props.scoreMaximo || 1000
      descriptions.push(`Score: ${min}-${max}`)
    }
    
    if (this.props.añosExperienciaMinimo) {
      descriptions.push(`Experiencia mínima: ${this.props.añosExperienciaMinimo} años`)
    }
    
    if (this.props.tipoProyecto) {
      descriptions.push(`Tipo de proyecto: ${this.props.tipoProyecto}`)
    }
    
    if (this.props.urgencia) {
      descriptions.push(`Urgencia: ${this.props.urgencia}`)
    }
    
    return descriptions
  }
  
  /**
   * Calcula el offset para la paginación
   */
  getOffset(): number {
    return ((this.props.pagina || 1) - 1) * (this.props.limite || 20)
  }
  
  /**
   * Crea una query simplificada para búsqueda rápida
   */
  static createQuickSearch(
    busquedaTexto: string,
    tenantId: string,
    limite: number = 10
  ): BuscarAgenciasCreativasQuery {
    return new BuscarAgenciasCreativasQuery({
      busquedaTexto,
      tenantId,
      limite,
      soloActivas: true,
      ordenarPor: 'score',
      direccionOrden: 'desc'
    })
  }
  
  /**
   * Crea una query para matching de proyecto
   */
  static createProjectMatching(
    tipoProyecto: string,
    presupuesto: number,
    urgencia: 'baja' | 'media' | 'alta' | 'critica',
    tenantId: string,
    especializacionesRequeridas?: EspecializacionCreativa[]
  ): BuscarAgenciasCreativasQuery {
    return new BuscarAgenciasCreativasQuery({
      tipoProyecto,
      presupuestoProyecto: presupuesto,
      urgencia,
      especializaciones: especializacionesRequeridas,
      tenantId,
      usarMatchingIA: true,
      soloActivas: true,
      estadosDisponibilidad: [
        new EstadoDisponibilidad('DISPONIBLE'),
        new EstadoDisponibilidad('OCUPADO')
      ],
      ordenarPor: 'matching',
      direccionOrden: 'desc',
      limite: 20
    })
  }
  
  /**
   * Crea una query para búsqueda geográfica
   */
  static createGeographicSearch(
    latitud: number,
    longitud: number,
    radioKm: number,
    tenantId: string
  ): BuscarAgenciasCreativasQuery {
    return new BuscarAgenciasCreativasQuery({
      coordenadas: { latitud, longitud, radioKm },
      tenantId,
      soloActivas: true,
      ordenarPor: 'distancia',
      direccionOrden: 'asc',
      incluirMetricas: true
    })
  }
}