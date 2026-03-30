/**
 * 📝 ENTIDAD BRIEF CREATIVO - TIER 0
 * 
 * Representa una solicitud de trabajo creativo con IA integrada
 * Incluye análisis automático, matching y optimización de asignación
 */

import { WithTimestamps, WithId } from '@/types'

export type TipoBrief = 
  | 'VIDEO_COMERCIAL'
  | 'SPOT_RADIO'
  | 'DISEÑO_GRAFICO'
  | 'MOTION_GRAPHICS'
  | 'CONTENIDO_DIGITAL'
  | 'CAMPANA_INTEGRAL'
  | 'BTL_ACTIVACION'
  | 'PACKAGING'
  | 'BRANDING'
  | 'EDITORIAL';

export type UrgenciaBrief = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'EXPRESS';

export type EstadoBrief = 
  | 'BORRADOR'
  | 'PENDIENTE_ASIGNACION'
  | 'ASIGNADO'
  | 'EN_PRODUCCION'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface BriefCreativoProps {
  // Información básica
  titulo: string
  descripcion: string
  tipo: TipoBrief
  clienteId: string
  campanaId?: string
  
  // Especificaciones técnicas
  especificaciones: {
    duracion?: number // segundos para video/audio
    dimensiones?: {
      ancho: number
      alto: number
      unidad: 'px' | 'mm' | 'cm'
    }
    formatos: string[] // MP4, JPG, PDF, etc.
    calidad: 'HD' | '4K' | '8K' | 'PRINT_300DPI' | 'WEB_72DPI'
    aspectRatio?: string // 16:9, 1:1, 9:16, etc.
  }
  
  // Requerimientos creativos
  requerimientos: {
    tono: string[] // 'Emocional', 'Corporativo', 'Juvenil', etc.
    audienciaObjetivo: string
    mensajeClave: string
    callToAction?: string
    restricciones?: string[]
    referencias?: string[] // URLs o descripciones
  }
  
  // Timeline y presupuesto
  fechaLimite: Date
  urgencia: UrgenciaBrief
  presupuestoEstimado: number
  presupuestoMaximo?: number
  
  // Entregables
  entregables: Array<{
    nombre: string
    descripcion: string
    formato: string
    fechaEntrega: Date
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  }>
  
  // Estado y asignación
  estado: EstadoBrief
  agenciaAsignadaId?: string
  fechaAsignacion?: Date
  
  // Análisis IA
  cortexAnalysis?: {
    complejidadScore: number // 1-10
    tiempoEstimado: number // horas
    agenciasSugeridas: Array<{
      agenciaId: string
      matchScore: number
      razon: string
    }>
    riesgosDetectados: string[]
    recomendaciones: string[]
    ultimoAnalisis: Date
  }
  
  // Historial de cambios
  versiones: Array<{
    version: number
    cambios: string
    fechaCambio: Date
    cambiadoPor: string
  }>
  
  // Metadata
  tenantId: string
  creadoPor: string
  
  // Comunicación
  comentarios: Array<{
    id: string
    autor: string
    mensaje: string
    fecha: Date
    tipo: 'COMENTARIO' | 'REVISION' | 'APROBACION'
  }>
}

