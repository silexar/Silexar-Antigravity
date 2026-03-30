/**
 * ⏰ ENTIDAD TIMELINE PRODUCCIÓN - TIER 0
 * 
 * Gestiona los timelines de producción de proyectos creativos
 * Incluye hitos, deadlines y seguimiento automático
 */

import { WithTimestamps, WithId } from '@/types'

export interface TimelineProduccionProps {
  // Información básica
  nombre: string
  descripcion: string
  proyectoCreativoId: string
  
  // Fechas principales
  fechaInicio: Date
  fechaFin: Date
  fechaLimite: Date
  
  // Hitos del timeline
  hitos: Array<{
    id: string
    nombre: string
    descripcion: string
    fechaProgramada: Date
    fechaReal?: Date
    completado: boolean
    critico: boolean
    dependencias: string[] // IDs de otros hitos
    entregables: Array<{
      nombre: string
      tipo: string
      requerido: boolean
    }>
    responsable: {
      contactoId: string
      nombre: string
      rol: string
    }
    estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'RETRASADO' | 'CANCELADO'
    progreso: number // 0-100%
    comentarios?: string
  }>
  
  // Configuración de alertas
  alertas: {
    diasAnticipacion: number[]
    horasAnticipacion: number[]
    notificarRetrasos: boolean
    escalamientoAutomatico: boolean
    contactosNotificacion: string[]
  }
  
  // Métricas de seguimiento
  metricas: {
    progresoGeneral: number // 0-100%
    hitosCompletados: number
    hitosPendientes: number
    hitosRetrasados: number
    diasRetrasoPromedio: number
    eficienciaTimeline: number // 0-100%
    riesgoIncumplimiento: number // 0-100%
  }
  
  // Configuración de trabajo
  configuracion: {
    diasLaborales: number[] // 0-6 (domingo-sábado)
    horasLaboralesDiarias: number
    bufferTiempo: number // % de tiempo adicional
    permitirTrabajoFinSemana: boolean
    zonaHoraria: string
  }
  
  // Recursos asignados
  recursos: Array<{
    contactoId: string
    nombre: string
    rol: string
    horasAsignadas: number
    horasConsumidas: number
    disponibilidad: number // 0-100%
    costo: number
  }>
  
  // Dependencias externas
  dependenciasExternas: Array<{
    id: string
    nombre: string
    proveedor: string
    fechaRequerida: Date
    fechaConfirmada?: Date
    estado: 'PENDIENTE' | 'CONFIRMADO' | 'ENTREGADO' | 'RETRASADO'
    critico: boolean
  }>
  
  // Estado del timeline
  estado: 'PLANIFICACION' | 'ACTIVO' | 'PAUSADO' | 'COMPLETADO' | 'CANCELADO'
  activo: boolean
  
  // Historial de cambios
  historialCambios: Array<{
    fecha: Date
    tipo: 'CREACION' | 'MODIFICACION' | 'HITO_COMPLETADO' | 'RETRASO' | 'EXTENSION'
    descripcion: string
    realizadoPor: string
    impacto: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO'
  }>
  
  // Metadata
  tenantId: string
  creadoPor: string
  
  // Integración con IA
  cortexAnalysis?: {
    prediccionRetraso: number // 0-100%
    recomendacionesOptimizacion: string[]
    riesgosIdentificados: Array<{
      tipo: string
      descripcion: string
      probabilidad: number
      impacto: number
      mitigacion: string
    }>
    ultimoAnalisis: Date
  }
}

