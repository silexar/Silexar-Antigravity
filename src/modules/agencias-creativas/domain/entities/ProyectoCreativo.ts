/**
 * 🎯 ENTIDAD PROYECTO CREATIVO - TIER 0
 * 
 * Representa un proyecto individual asignado a una agencia creativa
 * Incluye brief, timeline, entregas y evaluación de calidad
 */

import { WithTimestamps, WithId } from '@/types'

export interface ProyectoCreativoProps {
  // Información básica del proyecto
  nombre: string
  descripcion: string
  codigo: string // Código único del proyecto
  
  // Relaciones
  agenciaCreativaId: string
  contactoResponsableId: string
  clienteId: string
  campañaId?: string
  
  // Clasificación del proyecto
  tipoProyecto: 'Video' | 'Audio' | 'Grafico' | 'Digital' | 'BTL' | 'Integral'
  categoria: string // Comercial TV, Spot Radio, Banner Digital, etc.
  complejidad: 'Baja' | 'Media' | 'Alta' | 'Critica'
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente'
  
  // Información comercial
  presupuesto: {
    montoTotal: number
    moneda: string
    desglose: Array<{
      concepto: string
      monto: number
      porcentaje: number
    }>
    aprobado: boolean
    fechaAprobacion?: Date
    aprobadoPor?: string
  }
  
  // Timeline y fechas
  fechas: {
    solicitud: Date
    briefing: Date
    inicioProduccion?: Date
    primeraEntrega?: Date
    entregaFinal: Date
    fechaLimite: Date
    extension?: {
      nuevaFecha: Date
      motivo: string
      aprobadoPor: string
      fechaSolicitud: Date
    }
  }
  
  // Brief creativo
  brief: {
    objetivo: string
    audienciaObjetivo: string
    mensajeClave: string
    tonoComunicacion: string
    referencias: string[]
    restricciones: string[]
    especificacionesTecnicas: {
      formatos: string[]
      duraciones?: number[]
      resoluciones?: string[]
      aspectRatios?: string[]
      codecsRequeridos?: string[]
      especificacionesAudio?: string[]
    }
    entregables: Array<{
      tipo: string
      descripcion: string
      cantidad: number
      formato: string
      especificaciones: string
    }>
  }
  
  // Estado y progreso
  estado: 'Briefing' | 'Produccion' | 'Revision' | 'Aprobado' | 'Entregado' | 'Cancelado'
  progreso: number // 0-100%
  
  // Entregas y versiones
  entregas: Array<{
    id: string
    version: string
    fecha: Date
    tipo: 'Borrador' | 'Primera_Entrega' | 'Revision' | 'Final'
    archivos: Array<{
      nombre: string
      url: string
      tipo: string
      tamaño: number
      checksum: string
    }>
    comentarios?: string
    entregadoPor: string
    estado: 'Pendiente_Review' | 'Aprobado' | 'Requiere_Cambios' | 'Rechazado'
  }>
  
  // Feedback y revisiones
  revisiones: Array<{
    id: string
    entregaId: string
    fecha: Date
    reviewerNombre: string
    reviewerId: string
    comentarios: string
    cambiosSolicitados: Array<{
      elemento: string
      descripcion: string
      prioridad: 'Baja' | 'Media' | 'Alta' | 'Critica'
      timestamp?: string // Para cambios en video/audio
    }>
    aprobado: boolean
    tiempoRevision: number // minutos
  }>
  
  // Evaluación de calidad
  evaluacionCalidad?: {
    scoreGeneral: number // 0-10
    criterios: {
      creatividad: number
      calidadTecnica: number
      adherenciaBrief: number
      innovacion: number
      impactoVisual: number
      calidadAudio?: number
      usabilidad?: number
    }
    comentarios: string
    evaluadoPor: string
    fechaEvaluacion: Date
    recomendaciones: string[]
  }
  
  // Métricas de performance
  metricas: {
    tiempoTotal: number // horas
    tiempoProduccion: number // horas
    tiempoRevision: number // horas
    numeroRevisiones: number
    cumplimientoDeadline: boolean
    diasRetraso?: number
    satisfaccionCliente: number // 0-10
    eficienciaProduccion: number // 0-100%
  }
  