export class BriefCreativo implements WithId<BriefCreativoProps>, WithTimestamps<BriefCreativoProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: BriefCreativoProps,
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
  
  get tipo(): TipoBrief {
    return this.props.tipo
  }
  
  get estado(): EstadoBrief {
    return this.props.estado
  }
  
  get urgencia(): UrgenciaBrief {
    return this.props.urgencia
  }
  
  get fechaLimite(): Date {
    return this.props.fechaLimite
  }
  
  get presupuestoEstimado(): number {
    return this.props.presupuestoEstimado
  }
  
  get agenciaAsignadaId(): string | undefined {
    return this.props.agenciaAsignadaId
  }
  
  // Métodos de negocio
  
  /**
   * Asigna el brief a una agencia
   */
  asignarAgencia(agenciaId: string, asignadoPor: string): void {
    if (this.props.estado !== 'PENDIENTE_ASIGNACION') {
      throw new Error('El brief debe estar en estado PENDIENTE_ASIGNACION para ser asignado')
    }
    
    this.props.agenciaAsignadaId = agenciaId
    this.props.fechaAsignacion = new Date()
    this.props.estado = 'ASIGNADO'
    
    this.añadirComentario(
      asignadoPor,
      `Brief asignado a agencia ${agenciaId}`,
      'COMENTARIO'
    )
    
    this.touch()
  }
  
  /**
   * Inicia la producción
   */
  iniciarProduccion(): void {
    if (this.props.estado !== 'ASIGNADO') {
      throw new Error('El brief debe estar asignado para iniciar producción')
    }
    
    this.props.estado = 'EN_PRODUCCION'
    this.touch()
  }
  
  /**
   * Envía para revisión
   */
  enviarRevision(): void {
    if (this.props.estado !== 'EN_PRODUCCION') {
      throw new Error('El brief debe estar en producción para enviar a revisión')
    }
    
    this.props.estado = 'EN_REVISION'
    this.touch()
  }
  
  /**
   * Aprueba el trabajo
   */
  aprobar(aprobadoPor: string): void {
    if (this.props.estado !== 'EN_REVISION') {
      throw new Error('El brief debe estar en revisión para ser aprobado')
    }
    
    this.props.estado = 'APROBADO'
    
    this.añadirComentario(
      aprobadoPor,
      'Trabajo aprobado',
      'APROBACION'
    )
    
    this.touch()
  }
  
  /**
   * Marca como entregado
   */
  marcarEntregado(): void {
    if (this.props.estado !== 'APROBADO') {
      throw new Error('El brief debe estar aprobado para ser marcado como entregado')
    }
    
    this.props.estado = 'ENTREGADO'
    this.touch()
  }
  
  /**
   * Cancela el brief
   */
  cancelar(motivo: string, canceladoPor: string): void {
    const estadosPermitidos: EstadoBrief[] = [
      'BORRADOR',
      'PENDIENTE_ASIGNACION',
      'ASIGNADO',
      'EN_PRODUCCION'
    ]
    
    if (!estadosPermitidos.includes(this.props.estado)) {
      throw new Error('No se puede cancelar un brief en este estado')
    }
    
    this.props.estado = 'CANCELADO'
    
    this.añadirComentario(
      canceladoPor,
      `Brief cancelado: ${motivo}`,
      'COMENTARIO'
    )
    
    this.touch()
  }
  
  /**
   * Actualiza el análisis de Cortex
   */
  actualizarAnalisisCortex(analisis: NonNullable<BriefCreativoProps['cortexAnalysis']>): void {
    this.props.cortexAnalysis = {
      ...analisis,
      ultimoAnalisis: new Date()
    }
    this.touch()
  }
  
  /**
   * Añade un comentario
   */
  añadirComentario(
    autor: string,
    mensaje: string,
    tipo: 'COMENTARIO' | 'REVISION' | 'APROBACION' = 'COMENTARIO'
  ): void {
    const comentario = {
      id: crypto.randomUUID(),
      autor,
      mensaje,
      fecha: new Date(),
      tipo
    }
    
    this.props.comentarios.push(comentario)
    this.touch()
  }
  
  /**
   * Actualiza una nueva versión
   */
  crearNuevaVersion(cambios: string, cambiadoPor: string): void {
    const nuevaVersion = {
      version: this.props.versiones.length + 1,
      cambios,
      fechaCambio: new Date(),
      cambiadoPor
    }
    
    this.props.versiones.push(nuevaVersion)
    this.touch()
  }
  
  /**
   * Verifica si está vencido
   */
  estaVencido(): boolean {
    return new Date() > this.props.fechaLimite && 
           !['ENTREGADO', 'CANCELADO'].includes(this.props.estado)
  }
  
  /**
   * Calcula días restantes
   */
  diasRestantes(): number {
    const ahora = new Date()
    const diferencia = this.props.fechaLimite.getTime() - ahora.getTime()
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }
  
  /**
   * Verifica si es urgente
   */
  esUrgente(): boolean {
    return this.props.urgencia === 'CRITICA' || 
           this.props.urgencia === 'EXPRESS' ||
           this.diasRestantes() <= 2
  }
  
  /**
   * Obtiene el score de complejidad
   */
  getComplejidadScore(): number {
    return this.props.cortexAnalysis?.complejidadScore || 5
  }
  
  /**
   * Obtiene las agencias sugeridas
   */
  getAgenciasSugeridas(): Array<{ agenciaId: string; matchScore: number; razon: string }> {
    return this.props.cortexAnalysis?.agenciasSugeridas || []
  }
  
  /**
   * Actualiza el presupuesto
   */
  actualizarPresupuesto(nuevoPresupuesto: number, presupuestoMaximo?: number): void {
    if (nuevoPresupuesto <= 0) {
      throw new Error('El presupuesto debe ser mayor a 0')
    }
    
    if (presupuestoMaximo && nuevoPresupuesto > presupuestoMaximo) {
      throw new Error('El presupuesto estimado no puede ser mayor al máximo')
    }
    
    this.props.presupuestoEstimado = nuevoPresupuesto
    if (presupuestoMaximo) {
      this.props.presupuestoMaximo = presupuestoMaximo
    }
    
    this.touch()
  }
  
  /**
   * Añade un entregable
   */
  añadirEntregable(
    nombre: string,
    descripcion: string,
    formato: string,
    fechaEntrega: Date,
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA'
  ): void {
    const entregable = {
      nombre,
      descripcion,
      formato,
      fechaEntrega,
      prioridad
    }
    
    this.props.entregables.push(entregable)
    this.touch()
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): BriefCreativoProps {
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
      throw new Error('El título del brief es requerido')
    }
    
    if (!this.props.descripcion?.trim()) {
      throw new Error('La descripción del brief es requerida')
    }
    
    if (!this.props.clienteId?.trim()) {
      throw new Error('El ID del cliente es requerido')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    if (!this.props.creadoPor?.trim()) {
      throw new Error('El campo creadoPor es requerido')
    }
    
    if (this.props.presupuestoEstimado <= 0) {
      throw new Error('El presupuesto estimado debe ser mayor a 0')
    }
    
    if (this.props.fechaLimite <= new Date()) {
      throw new Error('La fecha límite debe ser futura')
    }
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: BriefCreativoProps): BriefCreativo {
    const id = crypto.randomUUID()
    return new BriefCreativo(id, {
      ...props,
      estado: 'BORRADOR',
      comentarios: [],
      versiones: [{
        version: 1,
        cambios: 'Versión inicial',
        fechaCambio: new Date(),
        cambiadoPor: props.creadoPor
      }]
    })
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: BriefCreativoProps,
    createdAt: Date,
    updatedAt: Date
  ): BriefCreativo {
    return new BriefCreativo(id, props, createdAt, updatedAt)
  }
}