/**
 * QUERIES AVANZADAS: VENCIMIENTOS FASE 2 - TIER 0 ENTERPRISE
 *
 * @description Queries para reportes, analytics, exclusividades,
 * historial, alertas de programador, y analytics de inventario.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// GENERAR REPORTE DE OCUPACIÓN
// ═══════════════════════════════════════════════════════════════

export interface GenerarReporteOcupacionQuery {
  type: 'GenerarReporteOcupacion'
  payload: {
    emisoraId: string
    periodoDesde: Date
    periodoHasta: Date
    agruparPor: 'programa' | 'franja' | 'tipo_auspicio' | 'mes'
  }
}

export interface ReporteOcupacionResult {
  emisoraNombre: string
  periodo: { desde: string; hasta: string }
  ocupacionPromedio: number
  revenueTotal: number
  revenuePotencial: number
  revenuePerdido: number
  desglose: Array<{
    clave: string
    ocupacion: number
    revenue: number
    cuposUsados: number
    cuposTotal: number
  }>
  tendencia: 'crecimiento' | 'estable' | 'decrecimiento'
}

// ═══════════════════════════════════════════════════════════════
// VALIDAR CONFLICTO DE RUBRO
// ═══════════════════════════════════════════════════════════════

export interface ValidarConflictoRubroQuery {
  type: 'ValidarConflictoRubro'
  payload: {
    programaId: string
    emisoraId: string
    clienteRubro: string
    clienteNombre: string
    subcategoria?: string
  }
}

export interface ConflictoRubroResult {
  tieneConflicto: boolean
  razon?: string
  competidoresActuales: Array<{
    clienteNombre: string
    subcategoria?: string
  }>
  politicaVigente: string
  espaciosDisponibles: number
}

// ═══════════════════════════════════════════════════════════════
// OBTENER HISTORIAL DE PROGRAMA
// ═══════════════════════════════════════════════════════════════

export interface ObtenerHistorialProgramaQuery {
  type: 'ObtenerHistorialPrograma'
  payload: {
    programaId: string
    tipoEvento?: 'creacion' | 'extension' | 'cambio_estado' | 'cambio_fecha' | 'cambio_valor' | 'cancelacion'
    pagina: number
    tamanoPagina: number
  }
}

export interface HistorialProgramaResult {
  programaNombre: string
  total: number
  eventos: Array<{
    id: string
    fecha: Date
    tipo: string
    descripcion: string
    realizadoPor: string
    valorAnterior?: string
    valorNuevo?: string
  }>
}

// ═══════════════════════════════════════════════════════════════
// CALCULAR DISPONIBILIDAD POR PERÍODO
// ═══════════════════════════════════════════════════════════════

export interface CalcularDisponibilidadPeriodoQuery {
  type: 'CalcularDisponibilidadPeriodo'
  payload: {
    emisoraId: string
    programaId?: string
    fechaDesde: Date
    fechaHasta: Date
    tipoAuspicio?: 'tipo_a' | 'tipo_b' | 'solo_menciones'
  }
}

export interface DisponibilidadPeriodoResult {
  diasAnalizados: number
  disponibilidadPorDia: Array<{
    fecha: string
    ocupacion: number
    disponibles: number
    saludInventario: string
  }>
  ocupacionPromedio: number
  mejorDia: { fecha: string; disponibles: number }
  peorDia: { fecha: string; disponibles: number }
}

// ═══════════════════════════════════════════════════════════════
// OBTENER ALERTAS DE PROGRAMADOR
// ═══════════════════════════════════════════════════════════════

export interface ObtenerAlertasProgramadorQuery {
  type: 'ObtenerAlertasProgramador'
  payload: {
    programadorId: string
    emisoraId?: string
    soloNoLeidas?: boolean
    soloPendientes?: boolean
    pagina: number
    tamanoPagina: number
  }
}

export interface AlertaProgramadorResult {
  total: number
  noLeidas: number
  pendientesConfirmacion: number
  alertas: Array<{
    id: string
    tipo: string
    titulo: string
    mensaje: string
    prioridad: string
    clienteNombre: string
    programaNombre: string
    estadoConfirmacion: string
    fechaCreacion: Date
  }>
}

// ═══════════════════════════════════════════════════════════════
// GENERAR ANALYTICS DE INVENTARIO
// ═══════════════════════════════════════════════════════════════

export interface GenerarAnalyticsInventarioQuery {
  type: 'GenerarAnalyticsInventario'
  payload: {
    emisoraId: string
    periodoMeses: number
  }
}

export interface AnalyticsInventarioResult {
  // Salud general
  saludGlobal: string
  ocupacionGlobal: number
  revenueTotal: number
  revenuePotencial: number
  revenuePerdido: number

  // Top performers
  topProgramas: Array<{ nombre: string; ocupacion: number; revenue: number }>
  programasCriticos: Array<{ nombre: string; ocupacion: number; accion: string }>

  // Tendencias
  tendenciaMensual: Array<{ mes: string; ocupacion: number; revenue: number }>

  // KPIs
  kpis: {
    tasaRenovacion: number
    tiempoPromedioVenta: number
    clientesUnicos: number
    cuposEnListaEspera: number
    extensionesSolicitadas: number
    extensionesAprobadas: number
  }
}

// ═══════════════════════════════════════════════════════════════
// TYPE UNION
// ═══════════════════════════════════════════════════════════════

export type VencimientosAdvancedQuery =
  | GenerarReporteOcupacionQuery
  | ValidarConflictoRubroQuery
  | ObtenerHistorialProgramaQuery
  | CalcularDisponibilidadPeriodoQuery
  | ObtenerAlertasProgramadorQuery
  | GenerarAnalyticsInventarioQuery
