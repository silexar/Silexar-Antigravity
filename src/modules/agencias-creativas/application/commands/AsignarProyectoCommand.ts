/**
 * 🎯 COMANDO: ASIGNAR PROYECTO
 * 
 * Comando para asignar un proyecto creativo a una agencia
 * Incluye matching inteligente y validación automática
 */

export interface AsignarProyectoCommand {
  // Información del proyecto
  proyecto: {
    nombre: string
    descripcion: string
    codigo?: string // Si no se proporciona, se genera automáticamente
    
    // Clasificación del proyecto
    tipoProyecto: 'Video' | 'Audio' | 'Grafico' | 'Digital' | 'BTL' | 'Integral'
    categoria: string
    complejidad: 'Baja' | 'Media' | 'Alta' | 'Critica'
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente'
    
    // Información comercial
    presupuesto: {
      montoTotal: number
      moneda: string
      desglose?: Array<{
        concepto: string
        monto: number
        porcentaje: number
      }>
    }
    
    // Timeline
    fechaEntregaFinal: Date
    fechaLimite: Date
    
    // Brief creativo
    brief: {
      objetivo: string
      audienciaObjetivo: string
      mensajeClave: string
      tonoComunicacion: string
      referencias?: string[]
      restricciones?: string[]
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
  }
  
  // Relaciones
  clienteId: string
  campañaId?: string
  
  // Asignación de agencia
  asignacion: {
    // Modo de asignación
    modo: 'Manual' | 'IA_Automatico' | 'IA_Sugerido' | 'Licitacion'
    
    // Si es manual, especificar agencia
    agenciaCreativaId?: string
    contactoResponsableId?: string
    
    // Si es automático, criterios para IA
    criteriosIA?: {
      especializacionesRequeridas: string[]
      scoreMinimo?: number
      presupuestoMaximo?: number
      ubicacionPreferida?: string
      certificacionesRequeridas?: string[]
      experienciaMinima?: number
      disponibilidadRequerida: 'Inmediata' | 'Esta_Semana' | 'Dos_Semanas' | 'Flexible'
      
      // Preferencias de colaboración
      preferencias?: {
        agenciasPreferidas?: string[]
        agenciasExcluidas?: string[]
        tiposAgenciaPreferidos?: string[]
        ubicacionMaximaDistancia?: number
        colaboracionesAnteriores?: 'Requerida' | 'Preferida' | 'Indiferente' | 'Evitar'
      }
      
      // Criterios de calidad
      calidadMinima?: number
      puntualidadMinima?: number
      satisfaccionMinima?: number
      
      // Factores de peso para scoring
      pesos?: {
        calidad?: number
        precio?: number
        velocidad?: number
        experiencia?: number
        disponibilidad?: number
        ubicacion?: number
      }
    }
    
    // Para licitación
    licitacion?: {
      fechaLimiteRespuesta: Date
      agenciasInvitadas?: string[]
      criteriosEvaluacion: string[]
      documentosRequeridos: string[]
      formatoRespuesta: string
    }
  }
  
  // Configuración del proyecto
  configuracion?: {
    // Comunicación
    canalPrincipal?: 'Email' | 'WhatsApp' | 'Slack' | 'Teams' | 'Telefono'
    frecuenciaReportes?: 'Diario' | 'Semanal' | 'Hitos' | 'Bajo_Demanda'
    
    // Revisiones
    numeroRevisionesIncluidas?: number
    tiempoMaximoRevision?: number // horas
    
    // Alertas
    alertasDeadline?: boolean
    alertasCalidad?: boolean
    alertasPresupuesto?: boolean
    
    // Integración
    sincronizarConCreatividades?: boolean
    sincronizarConFacturacion?: boolean
  }
  
  // Recursos asignados
  recursos?: {
    equipoInterno?: Array<{
      usuarioId: string
      rol: string
      horasAsignadas?: number
    }>
    
    presupuestoAdicional?: {
      recursosExternos?: number
      herramientas?: number
      licencias?: number
    }
  }
  
  // Metadata del sistema
  tenantId: string
  creadoPor: string
  
  // Opciones de procesamiento
  opciones?: {
    // Validaciones automáticas
    validarDisponibilidad?: boolean
    validarCapacidades?: boolean
    validarPresupuesto?: boolean
    
    // Notificaciones
    notificarAgencia?: boolean
    notificarCliente?: boolean
    notificarEquipo?: boolean
    
    // Análisis predictivo
    analizarRiesgos?: boolean
    calcularProbabilidadExito?: boolean
    generarRecomendaciones?: boolean
    
    // Automatizaciones
    crearTimelineAutomatico?: boolean
    configurarMilestones?: boolean
    activarMonitoreo?: boolean
  }
}

/**
 * Resultado del comando de asignación
 */
export interface AsignarProyectoResult {
  // Información del proyecto creado
  proyecto: {
    id: string
    codigo: string
    nombre: string
    estado: string
    fechaCreacion: Date
  }
  
  // Agencia asignada
  agenciaAsignada: {
    id: string
    nombre: string
    contactoResponsable: {
      id: string
      nombre: string
      email: string
      telefono: string
    }
    scoreMatch: number
    razonesSeleccion: string[]
  }
  
  // Análisis de matching (si se usó IA)
  analisisMatching?: {
    agenciasEvaluadas: number
    criteriosAplicados: string[]
    scorePromedio: number
    mejoresAlternativas: Array<{
      agenciaId: string
      nombre: string
      score: number
      fortalezas: string[]
      debilidades: string[]
    }>
  }
  
  // Timeline generado
  timeline?: {
    fechaInicio: Date
    milestones: Array<{
      nombre: string
      fecha: Date
      descripcion: string
      tipo: 'Briefing' | 'Primera_Entrega' | 'Revision' | 'Entrega_Final'
    }>
    fechaEntregaEstimada: Date
  }
  
  // Análisis predictivo
  predicciones?: {
    probabilidadExito: number
    riesgosIdentificados: Array<{
      tipo: string
      probabilidad: number
      impacto: string
      mitigacion: string
    }>
    factoresExito: string[]
    recomendacionesOptimizacion: string[]
  }
  
  // Configuraciones aplicadas
  configuraciones?: {
    alertasActivadas: string[]
    integracionesConfiguradas: string[]
    notificacionesEnviadas: string[]
  }
  
  // Próximos pasos
  proximosPasos?: Array<{
    accion: string
    responsable: string
    fechaLimite?: Date
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Critica'
  }>
  
  // Información de facturación
  facturacion?: {
    montoTotal: number
    cronogramaPagos?: Array<{
      concepto: string
      monto: number
      fechaVencimiento: Date
    }>
  }
  
  // Warnings y validaciones
  advertencias?: string[]
  validacionesFallidas?: string[]
  
  // Métricas de procesamiento
  tiempoProcesamiento: number
  agenciasEvaluadas?: number
  
  // Información de auditoría
  auditoria: {
    fechaAsignacion: Date
    usuarioAsignador: string
    metodoAsignacion: string
    criteriosUtilizados: Record<string, unknown>
  }
}