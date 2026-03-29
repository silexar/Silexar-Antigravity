/**
 * 📝 COMMAND: CREAR BRIEF CREATIVO
 * 
 * Comando para crear un nuevo brief creativo para un proyecto
 */

export interface CrearBriefCreativoCommandProps {
  // Información básica del brief
  nombre: string
  descripcion: string
  
  // Relaciones
  proyectoCreativoId: string
  agenciaCreativaId: string
  clienteId: string
  contactoClienteId: string
  
  // Objetivos y estrategia
  objetivoPrincipal: string
  objetivosSecundarios: string[]
  audienciaObjetivo: {
    demografica: {
      edadMin: number
      edadMax: number
      genero: 'MASCULINO' | 'FEMENINO' | 'TODOS' | 'NO_BINARIO'
      ingresos: 'BAJO' | 'MEDIO' | 'ALTO' | 'PREMIUM'
      educacion: 'BASICA' | 'MEDIA' | 'TECNICA' | 'UNIVERSITARIA' | 'POSTGRADO'
      ocupacion: string[]
    }
    psicografica: {
      intereses: string[]
      valores: string[]
      estilo_vida: string[]
      personalidad: string[]
    }
    geografica: {
      paises: string[]
      regiones: string[]
      ciudades: string[]
      zonas: string[]
    }
    comportamental: {
      frecuenciaCompra: 'PRIMERA_VEZ' | 'OCASIONAL' | 'REGULAR' | 'FRECUENTE'
      lealtadMarca: 'BAJA' | 'MEDIA' | 'ALTA'
      sensibilidadPrecio: 'BAJA' | 'MEDIA' | 'ALTA'
      canalesPreferidos: string[]
    }
  }
  
  // Mensaje y comunicación
  mensajeClave: string
  mensajesSecundarios: string[]
  tonoComunicacion: {
    personalidad: 'SERIO' | 'AMIGABLE' | 'PROFESIONAL' | 'CASUAL' | 'ELEGANTE' | 'DIVERTIDO' | 'INSPIRADOR'
    emocion: 'CONFIANZA' | 'ALEGRIA' | 'URGENCIA' | 'TRANQUILIDAD' | 'EMOCION' | 'NOSTALGIA' | 'ASPIRACION'
    estilo: 'FORMAL' | 'INFORMAL' | 'TECNICO' | 'CREATIVO' | 'MINIMALISTA' | 'ELABORADO'
  }
  
  // Especificaciones creativas
  tipoCreativo: 'VIDEO' | 'AUDIO' | 'GRAFICO' | 'DIGITAL' | 'BTL' | 'INTEGRAL'
  formatosRequeridos: Array<{
    tipo: string
    especificaciones: string
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
    uso: string
  }>
  
  // Especificaciones técnicas
  especificacionesTecnicas: {
    video?: {
      duracion: number[]
      resolucion: string[]
      aspectRatio: string[]
      frameRate: number[]
      codec: string[]
      entregables: string[]
    }
    audio?: {
      duracion: number[]
      calidad: string[]
      formato: string[]
      canales: string[]
      entregables: string[]
    }
    grafico?: {
      dimensiones: string[]
      resolucion: number[]
      formato: string[]
      colorMode: string[]
      entregables: string[]
    }
    digital?: {
      plataformas: string[]
      dispositivos: string[]
      navegadores: string[]
      responsive: boolean
      entregables: string[]
    }
  }
  
  // Referencias y inspiración
  referencias: {
    competencia: Array<{
      marca: string
      campaña: string
      url?: string
      aspectosPositivos: string[]
      aspectosEvitar: string[]
    }>
    inspiracion: Array<{
      titulo: string
      descripcion: string
      url?: string
      razonInclusion: string
    }>
    estiloVisual: {
      colores: string[]
      tipografia: string[]
      estilo: string[]
      elementos: string[]
    }
  }
  
  // Restricciones y consideraciones
  restricciones: {
    legales: string[]
    marca: string[]
    tecnicas: string[]
    presupuestarias: string[]
    temporales: string[]
  }
  
