/**
 * ⭐ ENTIDAD EVALUACIÓN CALIDAD - TIER 0
 * 
 * Sistema de evaluación de calidad para trabajos creativos
 * Incluye scoring automático, criterios múltiples y feedback estructurado
 */

import { WithTimestamps, WithId } from '@/types'

export interface EvaluacionCalidadProps {
  // Información básica
  proyectoCreativoId: string
  entregaId: string
  agenciaCreativaId: string
  
  // Información del evaluador
  evaluador: {
    id: string
    nombre: string
    rol: string
    experiencia: number // años
    especializacion: string[]
  }
  
  // Scores principales (0-10)
  scores: {
    calidadGeneral: number
    creatividad: number
    calidadTecnica: number
    adherenciaBrief: number
    innovacion: number
    impactoVisual: number
    usabilidad?: number
    calidadAudio?: number
    efectividad: number
    originalidad: number
  }
  
  // Criterios específicos por tipo de trabajo
  criteriosEspecificos: {
    // Para video
    video?: {
      composicion: number
      iluminacion: number
      colorGrading: number
      edicion: number
      ritmo: number
      narrativa: number
    }
    
    // Para audio
    audio?: {
      calidadGrabacion: number
      mezcla: number
      masterizacion: number
      claridad: number
      impactoSonico: number
      adecuacionMensaje: number
    }
    
    // Para gráfico
    grafico?: {
      composicion: number
      tipografia: number
      colorimetria: number
      jerarquiaVisual: number
      legibilidad: number
      coherenciaVisual: number
    }
    
    // Para digital
    digital?: {
      usabilidad: number
      responsive: number
      velocidadCarga: number
      accesibilidad: number
      seo: number
      experienciaUsuario: number
    }
  }
  
  // Evaluación detallada por elementos
  elementosEvaluados: Array<{
    elemento: string
    tipo: 'FORTALEZA' | 'OPORTUNIDAD' | 'DEBILIDAD' | 'AMENAZA'
    score: number
    comentario: string
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
    sugerenciaMejora?: string
  }>
  
  // Feedback estructurado
  feedback: {
    aspectosPositivos: string[]
    areasOptimizacion: string[]
    recomendacionesEspecificas: string[]
    comentarioGeneral: string
    siguientesPasos: string[]
  }
  
  // Comparación con benchmarks
  benchmarking: {
    scorePromedioCategoría: number
    scorePromedioAgencia: number
    posicionRelativo: number // percentil
    mejoresEjemplos: Array<{
      proyectoId: string
      score: number
      aspectoDestacado: string
    }>
  }
  
  // Métricas de calidad
  metricas: {
    tiempoEvaluacion: number // minutos
    consistenciaEvaluador: number // 0-100%
    confiabilidadScore: number // 0-100%
    sesgoDetectado: boolean
    calibracionRequerida: boolean
  }
  
  // Estado de la evaluación
  estado: 'BORRADOR' | 'COMPLETADA' | 'REVISADA' | 'APROBADA' | 'RECHAZADA'
  version: number
  fechaEvaluacion: Date
  fechaRevision?: Date
  
  // Acciones recomendadas
  accionesRecomendadas: Array<{
    accion: string
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
    responsable: string
    plazoEstimado: number // días
    impactoEsperado: string
  }>
  
  // Certificación de calidad
  certificacion?: {
    nivel: 'BASICO' | 'ESTANDAR' | 'PREMIUM' | 'EXCELENCIA'
    validoHasta: Date
    certificadoPor: string
    selloCalidad: boolean
  }
  
  // Metadata
  tenantId: string
  creadoPor: string
  
  // Integración con IA
  cortexAnalysis?: {
    scoreIA: number
    confianzaIA: number // 0-100%
    factoresDetectados: string[]
    anomaliasDetectadas: string[]
    recomendacionesIA: string[]
    comparacionHumanoIA: {
      diferencia: number
      explicacion: string
    }
    ultimoAnalisis: Date
  }
}

