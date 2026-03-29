/**
 * 🎨 ENTIDAD PORTFOLIO TRABAJO - TIER 0
 * 
 * Representa un trabajo individual en el portfolio de una agencia
 * Incluye análisis automático de calidad y performance con IA
 */

import { WithTimestamps, WithId } from '@/types'

export type TipoTrabajo = 
  | 'VIDEO_COMERCIAL'
  | 'SPOT_RADIO'
  | 'DISEÑO_GRAFICO'
  | 'MOTION_GRAPHICS'
  | 'CONTENIDO_DIGITAL'
  | 'BRANDING'
  | 'PACKAGING'
  | 'EDITORIAL'
  | 'BTL_ACTIVACION'
  | 'FOTOGRAFIA'
  | 'ILUSTRACION'
  | 'DESARROLLO_WEB';

export type EstadoTrabajo = 'ACTIVO' | 'ARCHIVADO' | 'DESTACADO' | 'PRIVADO';

export interface PortfolioTrabajoProps {
  // Información básica
  titulo: string
  descripcion: string
  tipo: TipoTrabajo
  agenciaCreativaId: string
  clienteNombre: string
  
  // Detalles del proyecto
  año: number
  duracion?: number // segundos para video/audio
  categoria: string
  industria: string
  briefOriginal?: string
  
  // Archivos y medios
  archivos: Array<{
    id: string
    nombre: string
    tipo: 'VIDEO' | 'AUDIO' | 'IMAGEN' | 'PDF' | 'OTRO'
    url: string
    thumbnail?: string
    tamaño: number // bytes
    formato: string
    esPrincipal: boolean
  }>
  
  // Especificaciones técnicas
  especificacionesTecnicas: {
    resolucion?: string // 1920x1080, 4K, etc.
    fps?: number
    codec?: string
    bitrate?: number
    colorSpace?: string
    aspectRatio?: string
    duracionSegundos?: number
  }
  
  // Métricas de performance
  metricas: {
    vistas?: number
    likes?: number
    shares?: number
    comentarios?: number
    alcance?: number
    engagement?: number
    conversiones?: number
    roi?: number
  }
  
  // Reconocimientos y premios
  premios: Array<{
    nombre: string
    categoria: string
    año: number
    organizacion: string
    posicion?: string // 'Oro', 'Plata', 'Bronce', 'Finalista'
  }>
  
  // Tags y categorización
  tags: string[]
  habilidadesRequeridas: string[]
  herramientasUtilizadas: string[]
  
  // Análisis de calidad IA
  cortexQualityAnalysis?: {
    scoreCalidad: number // 0-10
    scoreCreatividad: number // 0-10
    scoreTecnico: number // 0-10
    scoreImpacto: number // 0-10
    fortalezas: string[]
    areasOptimizacion: string[]
    comparacionIndustria: {
      percentil: number
      benchmark: string
    }
    prediccionPerformance: number
    ultimoAnalisis: Date
  }
  
  // Información de colaboración
  equipoCreativo: Array<{
    nombre: string
    rol: string
    contactoId?: string
  }>
  
  // Estado y visibilidad
  estado: EstadoTrabajo
  esPublico: boolean
  destacado: boolean
  fechaPublicacion?: Date
  
  // Metadata
  tenantId: string
  creadoPor: string
  
  // Referencias externas
  urlsExternas?: {
    behance?: string
    dribbble?: string
    vimeo?: string
    youtube?: string
    instagram?: string
    sitioWeb?: string
  }
  
  // Feedback y comentarios
  feedback: Array<{
    id: string
    autor: string
    comentario: string
    rating: number // 1-5
    fecha: Date
    tipo: 'CLIENTE' | 'INTERNO' | 'PUBLICO'
  }>
}