  // Elementos obligatorios
  elementosObligatorios: Array<{
    elemento: string
    descripcion: string
    ubicacion?: string
    tamaño?: string
    duracion?: number
  }>
  
  // Timeline y entregas
  timeline: {
    fechaInicioBrief: Date
    fechaEntregaConcepto: Date
    fechaEntregaPrimera: Date
    fechaEntregaFinal: Date
    hitosIntermedios: Array<{
      nombre: string
      fecha: Date
      entregables: string[]
    }>
  }
  
  // Presupuesto y recursos
  presupuesto: {
    montoTotal: number
    moneda: string
    distribucion: Array<{
      concepto: string
      porcentaje: number
      monto: number
    }>
    contingencia: number
  }
  
  // Proceso de aprobación
  procesoAprobacion: {
    niveles: Array<{
      nivel: number
      responsable: string
      tiempoMaximo: number // horas
      criterios: string[]
    }>
    formatoFeedback: 'EMAIL' | 'REUNION' | 'PLATAFORMA' | 'DOCUMENTO'
    tiempoMaximoRevision: number // horas
    numeroMaximoRevisiones: number
  }
  
  // Medición y éxito
  criteriosExito: {
    kpis: Array<{
      nombre: string
      metrica: string
      objetivo: number
      unidad: string
    }>
    metodologiaEvaluacion: string
    herramientasMedicion: string[]
  }
  
  // Información adicional
  contextoMercado: string
  situacionCompetitiva: string
  oportunidades: string[]
  riesgos: string[]
  
  // Configuración del brief
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
  confidencialidad: 'PUBLICA' | 'INTERNA' | 'CONFIDENCIAL' | 'SECRETA'
  
  // Metadata
  tenantId: string
  creadoPor: string
}

export class CrearBriefCreativoCommand {
  constructor(public readonly props: CrearBriefCreativoCommandProps) {
    this.validate()
  }
  
