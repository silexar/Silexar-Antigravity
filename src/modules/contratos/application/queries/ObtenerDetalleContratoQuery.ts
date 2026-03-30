/**
 * QUERY: OBTENER DETALLE DE CONTRATO - TIER 0
 * 
 * @description Query para obtener información completa de un contrato
 */

export interface ObtenerDetalleContratoQuery {
  contratoId: string
  incluirLineasEspecificacion?: boolean
  incluirAprobaciones?: boolean
  incluirDocumentos?: boolean
  incluirHistorial?: boolean
  incluirAnalisisPredictivo?: boolean
}

export interface DetalleContratoResponse {
  contrato: {
    id: string
    numero: string
    anunciante: string
    rutAnunciante: string
    producto: string
    agencia?: string
    ejecutivo: string
    
    // Valores
    valorBruto: number
    valorNeto: number
    descuentoPorcentaje: number
    moneda: string
    
    // Fechas
    fechaInicio: Date
    fechaFin: Date
    fechaCreacion: Date
    
    // Estado
    estado: string
    prioridad: string
    tipoContrato: string
    progreso: number
    
    // Términos
    diasPago: number
    modalidadFacturacion: string
    tipoFactura: string
    esCanje: boolean
    
    // Métricas
    riesgoCredito: {
      score: number
      nivel: string
      factores: string[]
    }
    
    rentabilidad: {
      margenBruto: number
      roi: number
      clasificacion: string
    }
    
    // Workflow
    etapaActual: string
    proximaAccion: string
    responsableActual: string
    fechaLimiteAccion: Date
    
    // Alertas
    alertas: string[]
    tags: string[]
  }
  
  lineasEspecificacion?: {
    id: string
    medio: string
    formato: string
    horario: string
    fechaInicio: Date
    fechaFin: Date
    frecuencia: number
    valorTotal: number
    estado: string
  }[]
  
  aprobaciones?: {
    id: string
    nivel: number
    aprobador: string
    estado: string
    fechaSolicitud: Date
    fechaRespuesta?: Date
    observaciones?: string
  }[]
  
  documentos?: {
    tipo: string
    nombre: string
    estado: string
    fechaCreacion: Date
    url?: string
  }[]
  
  historial?: {
    fecha: Date
    accion: string
    usuario: string
    detalles: string
  }[]
  
  analisisPredictivo?: {
    probabilidadRenovacion: number
    riesgoIncumplimiento: number
    oportunidadesUpselling: string[]
    recomendaciones: string[]
  }
}