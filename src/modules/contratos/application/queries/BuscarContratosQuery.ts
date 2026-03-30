/**
 * QUERY: BUSCAR CONTRATOS - TIER 0
 * 
 * @description Query avanzada para búsqueda y filtrado de contratos
 */

export interface BuscarContratosQuery {
  // Filtros básicos
  busquedaTexto?: string
  anuncianteId?: string
  ejecutivoId?: string
  estado?: string[]
  prioridad?: string[]
  tipoContrato?: string[]
  
  // Filtros de fecha
  fechaCreacionDesde?: Date
  fechaCreacionHasta?: Date
  fechaInicioDesde?: Date
  fechaInicioHasta?: Date
  fechaFinDesde?: Date
  fechaFinHasta?: Date
  
  // Filtros de valor
  valorMinimoNeto?: number
  valorMaximoNeto?: number
  moneda?: string[]
  
  // Filtros de términos
  diasPagoMinimo?: number
  diasPagoMaximo?: number
  modalidadFacturacion?: string[]
  esCanje?: boolean
  
  // Filtros de riesgo
  nivelRiesgo?: string[]
  scoreRiesgoMinimo?: number
  scoreRiesgoMaximo?: number
  
  // Filtros de rentabilidad
  margenMinimoRentabilidad?: number
  roiMinimo?: number
  
  // Filtros de workflow
  etapaActual?: string[]
  responsableActual?: string
  tieneAlertas?: boolean
  requiereAccion?: boolean
  
  // Filtros avanzados
  tags?: string[]
  conLineasEspecificacion?: boolean
  conAprobacionesPendientes?: boolean
  proximosAVencer?: number // días
  
  // Ordenamiento
  ordenarPor?: 'fecha' | 'valor' | 'progreso' | 'anunciante' | 'ejecutivo' | 'prioridad'
  direccionOrden?: 'asc' | 'desc'
  
  // Paginación
  pagina?: number
  tamanoPagina?: number
  
  // Opciones de respuesta
  incluirTotales?: boolean
  incluirEstadisticas?: boolean
  incluirAgrupaciones?: boolean
}

export interface BuscarContratosResponse {
  contratos: {
    id: string
    numero: string
    anunciante: string
    producto: string
    ejecutivo: string
    valorNeto: number
    moneda: string
    estado: string
    prioridad: string
    progreso: number
    fechaCreacion: Date
    fechaFin: Date
    alertas: number
    tags: string[]
    
    // Métricas resumidas
    riesgoNivel: string
    margenRentabilidad: number
    diasRestantes: number
    requiereAccion: boolean
  }[]
  
  paginacion: {
    total: number
    pagina: number
    tamanoPagina: number
    totalPaginas: number
  }
  
  totales?: {
    valorTotalNeto: number
    valorPromedio: number
    contratosPorEstado: Record<string, number>
    contratosPorPrioridad: Record<string, number>
  }
  
  estadisticas?: {
    promedioProgreso: number
    promedioRiesgo: number
    promedioRentabilidad: number
    alertasActivas: number
    accionesPendientes: number
  }
  
  agrupaciones?: {
    porAnunciante: { anunciante: string; cantidad: number; valor: number }[]
    porEjecutivo: { ejecutivo: string; cantidad: number; valor: number }[]
    porMes: { mes: string; cantidad: number; valor: number }[]
  }
}