  /**
   * Valida el comando
   */
  private validate(): void {
    // Validaciones básicas
    if (!this.props.nombre?.trim()) {
      throw new Error('El nombre del brief es requerido')
    }
    
    if (!this.props.descripcion?.trim()) {
      throw new Error('La descripción del brief es requerida')
    }
    
    if (!this.props.proyectoCreativoId?.trim()) {
      throw new Error('El ID del proyecto creativo es requerido')
    }
    
    if (!this.props.agenciaCreativaId?.trim()) {
      throw new Error('El ID de la agencia creativa es requerido')
    }
    
    if (!this.props.clienteId?.trim()) {
      throw new Error('El ID del cliente es requerido')
    }
    
    if (!this.props.objetivoPrincipal?.trim()) {
      throw new Error('El objetivo principal es requerido')
    }
    
    if (!this.props.mensajeClave?.trim()) {
      throw new Error('El mensaje clave es requerido')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    if (!this.props.creadoPor?.trim()) {
      throw new Error('El campo creadoPor es requerido')
    }
    
    // Validar audiencia objetivo
    this.validateAudienciaObjetivo()
    
    // Validar timeline
    this.validateTimeline()
    
    // Validar presupuesto
    this.validatePresupuesto()
    
    // Validar especificaciones técnicas
    this.validateEspecificacionesTecnicas()
    
    // Validar proceso de aprobación
    this.validateProcesoAprobacion()
  }
  
  /**
   * Valida la audiencia objetivo
   */
  private validateAudienciaObjetivo(): void {
    const audiencia = this.props.audienciaObjetivo
    
    if (audiencia.demografica.edadMin < 0 || audiencia.demografica.edadMax < 0) {
      throw new Error('Las edades no pueden ser negativas')
    }
    
    if (audiencia.demografica.edadMin > audiencia.demografica.edadMax) {
      throw new Error('La edad mínima no puede ser mayor a la edad máxima')
    }
    
    if (audiencia.geografica.paises.length === 0) {
      throw new Error('Debe especificar al menos un país en la audiencia geográfica')
    }
  }
  
  /**
   * Valida el timeline
   */
  private validateTimeline(): void {
    const timeline = this.props.timeline
    const ahora = new Date()
    
    if (timeline.fechaInicioBrief < ahora) {
      throw new Error('La fecha de inicio del brief no puede ser en el pasado')
    }
    
    if (timeline.fechaEntregaConcepto <= timeline.fechaInicioBrief) {
      throw new Error('La fecha de entrega del concepto debe ser posterior al inicio del brief')
    }
    
    if (timeline.fechaEntregaPrimera <= timeline.fechaEntregaConcepto) {
      throw new Error('La fecha de primera entrega debe ser posterior a la entrega del concepto')
    }
    
    if (timeline.fechaEntregaFinal <= timeline.fechaEntregaPrimera) {
      throw new Error('La fecha de entrega final debe ser posterior a la primera entrega')
    }
    
    // Validar hitos intermedios
    timeline.hitosIntermedios.forEach((hito, index) => {
      if (hito.fecha <= timeline.fechaInicioBrief || hito.fecha >= timeline.fechaEntregaFinal) {
        throw new Error(`El hito ${index + 1} debe estar entre el inicio y la entrega final`)
      }
      
      if (!hito.nombre?.trim()) {
        throw new Error(`El hito ${index + 1} debe tener un nombre`)
      }
      
      if (hito.entregables.length === 0) {
        throw new Error(`El hito ${index + 1} debe tener al menos un entregable`)
      }
    })
  }
  
  /**
   * Valida el presupuesto
   */
  private validatePresupuesto(): void {
    const presupuesto = this.props.presupuesto
    
    if (presupuesto.montoTotal <= 0) {
      throw new Error('El monto total del presupuesto debe ser mayor a 0')
    }
    
    if (presupuesto.contingencia < 0 || presupuesto.contingencia > 50) {
      throw new Error('La contingencia debe estar entre 0% y 50%')
    }
    
    // Validar que la distribución sume 100%
    const totalPorcentaje = presupuesto.distribucion.reduce((sum, item) => sum + item.porcentaje, 0)
    if (Math.abs(totalPorcentaje - 100) > 0.01) {
      throw new Error('La distribución del presupuesto debe sumar 100%')
    }
    
    // Validar que los montos coincidan con los porcentajes
    presupuesto.distribucion.forEach((item, index) => {
      const montoEsperado = (presupuesto.montoTotal * item.porcentaje) / 100
      if (Math.abs(item.monto - montoEsperado) > 1) {
        throw new Error(`El monto del item ${index + 1} no coincide con su porcentaje`)
      }
    })
  }
  
  /**
   * Valida las especificaciones técnicas
   */
  private validateEspecificacionesTecnicas(): void {
    const specs = this.props.especificacionesTecnicas
    const tipo = this.props.tipoCreativo
    
    // Validar que existan especificaciones para el tipo de creativo
    switch (tipo) {
      case 'VIDEO':
        if (!specs.video) {
          throw new Error('Las especificaciones de video son requeridas para este tipo de creativo')
        }
        this.validateVideoSpecs(specs.video)
        break
        
      case 'AUDIO':
        if (!specs.audio) {
          throw new Error('Las especificaciones de audio son requeridas para este tipo de creativo')
        }
        this.validateAudioSpecs(specs.audio)
        break
        
      case 'GRAFICO':
        if (!specs.grafico) {
          throw new Error('Las especificaciones gráficas son requeridas para este tipo de creativo')
        }
        this.validateGraficoSpecs(specs.grafico)
        break
        
      case 'DIGITAL':
        if (!specs.digital) {
          throw new Error('Las especificaciones digitales son requeridas para este tipo de creativo')
        }
        this.validateDigitalSpecs(specs.digital)
        break
    }
  }
  
  /**
   * Valida especificaciones de video
   */
  private validateVideoSpecs(specs: NonNullable<CrearBriefCreativoCommandProps['especificacionesTecnicas']['video']>): void {
    if (specs.duracion.some(d => d <= 0)) {
      throw new Error('Las duraciones de video deben ser mayores a 0')
    }
    
    if (specs.frameRate.some(fr => fr <= 0)) {
      throw new Error('Los frame rates deben ser mayores a 0')
    }
    
    if (specs.entregables.length === 0) {
      throw new Error('Debe especificar al menos un entregable de video')
    }
  }
  
  /**
   * Valida especificaciones de audio
   */
  private validateAudioSpecs(specs: NonNullable<CrearBriefCreativoCommandProps['especificacionesTecnicas']['audio']>): void {
    if (specs.duracion.some(d => d <= 0)) {
      throw new Error('Las duraciones de audio deben ser mayores a 0')
    }
    
    if (specs.entregables.length === 0) {
      throw new Error('Debe especificar al menos un entregable de audio')
    }
  }
  
  /**
   * Valida especificaciones gráficas
   */
  private validateGraficoSpecs(specs: NonNullable<CrearBriefCreativoCommandProps['especificacionesTecnicas']['grafico']>): void {
    if (specs.resolucion.some(r => r <= 0)) {
      throw new Error('Las resoluciones deben ser mayores a 0')
    }
    
    if (specs.entregables.length === 0) {
      throw new Error('Debe especificar al menos un entregable gráfico')
    }
  }
  
  /**
   * Valida especificaciones digitales
   */
  private validateDigitalSpecs(specs: NonNullable<CrearBriefCreativoCommandProps['especificacionesTecnicas']['digital']>): void {
    if (specs.plataformas.length === 0) {
      throw new Error('Debe especificar al menos una plataforma digital')
    }
    
    if (specs.entregables.length === 0) {
      throw new Error('Debe especificar al menos un entregable digital')
    }
  }
  
  /**
   * Valida el proceso de aprobación
   */
  private validateProcesoAprobacion(): void {
    const proceso = this.props.procesoAprobacion
    
    if (proceso.niveles.length === 0) {
      throw new Error('Debe definir al menos un nivel de aprobación')
    }
    
    if (proceso.tiempoMaximoRevision <= 0) {
      throw new Error('El tiempo máximo de revisión debe ser mayor a 0')
    }
    
    if (proceso.numeroMaximoRevisiones <= 0) {
      throw new Error('El número máximo de revisiones debe ser mayor a 0')
    }
    
    // Validar niveles de aprobación
    proceso.niveles.forEach((nivel, index) => {
      if (nivel.nivel !== index + 1) {
        throw new Error(`El nivel ${index + 1} debe tener el número correcto`)
      }
      
      if (!nivel.responsable?.trim()) {
        throw new Error(`El nivel ${index + 1} debe tener un responsable`)
      }
      
      if (nivel.tiempoMaximo <= 0) {
        throw new Error(`El tiempo máximo del nivel ${index + 1} debe ser mayor a 0`)
      }
      
      if (nivel.criterios.length === 0) {
        throw new Error(`El nivel ${index + 1} debe tener al menos un criterio`)
      }
    })
  }
  
  /**
   * Obtiene un resumen del brief
   */
  getResumen(): string {
    return `Brief "${this.props.nombre}" - ${this.props.tipoCreativo} para ${this.props.audienciaObjetivo.demografica.genero} ${this.props.audienciaObjetivo.demografica.edadMin}-${this.props.audienciaObjetivo.demografica.edadMax} años. Entrega: ${this.props.timeline.fechaEntregaFinal.toLocaleDateString()}`
  }
  
  /**
   * Verifica si el brief es urgente
   */
  isUrgente(): boolean {
    const diasHastaEntrega = Math.ceil(
      (this.props.timeline.fechaEntregaFinal.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    
    return this.props.prioridad === 'CRITICA' || diasHastaEntrega <= 7
  }
  
  /**
   * Verifica si requiere aprobación especial
   */
  requiereAprobacionEspecial(): boolean {
    return this.props.confidencialidad === 'SECRETA' ||
           this.props.prioridad === 'CRITICA' ||
           this.props.presupuesto.montoTotal > 50000000 // 50M CLP
  }
  
  /**
   * Obtiene la duración estimada del proyecto
   */
  getDuracionEstimada(): number {
    return Math.ceil(
      (this.props.timeline.fechaEntregaFinal.getTime() - this.props.timeline.fechaInicioBrief.getTime()) / (1000 * 60 * 60 * 24)
    )
  }
}