export class PortfolioTrabajo implements WithId<PortfolioTrabajoProps>, WithTimestamps<PortfolioTrabajoProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: PortfolioTrabajoProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    
    this.validate()
  }
  
  // Getters principales
  get titulo(): string {
    return this.props.titulo
  }
  
  get tipo(): TipoTrabajo {
    return this.props.tipo
  }
  
  get agenciaCreativaId(): string {
    return this.props.agenciaCreativaId
  }
  
  get clienteNombre(): string {
    return this.props.clienteNombre
  }
  
  get año(): number {
    return this.props.año
  }
  
  get estado(): EstadoTrabajo {
    return this.props.estado
  }
  
  get destacado(): boolean {
    return this.props.destacado
  }
  
  get esPublico(): boolean {
    return this.props.esPublico
  }
  
  // Métodos de negocio
  
  /**
   * Añade un archivo al portfolio
   */
  añadirArchivo(
    nombre: string,
    tipo: 'VIDEO' | 'AUDIO' | 'IMAGEN' | 'PDF' | 'OTRO',
    url: string,
    formato: string,
    tamaño: number,
    esPrincipal: boolean = false,
    thumbnail?: string
  ): void {
    // Si es principal, desmarcar otros como principales
    if (esPrincipal) {
      this.props.archivos.forEach(archivo => {
        archivo.esPrincipal = false
      })
    }
    
    const archivo = {
      id: crypto.randomUUID(),
      nombre,
      tipo,
      url,
      thumbnail,
      tamaño,
      formato,
      esPrincipal
    }
    
    this.props.archivos.push(archivo)
    this.touch()
  }
  
  /**
   * Elimina un archivo
   */
  eliminarArchivo(archivoId: string): void {
    const index = this.props.archivos.findIndex(a => a.id === archivoId)
    if (index === -1) {
      throw new Error('Archivo no encontrado')
    }
    
    this.props.archivos.splice(index, 1)
    this.touch()
  }
  
  /**
   * Marca/desmarca como destacado
   */
  toggleDestacado(): void {
    this.props.destacado = !this.props.destacado
    this.touch()
  }
  
  /**
   * Cambia la visibilidad pública
   */
  cambiarVisibilidad(esPublico: boolean): void {
    this.props.esPublico = esPublico
    if (esPublico && !this.props.fechaPublicacion) {
      this.props.fechaPublicacion = new Date()
    }
    this.touch()
  }
  
  /**
   * Actualiza el estado
   */
  actualizarEstado(nuevoEstado: EstadoTrabajo): void {
    this.props.estado = nuevoEstado
    this.touch()
  }
  
  /**
   * Añade un premio
   */
  añadirPremio(
    nombre: string,
    categoria: string,
    año: number,
    organizacion: string,
    posicion?: string
  ): void {
    const premio = {
      nombre,
      categoria,
      año,
      organizacion,
      posicion
    }
    
    this.props.premios.push(premio)
    this.touch()
  }
  
  /**
   * Actualiza métricas de performance
   */
  actualizarMetricas(metricas: Partial<PortfolioTrabajoProps['metricas']>): void {
    this.props.metricas = {
      ...this.props.metricas,
      ...metricas
    }
    this.touch()
  }
  
  /**
   * Añade feedback
   */
  añadirFeedback(
    autor: string,
    comentario: string,
    rating: number,
    tipo: 'CLIENTE' | 'INTERNO' | 'PUBLICO' = 'PUBLICO'
  ): void {
    if (rating < 1 || rating > 5) {
      throw new Error('El rating debe estar entre 1 y 5')
    }
    
    const feedback = {
      id: crypto.randomUUID(),
      autor,
      comentario,
      rating,
      fecha: new Date(),
      tipo
    }
    
    this.props.feedback.push(feedback)
    this.touch()
  }
  
  /**
   * Actualiza análisis de Cortex Quality
   */
  actualizarAnalisisCalidad(analisis: NonNullable<PortfolioTrabajoProps['cortexQualityAnalysis']>): void {
    this.props.cortexQualityAnalysis = {
      ...analisis,
      ultimoAnalisis: new Date()
    }
    this.touch()
  }
  
  /**
   * Añade miembro del equipo creativo
   */
  añadirMiembroEquipo(nombre: string, rol: string, contactoId?: string): void {
    const miembro = {
      nombre,
      rol,
      contactoId
    }
    
    this.props.equipoCreativo.push(miembro)
    this.touch()
  }
  
  /**
   * Añade tags
   */
  añadirTags(tags: string[]): void {
    const nuevos = tags.filter(tag => !this.props.tags.includes(tag))
    this.props.tags.push(...nuevos)
    this.touch()
  }
  
  /**
   * Obtiene el score promedio de calidad
   */
  getScoreCalidadPromedio(): number {
    const analysis = this.props.cortexQualityAnalysis
    if (!analysis) return 0
    
    return (
      analysis.scoreCalidad +
      analysis.scoreCreatividad +
      analysis.scoreTecnico +
      analysis.scoreImpacto
    ) / 4
  }
  
  /**
   * Obtiene el rating promedio del feedback
   */
  getRatingPromedio(): number {
    if (this.props.feedback.length === 0) return 0
    
    const suma = this.props.feedback.reduce((acc, f) => acc + f.rating, 0)
    return suma / this.props.feedback.length
  }
  
  /**
   * Verifica si tiene premios
   */
  tienePremios(): boolean {
    return this.props.premios.length > 0
  }
  
  /**
   * Obtiene el archivo principal
   */
  getArchivoPrincipal(): PortfolioTrabajoProps['archivos'][0] | null {
    return this.props.archivos.find(a => a.esPrincipal) || 
           this.props.archivos[0] || 
           null
  }
  
  /**
   * Calcula el engagement rate si hay métricas
   */
  getEngagementRate(): number {
    const { vistas, likes, shares, comentarios } = this.props.metricas
    if (!vistas || vistas === 0) return 0
    
    const interacciones = (likes || 0) + (shares || 0) + (comentarios || 0)
    return (interacciones / vistas) * 100
  }
  
  /**
   * Verifica si es trabajo reciente (último año)
   */
  esTrabajoReciente(): boolean {
    const añoActual = new Date().getFullYear()
    return this.props.año >= añoActual - 1
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): PortfolioTrabajoProps {
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
    if (!this.props.titulo?.trim()) {
      throw new Error('El título del trabajo es requerido')
    }
    
    if (!this.props.descripcion?.trim()) {
      throw new Error('La descripción del trabajo es requerida')
    }
    
    if (!this.props.agenciaCreativaId?.trim()) {
      throw new Error('El ID de la agencia es requerido')
    }
    
    if (!this.props.clienteNombre?.trim()) {
      throw new Error('El nombre del cliente es requerido')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    if (!this.props.creadoPor?.trim()) {
      throw new Error('El campo creadoPor es requerido')
    }
    
    if (this.props.año < 1900 || this.props.año > new Date().getFullYear() + 1) {
      throw new Error('El año debe ser válido')
    }
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: PortfolioTrabajoProps): PortfolioTrabajo {
    const id = crypto.randomUUID()
    return new PortfolioTrabajo(id, {
      ...props,
      archivos: props.archivos || [],
      premios: props.premios || [],
      tags: props.tags || [],
      habilidadesRequeridas: props.habilidadesRequeridas || [],
      herramientasUtilizadas: props.herramientasUtilizadas || [],
      equipoCreativo: props.equipoCreativo || [],
      feedback: props.feedback || [],
      metricas: props.metricas || {},
      estado: props.estado || 'ACTIVO',
      esPublico: props.esPublico ?? true,
      destacado: props.destacado ?? false
    })
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: PortfolioTrabajoProps,
    createdAt: Date,
    updatedAt: Date
  ): PortfolioTrabajo {
    return new PortfolioTrabajo(id, props, createdAt, updatedAt)
  }
}