export class EvaluacionCalidad implements WithId<EvaluacionCalidadProps>, WithTimestamps<EvaluacionCalidadProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: EvaluacionCalidadProps,
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
  get proyectoCreativoId(): string {
    return this.props.proyectoCreativoId
  }
  
  get agenciaCreativaId(): string {
    return this.props.agenciaCreativaId
  }
  
  get scoreGeneral(): number {
    return this.props.scores.calidadGeneral
  }
  
  get estado(): EvaluacionCalidadProps['estado'] {
    return this.props.estado
  }
  
  get evaluador() {
    return this.props.evaluador
  }
  
  get scores() {
    return this.props.scores
  }
  
  // Métodos de negocio
  
  /**
   * Calcula el score general basado en todos los criterios
   */
  calcularScoreGeneral(): number {
    const scores = this.props.scores
    const pesos = {
      creatividad: 0.25,
      calidadTecnica: 0.20,
      adherenciaBrief: 0.15,
      innovacion: 0.15,
      impactoVisual: 0.10,
      efectividad: 0.10,
      originalidad: 0.05
    }
    
    let scoreTotal = 0
    let pesoTotal = 0
    
    Object.entries(pesos).forEach(([criterio, peso]) => {
      const score = scores[criterio as keyof typeof scores]
      if (score !== undefined && score !== null) {
        scoreTotal += score * peso
        pesoTotal += peso
      }
    })
    
    // Incluir criterios específicos si existen
    if (this.props.criteriosEspecificos.video) {
      const videoScore = this.calcularScoreCriteriosEspecificos('video')
      scoreTotal += videoScore * 0.15
      pesoTotal += 0.15
    }
    
    if (this.props.criteriosEspecificos.audio) {
      const audioScore = this.calcularScoreCriteriosEspecificos('audio')
      scoreTotal += audioScore * 0.15
      pesoTotal += 0.15
    }
    
    if (this.props.criteriosEspecificos.grafico) {
      const graficoScore = this.calcularScoreCriteriosEspecificos('grafico')
      scoreTotal += graficoScore * 0.15
      pesoTotal += 0.15
    }
    
    if (this.props.criteriosEspecificos.digital) {
      const digitalScore = this.calcularScoreCriteriosEspecificos('digital')
      scoreTotal += digitalScore * 0.15
      pesoTotal += 0.15
    }
    
    const scoreCalculado = pesoTotal > 0 ? scoreTotal / pesoTotal : 0
    this.props.scores.calidadGeneral = Math.round(scoreCalculado * 100) / 100
    
    return this.props.scores.calidadGeneral
  }
  
  /**
   * Calcula score de criterios específicos
   */
  private calcularScoreCriteriosEspecificos(tipo: 'video' | 'audio' | 'grafico' | 'digital'): number {
    const criterios = this.props.criteriosEspecificos[tipo]
    if (!criterios) return 0
    
    const valores = Object.values(criterios).filter(v => v !== undefined && v !== null)
    if (valores.length === 0) return 0
    
    return valores.reduce((sum, val) => sum + val, 0) / valores.length
  }
  
  /**
   * Añade un elemento evaluado
   */
  añadirElementoEvaluado(
    elemento: string,
    tipo: EvaluacionCalidadProps['elementosEvaluados'][0]['tipo'],
    score: number,
    comentario: string,
    prioridad: EvaluacionCalidadProps['elementosEvaluados'][0]['prioridad'],
    sugerenciaMejora?: string
  ): void {
    if (score < 0 || score > 10) {
      throw new Error('El score debe estar entre 0 y 10')
    }
    
    this.props.elementosEvaluados.push({
      elemento,
      tipo,
      score,
      comentario,
      prioridad,
      sugerenciaMejora
    })
    
    this.touch()
  }
  
  /**
   * Añade una acción recomendada
   */
  añadirAccionRecomendada(
    accion: string,
    prioridad: EvaluacionCalidadProps['accionesRecomendadas'][0]['prioridad'],
    responsable: string,
    plazoEstimado: number,
    impactoEsperado: string
  ): void {
    this.props.accionesRecomendadas.push({
      accion,
      prioridad,
      responsable,
      plazoEstimado,
      impactoEsperado
    })
    
    this.touch()
  }
  
  /**
   * Completa la evaluación
   */
  completar(): void {
    if (this.props.estado !== 'BORRADOR') {
      throw new Error('Solo se puede completar una evaluación en borrador')
    }
    
    // Validar que todos los scores principales estén completos
    const scoresRequeridos = ['creatividad', 'calidadTecnica', 'adherenciaBrief', 'efectividad']
    const scoresFaltantes = scoresRequeridos.filter(score => 
      this.props.scores[score as keyof typeof this.props.scores] === undefined ||
      this.props.scores[score as keyof typeof this.props.scores] === null
    )
    
    if (scoresFaltantes.length > 0) {
      throw new Error(`Scores faltantes: ${scoresFaltantes.join(', ')}`)
    }
    
    this.calcularScoreGeneral()
    this.props.estado = 'COMPLETADA'
    this.props.fechaEvaluacion = new Date()
    
    // Determinar certificación automática
    this.determinarCertificacion()
    
    this.touch()
  }
  
  /**
   * Revisa la evaluación
   */
  revisar(revisadoPor: string): void {
    if (this.props.estado !== 'COMPLETADA') {
      throw new Error('Solo se puede revisar una evaluación completada')
    }
    
    this.props.estado = 'REVISADA'
    this.props.fechaRevision = new Date()
    this.props.version += 1
    
    this.touch()
  }
  
  /**
   * Aprueba la evaluación
   */
  aprobar(): void {
    if (this.props.estado !== 'REVISADA') {
      throw new Error('Solo se puede aprobar una evaluación revisada')
    }
    
    this.props.estado = 'APROBADA'
    this.touch()
  }
  
  /**
   * Rechaza la evaluación
   */
  rechazar(motivo: string): void {
    if (!['COMPLETADA', 'REVISADA'].includes(this.props.estado)) {
      throw new Error('Solo se puede rechazar una evaluación completada o revisada')
    }
    
    this.props.estado = 'RECHAZADA'
    this.props.feedback.comentarioGeneral = `RECHAZADA: ${motivo}\n\n${this.props.feedback.comentarioGeneral}`
    
    this.touch()
  }
  
  /**
   * Determina la certificación de calidad automáticamente
   */
  private determinarCertificacion(): void {
    const scoreGeneral = this.props.scores.calidadGeneral
    
    let nivel: EvaluacionCalidadProps['certificacion']['nivel']
    let validoHasta: Date
    
    if (scoreGeneral >= 9.0) {
      nivel = 'EXCELENCIA'
      validoHasta = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
    } else if (scoreGeneral >= 8.0) {
      nivel = 'PREMIUM'
      validoHasta = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 meses
    } else if (scoreGeneral >= 7.0) {
      nivel = 'ESTANDAR'
      validoHasta = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 meses
    } else {
      nivel = 'BASICO'
      validoHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 mes
    }
    
    this.props.certificacion = {
      nivel,
      validoHasta,
      certificadoPor: this.props.evaluador.nombre,
      selloCalidad: scoreGeneral >= 8.5
    }
  }
  
  /**
   * Obtiene el nivel de calidad como texto
   */
  getNivelCalidad(): string {
    const score = this.props.scores.calidadGeneral
    
    if (score >= 9.5) return 'Excepcional'
    if (score >= 9.0) return 'Excelente'
    if (score >= 8.5) return 'Muy Bueno'
    if (score >= 8.0) return 'Bueno'
    if (score >= 7.0) return 'Aceptable'
    if (score >= 6.0) return 'Regular'
    if (score >= 5.0) return 'Deficiente'
    return 'Muy Deficiente'
  }
  
  /**
   * Obtiene el color asociado al nivel de calidad
   */
  getColorNivel(): string {
    const score = this.props.scores.calidadGeneral
    
    if (score >= 9.0) return '#10B981' // Verde
    if (score >= 8.0) return '#84CC16' // Verde claro
    if (score >= 7.0) return '#EAB308' // Amarillo
    if (score >= 6.0) return '#F59E0B' // Naranja
    if (score >= 5.0) return '#EF4444' // Rojo
    return '#991B1B' // Rojo oscuro
  }
  
  /**
   * Verifica si cumple con estándares mínimos
   */
  cumpleEstandaresMinimos(): boolean {
    return this.props.scores.calidadGeneral >= 7.0 &&
           this.props.scores.adherenciaBrief >= 7.0 &&
           this.props.scores.calidadTecnica >= 6.5
  }
  
  /**
   * Obtiene recomendaciones prioritarias
   */
  getRecomendacionesPrioritarias(): EvaluacionCalidadProps['accionesRecomendadas'] {
    return this.props.accionesRecomendadas
      .filter(a => ['ALTA', 'CRITICA'].includes(a.prioridad))
      .sort((a, b) => {
        const prioridadOrder = { 'CRITICA': 4, 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 }
        return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad]
      })
  }
  
  /**
   * Calcula métricas de la evaluación
   */
  private calcularMetricas(): void {
    // Calcular consistencia del evaluador (simplificado)
    const scores = Object.values(this.props.scores).filter(s => s !== undefined && s !== null)
    const promedio = scores.reduce((sum, s) => sum + s, 0) / scores.length
    const varianza = scores.reduce((sum, s) => sum + Math.pow(s - promedio, 2), 0) / scores.length
    const consistencia = Math.max(0, 100 - (varianza * 10))
    
    // Confiabilidad basada en completitud y consistencia
    const completitud = (scores.length / 10) * 100 // Asumiendo 10 criterios principales
    const confiabilidad = (consistencia + completitud) / 2
    
    this.props.metricas = {
      tiempoEvaluacion: this.props.metricas?.tiempoEvaluacion || 0,
      consistenciaEvaluador: Math.round(consistencia),
      confiabilidadScore: Math.round(confiabilidad),
      sesgoDetectado: varianza > 2, // Detectar sesgo por alta varianza
      calibracionRequerida: consistencia < 70
    }
  }
  
  /**
   * Actualiza el análisis de Cortex
   */
  actualizarAnalisisCortex(analisis: NonNullable<EvaluacionCalidadProps['cortexAnalysis']>): void {
    this.props.cortexAnalysis = {
      ...analisis,
      ultimoAnalisis: new Date()
    }
    this.touch()
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): EvaluacionCalidadProps {
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
    if (!this.props.proyectoCreativoId?.trim()) {
      throw new Error('El ID del proyecto es requerido')
    }
    
    if (!this.props.entregaId?.trim()) {
      throw new Error('El ID de la entrega es requerido')
    }
    
    if (!this.props.agenciaCreativaId?.trim()) {
      throw new Error('El ID de la agencia es requerido')
    }
    
    if (!this.props.evaluador?.id?.trim()) {
      throw new Error('El evaluador es requerido')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    // Validar scores en rango válido
    Object.entries(this.props.scores).forEach(([criterio, score]) => {
      if (score !== undefined && score !== null && (score < 0 || score > 10)) {
        throw new Error(`Score ${criterio} debe estar entre 0 y 10`)
      }
    })
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: EvaluacionCalidadProps): EvaluacionCalidad {
    const id = crypto.randomUUID()
    
    // Valores por defecto
    const propsConDefaults: EvaluacionCalidadProps = {
      ...props,
      estado: props.estado || 'BORRADOR',
      version: props.version || 1,
      fechaEvaluacion: props.fechaEvaluacion || new Date(),
      elementosEvaluados: props.elementosEvaluados || [],
      accionesRecomendadas: props.accionesRecomendadas || [],
      feedback: {
        aspectosPositivos: [],
        areasOptimizacion: [],
        recomendacionesEspecificas: [],
        comentarioGeneral: '',
        siguientesPasos: [],
        ...props.feedback
      },
      metricas: {
        tiempoEvaluacion: 0,
        consistenciaEvaluador: 0,
        confiabilidadScore: 0,
        sesgoDetectado: false,
        calibracionRequerida: false,
        ...props.metricas
      }
    }
    
    return new EvaluacionCalidad(id, propsConDefaults)
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: EvaluacionCalidadProps,
    createdAt: Date,
    updatedAt: Date
  ): EvaluacionCalidad {
    return new EvaluacionCalidad(id, props, createdAt, updatedAt)
  }
}