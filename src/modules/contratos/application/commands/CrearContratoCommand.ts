/**
 * COMANDO: CREAR CONTRATO - TIER 0
 * 
 * @description Comando para creación de contratos con validaciones automáticas
 */

export interface CrearContratoCommand {
  // Información básica
  anuncianteId: string
  anunciante: string
  rutAnunciante: string
  producto: string
  agenciaId?: string
  agencia?: string
  ejecutivoId: string
  ejecutivo: string
  
  // Valores financieros
  valorBruto: number
  descuentoPorcentaje: number
  moneda: 'CLP' | 'USD' | 'UF'
  
  // Fechas
  fechaInicio: Date
  fechaFin: Date
  
  // Términos comerciales
  diasPago: number
  modalidadFacturacion: 'hitos' | 'cuotas'
  tipoFactura: 'posterior' | 'adelantado'
  esCanje: boolean
  facturarComisionAgencia: boolean
  
  // Clasificación
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  tipoContrato: 'A' | 'B' | 'C'
  medio?: 'fm' | 'digital' | 'hibrido'
  tags: string[]
  
  // Especificaciones de pauta (opcional)
  lineasEspecificacion?: {
    medioId: string
    medio: string
    formatoId: string
    formato: string
    horario: string
    fechaInicio: Date
    fechaFin: Date
    frecuencia: number
    duracion: number
    valorUnitario: number
    cantidad: number
  }[]
  
  // Metadatos
  creadoPor: string
  observaciones?: string
}

export interface CrearContratoResult {
  contratoId: string
  numero: string
  estado: string
  alertas: string[]
  requiereAprobacion: boolean
  nivelAprobacion?: number
  proximaAccion: string
}