  // Recursos utilizados
  recursos: {
    equipoAsignado: Array<{
      contactoId: string
      rol: string
      horasAsignadas: number
      horasReales?: number
    }>
    herramientasUtilizadas: string[]
    recursosExternos?: Array<{
      proveedor: string
      servicio: string
      costo: number
    }>
  }
  
  // Comunicación y colaboración
  comunicacion: {
    canalPrincipal: 'Email' | 'WhatsApp' | 'Slack' | 'Teams' | 'Telefono'
    frecuenciaReportes: 'Diario' | 'Semanal' | 'Hitos' | 'Bajo_Demanda'
    ultimaComunicacion: Date
    proximaReunion?: Date
  }
  
  // Metadata del sistema
  tenantId: string
  creadoPor: string
  
  // Flags de estado
  activo: boolean
  facturado: boolean
  archivado: boolean
  
  // Integración con IA
  cortexAnalysis?: {
    riesgoRetraso: number // 0-100%
    prediccionCalidad: number // 0-10
    recomendacionesOptimizacion: string[]
    alertasAutomaticas: Array<{
      tipo: string
      mensaje: string
      prioridad: 'Info' | 'Warning' | 'Error' | 'Critical'
      fecha: Date
    }>
    ultimoAnalisis: Date
  }
}

