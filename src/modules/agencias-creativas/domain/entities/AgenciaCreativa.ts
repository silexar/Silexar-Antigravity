/**
 * 🎨 ENTIDAD AGENCIA CREATIVA - TIER 0
 * 
 * Entidad principal que representa una agencia creativa en el sistema
 * Incluye toda la información, capacidades y métricas de performance
 */

// Tipos base para entidades
interface WithId<T = any> {
  id: string
}

interface WithTimestamps<T = any> {
  createdAt: Date
  updatedAt: Date
}
import { RutAgenciaCreativa } from '../value-objects/RutAgenciaCreativa'
import { TipoAgenciaCreativa } from '../value-objects/TipoAgenciaCreativa'
import { EspecializacionCreativa } from '../value-objects/EspecializacionCreativa'
import { NivelExperiencia } from '../value-objects/NivelExperiencia'
import { ScoreCreativo } from '../value-objects/ScoreCreativo'
import { EstadoDisponibilidad } from '../value-objects/EstadoDisponibilidad'
import { RangoPresupuesto } from '../value-objects/RangoPresupuesto'

export interface AgenciaCreativaProps {
  // Información básica
  nombre: string
  razonSocial: string
  rut: RutAgenciaCreativa
  email: string
  telefono: string
  sitioWeb?: string
  
  // Clasificación y especialización
  tipo: TipoAgenciaCreativa
  especializaciones: EspecializacionCreativa[]
  nivelExperiencia: NivelExperiencia
  rangoPresupuesto: RangoPresupuesto
  
  // Ubicación
  direccion: string
  ciudad: string
  region: string
  pais: string
  coordenadas?: {
    latitud: number
    longitud: number
  }
  
  // Performance y métricas
  scoreCreativo: ScoreCreativo
  estadoDisponibilidad: EstadoDisponibilidad
  
  // Métricas de performance
  metricas: {
    proyectosCompletados: number
    proyectosActivos: number
    promedioCalidad: number // 0-10
    puntualidadEntregas: number // 0-100%
    tiempoRespuesta: number // horas promedio
    satisfaccionClientes: number // 0-10
    volumenFacturado: number // CLP
    crecimientoAnual: number // %
  }
  
  // Capacidades técnicas
  capacidadesTecnicas: {
    video4K: boolean
    audioHD: boolean
    motionGraphics: boolean
    colorGrading: boolean
    animacion3D: boolean
    liveAction: boolean
    postProduccion: boolean
    efectosEspeciales: boolean
    realidadAumentada: boolean
    realidadVirtual: boolean
  }
  
  // Certificaciones y awards
  certificaciones: string[]
  premios: Array<{
    nombre: string
    año: number
    categoria: string
    proyecto?: string
  }>
  
  // Información comercial
  añosExperiencia: number
  numeroEmpleados: number
  clientesPrincipales: string[]
  sectoresExperiencia: string[]
  
  // Portfolio y referencias
  portfolioUrl?: string
  behanceUrl?: string
  dribbbleUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  
  // Configuración de colaboración
  configuracion: {
    tiempoRespuestaPromedio: number // horas
    metodologiaTrabajo: string[]
    herramientasColaboracion: string[]
    formatosEntrega: string[]
    politicasRevision: {
      numeroRevisionesIncluidas: number
      tiempoRevision: number // horas
      costoRevisionAdicional: number
    }
  }
  
  // Estado y actividad
  activo: boolean
  fechaUltimaActividad: Date
  fechaRegistro: Date
  
  // Información de contacto principal
  contactoPrincipalId?: string
  
  // Metadata del sistema
  tenantId: string
  creadoPor: string
  
  // Integración con IA
  cortexAnalysis?: {
    scoreIA: number
    fortalezas: string[]
    areasOptimizacion: string[]
    recomendacionesAsignacion: string[]
    prediccionPerformance: number
    ultimoAnalisis: Date
  }
}

