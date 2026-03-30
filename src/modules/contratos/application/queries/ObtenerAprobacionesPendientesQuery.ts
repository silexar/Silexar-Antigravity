/**
 * QUERY: OBTENER APROBACIONES PENDIENTES - TIER 0
 */

export interface ObtenerAprobacionesPendientesQuery {
  aprobadorId?: string
  nivelAprobacion?: number
  tipoAprobacion?: 'comercial' | 'financiera' | 'legal' | 'tecnica'
  prioridad?: 'baja' | 'media' | 'alta' | 'critica'
  antiguedadMaxima?: number // días
  valorMinimo?: number
  incluirContextoCompleto: boolean
  ordenarPor?: 'fecha' | 'valor' | 'prioridad' | 'antiguedad'
}

export interface AprobacionesPendientesResult {
  aprobaciones: {
    id: string
    contratoId: string
    numeroContrato: string
    tipo: string
    prioridad: string
    valor: number
    cliente: string
    ejecutivo: string
    fechaSolicitud: Date
    fechaLimite: Date
    diasPendiente: number
    justificacion: string
    documentosAdjuntos: string[]
    contextoCompleto?: {
      historialCliente: string
      riesgoCredito: number
      performanceEjecutivo: string
      comparacionMercado: string
    }
    accionesDisponibles: string[]
  }[]
  resumen: {
    totalPendientes: number
    valorTotalPendiente: number
    distribucionPorTipo: Record<string, number>
    distribucionPorPrioridad: Record<string, number>
    promedioTiempoRespuesta: number
    aprobacionesVencidas: number
  }
  alertas: {
    aprobacionesUrgentes: number
    aprobacionesVencidas: number
    valorEnRiesgo: number
  }
}