export class ProyectoCreativo implements WithId<ProyectoCreativoProps>, WithTimestamps<ProyectoCreativoProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: ProyectoCreativoProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    
    this.validate()
  }
  
  // Getters principales
  get nombre(): string {
    return this.props.nombre
  }
  
  get codigo(): string {
    return this.props.codigo
  }
  
  get agenciaCreativaId(): string {
    return this.props.agenciaCreativaId
  }
  
  get estado(): ProyectoCreativoProps['estado'] {
    return this.props.estado
  }
  
  get progreso(): number {
    return this.props.progreso
  }
  
  get presupuesto() {
    return this.props.presupuesto
  }
  
  get fechaEntregaFinal(): Date {
    return this.props.fechas.entregaFinal
  }
  
  get activo(): boolean {
    return this.props.activo
  }
  
  // Métodos de negocio
  
  /**
   * Inicia la producción del proyecto
   */
  iniciarProduccion(): void {
    if (this.props.estado !== 'Briefing') {
      throw new Error('El proyecto debe estar en estado Briefing para iniciar producción')
    }
    
    this.props.estado = 'Produccion'
    this.props.fechas.inicioProduccion = new Date()
    this.props.progreso = 10
    this.touch()
  }
  
  /**
   * Actualiza el progreso del proyecto
   */
  actualizarProgreso(nuevoProgreso: number): void {
    if (nuevoProgreso < 0 || nuevoProgreso > 100) {
      throw new Error('El progreso debe estar entre 0 y 100')
    }
    
    this.props.progreso = nuevoProgreso
    
    // Actualizar estado basado en progreso
    if (nuevoProgreso === 100 && this.props.estado === 'Produccion') {
      this.props.estado = 'Revision'
    }
    
    this.touch()
  }
  
  /**
   * Registra una nueva entrega
   */
  registrarEntrega(
    version: string,
    tipo: ProyectoCreativoProps['entregas'][0]['tipo'],
    archivos: ProyectoCreativoProps['entregas'][0]['archivos'],
    comentarios?: string,
    entregadoPor?: string
  ): string {
    const entregaId = crypto.randomUUID()
    
    const nuevaEntrega: ProyectoCreativoProps['entregas'][0] = {
      id: entregaId,
      version,
      fecha: new Date(),
      tipo,
      archivos,
      comentarios,
      entregadoPor: entregadoPor || 'Sistema',
      estado: 'Pendiente_Review'
    }
    
    this.props.entregas.push(nuevaEntrega)
    
    // Actualizar fechas si es primera entrega
    if (tipo === 'Primera_Entrega' && !this.props.fechas.primeraEntrega) {
      this.props.fechas.primeraEntrega = new Date()
    }
    
    // Cambiar estado a revisión
    if (this.props.estado === 'Produccion') {
      this.props.estado = 'Revision'
    }
    
    this.touch()
    return entregaId
  }
  
  /**
   * Registra una revisión de entrega
   */
  registrarRevision(
    entregaId: string,
    reviewerNombre: string,
    reviewerId: string,
    comentarios: string,
    cambiosSolicitados: ProyectoCreativoProps['revisiones'][0]['cambiosSolicitados'],
    aprobado: boolean
  ): void {
    const entrega = this.props.entregas.find(e => e.id === entregaId)
    if (!entrega) {
      throw new Error('Entrega no encontrada')
    }
    
    const revisionId = crypto.randomUUID()
    const tiempoRevision = Math.floor((Date.now() - entrega.fecha.getTime()) / (1000 * 60)) // minutos
    
    const nuevaRevision: ProyectoCreativoProps['revisiones'][0] = {
      id: revisionId,
      entregaId,
      fecha: new Date(),
      reviewerNombre,
      reviewerId,
      comentarios,
      cambiosSolicitados,
      aprobado,
      tiempoRevision
    }
    
    this.props.revisiones.push(nuevaRevision)
    this.props.metricas.numeroRevisiones += 1
    this.props.metricas.tiempoRevision += tiempoRevision
    
    // Actualizar estado de la entrega
    if (aprobado) {
      entrega.estado = 'Aprobado'
      if (entrega.tipo === 'Final') {
        this.props.estado = 'Aprobado'
        this.props.progreso = 100
      }
    } else {
      entrega.estado = 'Requiere_Cambios'
      this.props.estado = 'Produccion' // Volver a producción
    }
    
    this.touch()
  }
  
  /**
   * Marca el proyecto como entregado
   */
  marcarComoEntregado(): void {
    if (this.props.estado !== 'Aprobado') {
      throw new Error('El proyecto debe estar aprobado para marcarlo como entregado')
    }
    
    this.props.estado = 'Entregado'
    this.props.progreso = 100
    
    // Calcular métricas finales
    this.calcularMetricasFinales()
    
    this.touch()
  }
  
  /**
   * Evalúa la calidad del proyecto
   */
  evaluarCalidad(
    scoreGeneral: number,
    criterios: ProyectoCreativoProps['evaluacionCalidad']['criterios'],
    comentarios: string,
    evaluadoPor: string,
    recomendaciones: string[]
  ): void {
    this.props.evaluacionCalidad = {
      scoreGeneral,
      criterios,
      comentarios,
      evaluadoPor,
      fechaEvaluacion: new Date(),
      recomendaciones
    }
    
    this.props.metricas.satisfaccionCliente = scoreGeneral
    this.touch()
  }
  
  /**
   * Solicita extensión de deadline
   */
  solicitarExtension(nuevaFecha: Date, motivo: string, solicitadoPor: string): void {
    if (nuevaFecha <= this.props.fechas.entregaFinal) {
      throw new Error('La nueva fecha debe ser posterior a la fecha actual de entrega')
    }
    
    this.props.fechas.extension = {
      nuevaFecha,
      motivo,
      aprobadoPor: solicitadoPor,
      fechaSolicitud: new Date()
    }
    
    this.touch()
  }
  
  /**
   * Aprueba la extensión de deadline
   */
  aprobarExtension(aprobadoPor: string): void {
    if (!this.props.fechas.extension) {
      throw new Error('No hay extensión pendiente para aprobar')
    }
    
    this.props.fechas.entregaFinal = this.props.fechas.extension.nuevaFecha
    this.props.fechas.extension.aprobadoPor = aprobadoPor
    
    this.touch()
  }
  
  /**
   * Cancela el proyecto
   */
  cancelar(motivo: string): void {
    this.props.estado = 'Cancelado'
    this.props.activo = false
    this.props.progreso = 0
    
    // Registrar en cortex analysis
    if (this.props.cortexAnalysis) {
      this.props.cortexAnalysis.alertasAutomaticas.push({
        tipo: 'PROYECTO_CANCELADO',
        mensaje: `Proyecto cancelado: ${motivo}`,
        prioridad: 'Error',
        fecha: new Date()
      })
    }
    
    this.touch()
  }
  
  /**
   * Verifica si el proyecto está en riesgo de retraso
   */
  estaEnRiesgoRetraso(): boolean {
    const ahora = new Date()
    const fechaLimite = this.props.fechas.fechaLimite
    const diasRestantes = Math.ceil((fechaLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
    
    // Riesgo si quedan menos de 2 días y progreso < 80%
    return diasRestantes <= 2 && this.props.progreso < 80
  }
  
  /**
   * Calcula el tiempo total transcurrido
   */
  getTiempoTranscurrido(): number {
    const inicio = this.props.fechas.inicioProduccion || this.props.fechas.briefing
    const fin = this.props.estado === 'Entregado' ? 
      this.props.entregas.find(e => e.tipo === 'Final')?.fecha || new Date() : 
      new Date()
    
    return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60)) // horas
  }
  
  /**
   * Obtiene la última entrega
   */
  getUltimaEntrega(): ProyectoCreativoProps['entregas'][0] | null {
    if (this.props.entregas.length === 0) {
      return null
    }
    
    return this.props.entregas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0]
  }
  
  /**
   * Verifica si está dentro del presupuesto
   */
  estaDentroPresupuesto(): boolean {
    const gastado = this.props.recursos.recursosExternos?.reduce((sum, r) => sum + r.costo, 0) || 0
    return gastado <= this.props.presupuesto.montoTotal
  }
  
  /**
   * Actualiza el análisis de Cortex
   */
  actualizarAnalisisCortex(analisis: NonNullable<ProyectoCreativoProps['cortexAnalysis']>): void {
    this.props.cortexAnalysis = {
      ...analisis,
      ultimoAnalisis: new Date()
    }
    this.touch()
  }
  
  /**
   * Calcula métricas finales del proyecto
   */
  private calcularMetricasFinales(): void {
    const tiempoTotal = this.getTiempoTranscurrido()
    this.props.metricas.tiempoTotal = tiempoTotal
    
    // Calcular cumplimiento de deadline
    const fechaEntrega = this.getUltimaEntrega()?.fecha || new Date()
    this.props.metricas.cumplimientoDeadline = fechaEntrega <= this.props.fechas.entregaFinal
    
    if (!this.props.metricas.cumplimientoDeadline) {
      this.props.metricas.diasRetraso = Math.ceil(
        (fechaEntrega.getTime() - this.props.fechas.entregaFinal.getTime()) / (1000 * 60 * 60 * 24)
      )
    }
    
    // Calcular eficiencia de producción
    const tiempoEstimado = this.calcularTiempoEstimado()
    this.props.metricas.eficienciaProduccion = Math.min(100, (tiempoEstimado / tiempoTotal) * 100)
  }
  
  /**
   * Calcula el tiempo estimado basado en complejidad
   */
  private calcularTiempoEstimado(): number {
    const baseHours = {
      'Baja': 40,
      'Media': 80,
      'Alta': 160,
      'Critica': 320
    }
    
    return baseHours[this.props.complejidad] || 80
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): ProyectoCreativoProps {
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
      throw new Error('El nombre del proyecto es requerido')
    }
    
    if (!this.props.codigo?.trim()) {
      throw new Error('El código del proyecto es requerido')
    }
    
    if (!this.props.agenciaCreativaId?.trim()) {
      throw new Error('El ID de la agencia es requerido')
    }
    
    if (!this.props.clienteId?.trim()) {
      throw new Error('El ID del cliente es requerido')
    }
    
    if (this.props.presupuesto.montoTotal <= 0) {
      throw new Error('El presupuesto debe ser mayor a 0')
    }
    
    if (this.props.fechas.entregaFinal <= this.props.fechas.briefing) {
      throw new Error('La fecha de entrega debe ser posterior al briefing')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    if (!this.props.creadoPor?.trim()) {
      throw new Error('El campo creadoPor es requerido')
    }
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: ProyectoCreativoProps): ProyectoCreativo {
    const id = crypto.randomUUID()
    return new ProyectoCreativo(id, props)
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: ProyectoCreativoProps,
    createdAt: Date,
    updatedAt: Date
  ): ProyectoCreativo {
    return new ProyectoCreativo(id, props, createdAt, updatedAt)
  }
}