export class AgenciaCreativa implements WithId<AgenciaCreativaProps>, WithTimestamps<AgenciaCreativaProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: AgenciaCreativaProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    
    this.validate()
  }
  
  // Getters para propiedades principales
  get nombre(): string {
    return this.props.nombre
  }
  
  get razonSocial(): string {
    return this.props.razonSocial
  }
  
  get rut(): RutAgenciaCreativa {
    return this.props.rut
  }
  
  get email(): string {
    return this.props.email
  }
  
  get telefono(): string {
    return this.props.telefono
  }
  
  get tipo(): TipoAgenciaCreativa {
    return this.props.tipo
  }
  
  get especializaciones(): EspecializacionCreativa[] {
    return this.props.especializaciones
  }
  
  get scoreCreativo(): ScoreCreativo {
    return this.props.scoreCreativo
  }
  
  get estadoDisponibilidad(): EstadoDisponibilidad {
    return this.props.estadoDisponibilidad
  }
  
  get metricas() {
    return this.props.metricas
  }
  
  get activo(): boolean {
    return this.props.activo
  }
  
  // Métodos de negocio
  
  /**
   * Actualiza el score creativo basado en performance reciente
   */
  actualizarScoreCreativo(nuevoScore: number, factores: string[]): void {
    this.props.scoreCreativo = new ScoreCreativo(nuevoScore)
    this.props.cortexAnalysis = {
      ...this.props.cortexAnalysis,
      scoreIA: nuevoScore,
      fortalezas: factores.filter(f => f.startsWith('+')).map(f => f.substring(1)),
      areasOptimizacion: factores.filter(f => f.startsWith('-')).map(f => f.substring(1)),
      ultimoAnalisis: new Date()
    } as unknown
    this.touch()
  }
  
  /**
   * Actualiza el estado de disponibilidad
   */
  actualizarDisponibilidad(nuevoEstado: EstadoDisponibilidad): void {
    this.props.estadoDisponibilidad = nuevoEstado
    this.props.fechaUltimaActividad = new Date()
    this.touch()
  }
  
  /**
   * Registra la finalización de un proyecto
   */
  registrarProyectoCompletado(calidad: number, puntual: boolean, satisfaccion: number): void {
    this.props.metricas.proyectosCompletados += 1
    this.props.metricas.proyectosActivos = Math.max(0, this.props.metricas.proyectosActivos - 1)
    
    // Actualizar promedios
    const totalProyectos = this.props.metricas.proyectosCompletados
    this.props.metricas.promedioCalidad = 
      (this.props.metricas.promedioCalidad * (totalProyectos - 1) + calidad) / totalProyectos
    
    this.props.metricas.satisfaccionClientes = 
      (this.props.metricas.satisfaccionClientes * (totalProyectos - 1) + satisfaccion) / totalProyectos
    
    // Actualizar puntualidad
    if (puntual) {
      this.props.metricas.puntualidadEntregas = 
        (this.props.metricas.puntualidadEntregas * (totalProyectos - 1) + 100) / totalProyectos
    } else {
      this.props.metricas.puntualidadEntregas = 
        (this.props.metricas.puntualidadEntregas * (totalProyectos - 1) + 0) / totalProyectos
    }
    
    this.touch()
  }
  
  /**
   * Asigna un nuevo proyecto
   */
  asignarProyecto(): void {
    this.props.metricas.proyectosActivos += 1
    this.props.fechaUltimaActividad = new Date()
    
    // Actualizar disponibilidad basado en carga de trabajo
    const capacidadMaxima = this.calcularCapacidadMaxima()
    const porcentajeCarga = (this.props.metricas.proyectosActivos / capacidadMaxima) * 100
    
    if (porcentajeCarga >= 90) {
      this.props.estadoDisponibilidad = new EstadoDisponibilidad('NO_DISPONIBLE')
    } else if (porcentajeCarga >= 70) {
      this.props.estadoDisponibilidad = new EstadoDisponibilidad('OCUPADO')
    }
    
    this.touch()
  }
  
  /**
   * Verifica si la agencia puede manejar un tipo específico de proyecto
   */
  puedeRealizarProyecto(tipoProyecto: string, presupuesto: number): boolean {
    // Verificar especialización
    const tieneEspecializacion = this.props.especializaciones.some(esp => 
      esp.value.toLowerCase().includes(tipoProyecto.toLowerCase())
    )
    
    // Verificar presupuesto
    const dentroPresupuesto = this.props.rangoPresupuesto.canHandle(presupuesto)
    
    // Verificar disponibilidad
    const disponible = this.props.estadoDisponibilidad.value !== 'NO_DISPONIBLE'
    
    return tieneEspecializacion && dentroPresupuesto && disponible && this.props.activo
  }
  
  /**
   * Calcula la capacidad máxima de proyectos simultáneos
   */
  private calcularCapacidadMaxima(): number {
    const baseCapacity = Math.floor(this.props.numeroEmpleados / 3) // 3 empleados por proyecto promedio
    const experienceMultiplier = this.props.nivelExperiencia.scoreMultiplier
    return Math.max(1, Math.floor(baseCapacity * experienceMultiplier))
  }
  
  /**
   * Obtiene el score de matching para un proyecto específico
   */
  getMatchingScore(
    tipoProyecto: string, 
    presupuesto: number, 
    urgencia: 'baja' | 'media' | 'alta' | 'critica'
  ): number {
    let score = 0
    
    // Score base por especialización (40%)
    const especializacionMatch = this.props.especializaciones.some(esp => 
      esp.value.toLowerCase().includes(tipoProyecto.toLowerCase())
    )
    score += especializacionMatch ? 40 : 0
    
    // Score por calidad histórica (25%)
    score += (this.props.metricas.promedioCalidad / 10) * 25
    
    // Score por puntualidad (20%)
    score += (this.props.metricas.puntualidadEntregas / 100) * 20
    
    // Score por disponibilidad (10%)
    const disponibilidadScore = this.props.estadoDisponibilidad.canAcceptProjects ? 1 : 0.3
    score += disponibilidadScore * 10
    
    // Score por presupuesto (5%)
    const presupuestoMatch = this.props.rangoPresupuesto.canHandle(presupuesto)
    score += presupuestoMatch ? 5 : 0
    
    // Penalización por urgencia si no está disponible
    if (urgencia === 'critica' && this.props.estadoDisponibilidad.value === 'OCUPADO') {
      score *= 0.7
    }
    
    return Math.min(100, Math.max(0, score))
  }
  
  /**
   * Desactiva la agencia
   */
  desactivar(motivo: string): void {
    this.props.activo = false
    this.props.fechaUltimaActividad = new Date()
    this.touch()
  }
  
  /**
   * Activa la agencia
   */
  activar(): void {
    this.props.activo = true
    this.props.fechaUltimaActividad = new Date()
    this.touch()
  }
  
  /**
   * Actualiza la información de contacto
   */
  actualizarContacto(email: string, telefono: string): void {
    this.props.email = email
    this.props.telefono = telefono
    this.touch()
  }
  
  /**
   * Añade una certificación
   */
  añadirCertificacion(certificacion: string): void {
    if (!this.props.certificaciones.includes(certificacion)) {
      this.props.certificaciones.push(certificacion)
      this.touch()
    }
  }
  
  /**
   * Añade un premio
   */
  añadirPremio(nombre: string, año: number, categoria: string, proyecto?: string): void {
    this.props.premios.push({ nombre, año, categoria, proyecto })
    this.touch()
  }
  
  /**
   * Actualiza el análisis de Cortex-Creative
   */
  actualizarAnalisisCortex(analisis: NonNullable<AgenciaCreativaProps['cortexAnalysis']>): void {
    this.props.cortexAnalysis = {
      ...analisis,
      ultimoAnalisis: new Date()
    }
    this.touch()
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): AgenciaCreativaProps {
    return { ...this.props }
  }
  
  /**
   * Actualiza el timestamp de modificación
   */
  private touch(): void {
    (this as unknown).updatedAt = new Date()
  }
  
  /**
   * Valida la entidad
   */
  private validate(): void {
    if (!this.props.nombre?.trim()) {
      throw new Error('El nombre de la agencia es requerido')
    }
    
    if (!this.props.razonSocial?.trim()) {
      throw new Error('La razón social es requerida')
    }
    
    if (!this.props.email?.trim()) {
      throw new Error('El email es requerido')
    }
    
    if (!this.props.telefono?.trim()) {
      throw new Error('El teléfono es requerido')
    }
    
    if (this.props.especializaciones.length === 0) {
      throw new Error('Debe tener al menos una especialización')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    if (!this.props.creadoPor?.trim()) {
      throw new Error('El campo creadoPor es requerido')
    }
  }
  
  /**
   * Crea una nueva instancia desde propiedades
   */
  static create(props: AgenciaCreativaProps): AgenciaCreativa {
    const id = globalThis.crypto?.randomUUID?.() || 
               `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return new AgenciaCreativa(id, props)
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: AgenciaCreativaProps,
    createdAt: Date,
    updatedAt: Date
  ): AgenciaCreativa {
    return new AgenciaCreativa(id, props, createdAt, updatedAt)
  }
}