export class TimelineProduccion implements WithId<TimelineProduccionProps>, WithTimestamps<TimelineProduccionProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: TimelineProduccionProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    
    this.validate()
    this.calcularMetricas()
  }
  
  // Getters principales
  get nombre(): string {
    return this.props.nombre
  }
  
  get proyectoCreativoId(): string {
    return this.props.proyectoCreativoId
  }
  
  get estado(): TimelineProduccionProps['estado'] {
    return this.props.estado
  }
  
  get fechaInicio(): Date {
    return this.props.fechaInicio
  }
  
  get fechaFin(): Date {
    return this.props.fechaFin
  }
  
  get progresoGeneral(): number {
    return this.props.metricas.progresoGeneral
  }
  
  get hitos() {
    return this.props.hitos
  }
  
  // Métodos de negocio
  
  /**
   * Inicia el timeline
   */
  iniciar(): void {
    if (this.props.estado !== 'PLANIFICACION') {
      throw new Error('El timeline debe estar en planificación para iniciarse')
    }
    
    this.props.estado = 'ACTIVO'
    this.props.activo = true
    
    this.registrarCambio('CREACION', 'Timeline iniciado', 'MEDIO')
    this.touch()
  }
  
  /**
   * Completa un hito
   */
  completarHito(hitoId: string, comentarios?: string): void {
    const hito = this.props.hitos.find(h => h.id === hitoId)
    if (!hito) {
      throw new Error('Hito no encontrado')
    }
    
    if (hito.completado) {
      throw new Error('El hito ya está completado')
    }
    
    hito.completado = true
    hito.fechaReal = new Date()
    hito.estado = 'COMPLETADO'
    hito.progreso = 100
    if (comentarios) {
      hito.comentarios = comentarios
    }
    
    this.calcularMetricas()
    this.registrarCambio('HITO_COMPLETADO', `Hito completado: ${hito.nombre}`, 'MEDIO')
    
    // Verificar si el timeline está completo
    if (this.todosHitosCompletados()) {
      this.completarTimeline()
    }
    
    this.touch()
  }
  
  /**
   * Actualiza el progreso de un hito
   */
  actualizarProgresoHito(hitoId: string, progreso: number): void {
    if (progreso < 0 || progreso > 100) {
      throw new Error('El progreso debe estar entre 0 y 100')
    }
    
    const hito = this.props.hitos.find(h => h.id === hitoId)
    if (!hito) {
      throw new Error('Hito no encontrado')
    }
    
    hito.progreso = progreso
    
    // Actualizar estado basado en progreso
    if (progreso === 0) {
      hito.estado = 'PENDIENTE'
    } else if (progreso === 100) {
      hito.estado = 'COMPLETADO'
      hito.completado = true
      hito.fechaReal = new Date()
    } else {
      hito.estado = 'EN_PROGRESO'
    }
    
    this.calcularMetricas()
    this.touch()
  }
  
  /**
   * Añade un nuevo hito
   */
  añadirHito(
    nombre: string,
    descripcion: string,
    fechaProgramada: Date,
    critico: boolean = false,
    responsableContactoId: string,
    responsableNombre: string,
    responsableRol: string,
    dependencias: string[] = [],
    entregables: Array<{ nombre: string; tipo: string; requerido: boolean }> = []
  ): string {
    const hitoId = crypto.randomUUID()
    
    const nuevoHito: TimelineProduccionProps['hitos'][0] = {
      id: hitoId,
      nombre,
      descripcion,
      fechaProgramada,
      completado: false,
      critico,
      dependencias,
      entregables,
      responsable: {
        contactoId: responsableContactoId,
        nombre: responsableNombre,
        rol: responsableRol
      },
      estado: 'PENDIENTE',
      progreso: 0
    }
    
    this.props.hitos.push(nuevoHito)
    this.calcularMetricas()
    this.registrarCambio('MODIFICACION', `Hito añadido: ${nombre}`, 'BAJO')
    this.touch()
    
    return hitoId
  }
  
  /**
   * Elimina un hito
   */
  eliminarHito(hitoId: string): void {
    const index = this.props.hitos.findIndex(h => h.id === hitoId)
    if (index === -1) {
      throw new Error('Hito no encontrado')
    }
    
    const hito = this.props.hitos[index]
    
    // Verificar dependencias
    const tieneDependientes = this.props.hitos.some(h => 
      h.dependencias.includes(hitoId)
    )
    
    if (tieneDependientes) {
      throw new Error('No se puede eliminar un hito que tiene dependientes')
    }
    
    this.props.hitos.splice(index, 1)
    this.calcularMetricas()
    this.registrarCambio('MODIFICACION', `Hito eliminado: ${hito.nombre}`, 'MEDIO')
    this.touch()
  }
  
  /**
   * Extiende la fecha de un hito
   */
  extenderHito(hitoId: string, nuevaFecha: Date, motivo: string): void {
    const hito = this.props.hitos.find(h => h.id === hitoId)
    if (!hito) {
      throw new Error('Hito no encontrado')
    }
    
    if (nuevaFecha <= hito.fechaProgramada) {
      throw new Error('La nueva fecha debe ser posterior a la actual')
    }
    
    const fechaAnterior = hito.fechaProgramada
    hito.fechaProgramada = nuevaFecha
    
    this.calcularMetricas()
    this.registrarCambio(
      'EXTENSION', 
      `Hito ${hito.nombre} extendido de ${fechaAnterior.toISOString()} a ${nuevaFecha.toISOString()}. Motivo: ${motivo}`, 
      hito.critico ? 'CRITICO' : 'ALTO'
    )
    
    this.touch()
  }
  
  /**
   * Verifica dependencias de un hito
   */
  verificarDependencias(hitoId: string): { cumplidas: boolean; pendientes: string[] } {
    const hito = this.props.hitos.find(h => h.id === hitoId)
    if (!hito) {
      throw new Error('Hito no encontrado')
    }
    
    const dependenciasPendientes = hito.dependencias.filter(depId => {
      const dependencia = this.props.hitos.find(h => h.id === depId)
      return !dependencia || !dependencia.completado
    })
    
    return {
      cumplidas: dependenciasPendientes.length === 0,
      pendientes: dependenciasPendientes
    }
  }
  
  /**
   * Obtiene hitos críticos en riesgo
   */
  getHitosCriticosEnRiesgo(): TimelineProduccionProps['hitos'] {
    const ahora = new Date()
    
    return this.props.hitos.filter(hito => 
      hito.critico && 
      !hito.completado && 
      hito.fechaProgramada <= new Date(ahora.getTime() + 48 * 60 * 60 * 1000) // 48 horas
    )
  }
  
  /**
   * Obtiene próximos hitos (próximos 7 días)
   */
  getProximosHitos(): TimelineProduccionProps['hitos'] {
    const ahora = new Date()
    const proximaSemana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return this.props.hitos
      .filter(hito => 
        !hito.completado && 
        hito.fechaProgramada >= ahora && 
        hito.fechaProgramada <= proximaSemana
      )
      .sort((a, b) => a.fechaProgramada.getTime() - b.fechaProgramada.getTime())
  }
  
  /**
   * Calcula el camino crítico
   */
  getCaminoCritico(): string[] {
    // Implementación simplificada del algoritmo de camino crítico
    const hitosCriticos = this.props.hitos
      .filter(h => h.critico)
      .sort((a, b) => a.fechaProgramada.getTime() - b.fechaProgramada.getTime())
    
    return hitosCriticos.map(h => h.id)
  }
  
  /**
   * Pausa el timeline
   */
  pausar(motivo: string): void {
    if (this.props.estado !== 'ACTIVO') {
      throw new Error('Solo se puede pausar un timeline activo')
    }
    
    this.props.estado = 'PAUSADO'
    this.props.activo = false
    
    this.registrarCambio('MODIFICACION', `Timeline pausado: ${motivo}`, 'ALTO')
    this.touch()
  }
  
  /**
   * Reanuda el timeline
   */
  reanudar(): void {
    if (this.props.estado !== 'PAUSADO') {
      throw new Error('Solo se puede reanudar un timeline pausado')
    }
    
    this.props.estado = 'ACTIVO'
    this.props.activo = true
    
    this.registrarCambio('MODIFICACION', 'Timeline reanudado', 'MEDIO')
    this.touch()
  }
  
  /**
   * Completa el timeline
   */
  private completarTimeline(): void {
    this.props.estado = 'COMPLETADO'
    this.props.activo = false
    
    this.registrarCambio('MODIFICACION', 'Timeline completado', 'ALTO')
  }
  
  /**
   * Verifica si todos los hitos están completados
   */
  private todosHitosCompletados(): boolean {
    return this.props.hitos.every(h => h.completado)
  }
  
  /**
   * Calcula las métricas del timeline
   */
  private calcularMetricas(): void {
    const totalHitos = this.props.hitos.length
    const hitosCompletados = this.props.hitos.filter(h => h.completado).length
    const hitosPendientes = totalHitos - hitosCompletados
    
    // Progreso general
    if (totalHitos === 0) {
      this.props.metricas.progresoGeneral = 0
    } else {
      const progresoTotal = this.props.hitos.reduce((sum, h) => sum + h.progreso, 0)
      this.props.metricas.progresoGeneral = progresoTotal / totalHitos
    }
    
    // Hitos retrasados
    const ahora = new Date()
    const hitosRetrasados = this.props.hitos.filter(h => 
      !h.completado && h.fechaProgramada < ahora
    ).length
    
    // Días de retraso promedio
    const hitosConRetraso = this.props.hitos.filter(h => 
      h.completado && h.fechaReal && h.fechaReal > h.fechaProgramada
    )
    
    let diasRetrasoPromedio = 0
    if (hitosConRetraso.length > 0) {
      const totalDiasRetraso = hitosConRetraso.reduce((sum, h) => {
        const dias = Math.ceil((h.fechaReal!.getTime() - h.fechaProgramada.getTime()) / (1000 * 60 * 60 * 24))
        return sum + dias
      }, 0)
      diasRetrasoPromedio = totalDiasRetraso / hitosConRetraso.length
    }
    
    // Eficiencia del timeline
    const eficiencia = totalHitos === 0 ? 100 : 
      ((hitosCompletados - hitosRetrasados) / totalHitos) * 100
    
    // Riesgo de incumplimiento
    const riesgo = this.calcularRiesgoIncumplimiento()
    
    this.props.metricas = {
      progresoGeneral: Math.round(this.props.metricas.progresoGeneral * 100) / 100,
      hitosCompletados,
      hitosPendientes,
      hitosRetrasados,
      diasRetrasoPromedio: Math.round(diasRetrasoPromedio * 100) / 100,
      eficienciaTimeline: Math.max(0, Math.min(100, Math.round(eficiencia * 100) / 100)),
      riesgoIncumplimiento: Math.round(riesgo * 100) / 100
    }
  }
  
  /**
   * Calcula el riesgo de incumplimiento
   */
  private calcularRiesgoIncumplimiento(): number {
    const ahora = new Date()
    const diasRestantes = Math.ceil((this.props.fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes <= 0) return 100 // Ya pasó la fecha
    
    const hitosPendientes = this.props.hitos.filter(h => !h.completado)
    const hitosCriticosPendientes = hitosPendientes.filter(h => h.critico)
    
    let riesgo = 0
    
    // Riesgo por progreso general
    const progresoEsperado = this.calcularProgresoEsperado()
    if (this.props.metricas.progresoGeneral < progresoEsperado) {
      riesgo += 30
    }
    
    // Riesgo por hitos críticos
    if (hitosCriticosPendientes.length > 0) {
      riesgo += hitosCriticosPendientes.length * 15
    }
    
    // Riesgo por retrasos históricos
    if (this.props.metricas.diasRetrasoPromedio > 1) {
      riesgo += this.props.metricas.diasRetrasoPromedio * 5
    }
    
    return Math.min(100, riesgo)
  }
  
  /**
   * Calcula el progreso esperado basado en el tiempo transcurrido
   */
  private calcularProgresoEsperado(): number {
    const ahora = new Date()
    const tiempoTotal = this.props.fechaFin.getTime() - this.props.fechaInicio.getTime()
    const tiempoTranscurrido = ahora.getTime() - this.props.fechaInicio.getTime()
    
    if (tiempoTranscurrido <= 0) return 0
    if (tiempoTranscurrido >= tiempoTotal) return 100
    
    return (tiempoTranscurrido / tiempoTotal) * 100
  }
  
  /**
   * Registra un cambio en el historial
   */
  private registrarCambio(
    tipo: TimelineProduccionProps['historialCambios'][0]['tipo'],
    descripcion: string,
    impacto: TimelineProduccionProps['historialCambios'][0]['impacto']
  ): void {
    this.props.historialCambios.push({
      fecha: new Date(),
      tipo,
      descripcion,
      realizadoPor: 'Sistema', // TODO: Obtener del contexto
      impacto
    })
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): TimelineProduccionProps {
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
      throw new Error('El nombre del timeline es requerido')
    }
    
    if (!this.props.proyectoCreativoId?.trim()) {
      throw new Error('El ID del proyecto es requerido')
    }
    
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
    }
    
    if (this.props.fechaLimite < this.props.fechaFin) {
      throw new Error('La fecha límite no puede ser anterior a la fecha de fin')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: TimelineProduccionProps): TimelineProduccion {
    const id = crypto.randomUUID()
    return new TimelineProduccion(id, props)
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: TimelineProduccionProps,
    createdAt: Date,
    updatedAt: Date
  ): TimelineProduccion {
    return new TimelineProduccion(id, props, createdAt, updatedAt)
  }
}