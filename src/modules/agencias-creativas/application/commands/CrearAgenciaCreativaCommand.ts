/**
 * 📝 COMANDO: CREAR AGENCIA CREATIVA
 * 
 * Comando para crear una nueva agencia creativa en el sistema
 * Incluye validación automática y análisis con IA
 */

export interface CrearAgenciaCreativaCommand {
  // Información básica requerida
  nombre: string
  razonSocial: string
  rut: string
  email: string
  telefono: string
  
  // Información opcional
  sitioWeb?: string
  
  // Clasificación
  tipo: string // TipoAgenciaCreativa
  especializaciones: string[] // EspecializacionCreativa[]
  nivelExperiencia: string // NivelExperiencia
  rangoPresupuesto: string // RangoPresupuesto
  
  // Ubicación
  direccion: string
  ciudad: string
  region: string
  pais: string
  coordenadas?: {
    latitud: number
    longitud: number
  }
  
  // Información comercial
  añosExperiencia: number
  numeroEmpleados: number
  clientesPrincipales?: string[]
  sectoresExperiencia?: string[]
  
  // Capacidades técnicas
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
  
  // Certificaciones y premios
  certificaciones?: string[]
  premios?: Array<{
    nombre: string
    año: number
    categoria: string
    proyecto?: string
  }>
  
  // URLs de portfolio
  portfolioUrl?: string
  behanceUrl?: string
  dribbbleUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  
  // Configuración de colaboración
  configuracion?: {
    tiempoRespuestaPromedio?: number
    metodologiaTrabajo?: string[]
    herramientasColaboracion?: string[]
    formatosEntrega?: string[]
    politicasRevision?: {
      numeroRevisionesIncluidas?: number
      tiempoRevision?: number
      costoRevisionAdicional?: number
    }
  }
  
  // Contacto principal
  contactoPrincipal?: {
    nombre: string
    apellidos: string
    email: string
    telefono: string
    cargo: string
    departamento: string
    especialidad: string[]
    nivelSenioridad: 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead' | 'Director'
    esDecisionMaker: boolean
    nivelAutorizacion: 'Bajo' | 'Medio' | 'Alto' | 'Total'
    linkedinUrl?: string
    portfolioPersonal?: string
  }
  
  // Opciones de creación
  opciones?: {
    // Análisis automático con IA
    analizarConIA?: boolean
    importarPortfolio?: boolean
    validarConSII?: boolean
    
    // Integración con servicios externos
    sincronizarBehance?: boolean
    sincronizarDribbble?: boolean
    sincronizarInstagram?: boolean
    
    // Configuración inicial
    activarAlertas?: boolean
    configurarNotificaciones?: boolean
    
    // Asignación automática de score inicial
    calcularScoreInicial?: boolean
  }
  
  // Metadata del sistema
  tenantId: string
  creadoPor: string
  
  // Información adicional para IA
  contextoPrevio?: {
    fuenteCreacion: 'Manual' | 'Importacion' | 'Referencia' | 'IA_Suggestion'
    referenciaExterna?: string
    motivoCreacion?: string
    expectativasColaboracion?: string
    proyectosIniciales?: string[]
  }
}

/**
 * Resultado del comando de creación
 */
export interface CrearAgenciaCreativaResult {
  // ID de la agencia creada
  agenciaId: string
  
  // Información de la agencia
  agencia: {
    nombre: string
    rut: string
    scoreInicial: number
    nivel: string
    tipo: string
    especializaciones: string[]
  }
  
  // Contacto principal creado
  contactoPrincipal?: {
    id: string
    nombre: string
    email: string
    cargo: string
  }
  
  // Análisis de IA realizado
  analisisIA?: {
    scoreCalculado: number
    nivel: string
    fortalezasDetectadas: string[]
    areasOptimizacion: string[]
    recomendacionesIniciales: string[]
    compatibilidadProyectos: string[]
    riesgosPotenciales: string[]
  }
  
  // Integraciones realizadas
  integraciones?: {
    siiValidado: boolean
    portfolioImportado: boolean
    behanceSincronizado: boolean
    dribbbleSincronizado: boolean
    instagramSincronizado: boolean
  }
  
  // Configuraciones aplicadas
  configuraciones?: {
    alertasActivadas: boolean
    notificacionesConfiguradas: boolean
    scoreInicialCalculado: boolean
  }
  
  // Próximos pasos sugeridos
  proximosPasos?: string[]
  
  // Warnings o advertencias
  advertencias?: string[]
  
  // Tiempo de procesamiento
  tiempoProcesamiento: number
  
  // Timestamp de creación
  fechaCreacion: Date
}