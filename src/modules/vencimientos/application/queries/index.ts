/**
 * QUERIES: VENCIMIENTOS - TIER 0 ENTERPRISE
 *
 * @description Todos los Queries de Fase 1 del módulo Vencimientos
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// OBTENER DISPONIBILIDAD DE CUPOS
// ═══════════════════════════════════════════════════════════════

export interface ObtenerDisponibilidadCuposQuery {
  type: 'ObtenerDisponibilidadCupos'
  payload: {
    emisoraId?: string
    programaId?: string
    tipoAuspicio?: 'tipo_a' | 'tipo_b' | 'solo_menciones'
    fecha?: Date
  }
}

export interface DisponibilidadCuposResult {
  programaId: string
  programaNombre: string
  emisoraId: string
  emisoraNombre: string
  cuposTipoA: { total: number; ocupados: number; disponibles: number; nivelAlerta: string }
  cuposTipoB: { total: number; ocupados: number; disponibles: number; nivelAlerta: string }
  cuposMenciones: { total: number; ocupados: number; disponibles: number; nivelAlerta: string }
  ocupacionGeneral: number
  saludInventario: string
  listaEsperaCount: number
}

// ═══════════════════════════════════════════════════════════════
// BUSCAR PROGRAMAS DISPONIBLES
// ═══════════════════════════════════════════════════════════════

export interface BuscarProgramasDisponiblesQuery {
  type: 'BuscarProgramasDisponibles'
  payload: {
    emisoraId: string
    tipoAuspicio?: string
    franjaHoraria?: string
    busquedaTexto?: string
    pagina: number
    tamanoPagina: number
  }
}

// ═══════════════════════════════════════════════════════════════
// OBTENER TARIFARIO ACTUAL
// ═══════════════════════════════════════════════════════════════

export interface ObtenerTarifarioActualQuery {
  type: 'ObtenerTarifarioActual'
  payload: {
    programaId: string
    emisoraId: string
  }
}

export interface TarifarioActualResult {
  programaId: string
  programaNombre: string
  preciosTipoA: { valorBase: number; valorConFactores: number; moneda: string }
  preciosTipoB: { valorBase: number; valorConFactores: number; moneda: string }
  preciosMencion: { valorBase: number; valorConFactores: number; moneda: string }
  factoresActivos: Array<{ motivo: string; valor: number; descripcion: string }>
  tablaPreciosPorDuracion: Array<{ duracion: number; precioBase: number; precioFinal: number }>
  paquetesDescuento: Array<{ nombre: string; cantidadMinima: number; descuento: number }>
}

// ═══════════════════════════════════════════════════════════════
// OBTENER VENCIMIENTOS PRÓXIMOS
// ═══════════════════════════════════════════════════════════════

export interface ObtenerVencimientosProximosQuery {
  type: 'ObtenerVencimientosProximos'
  payload: {
    emisoraId?: string
    programaId?: string
    diasAnticipacion: number
    soloConAlerta?: boolean
  }
}

export interface VencimientosProximoResult {
  id: string
  clienteNombre: string
  programaNombre: string
  emisoraNombre: string
  ejecutivoNombre: string
  diasRestantes: number
  nivelAlerta: string
  accionSugerida: string
  countdown48h?: { activo: boolean; horasRestantes: number }
}

// ═══════════════════════════════════════════════════════════════
// OBTENER AUSPICIOS NO INICIADOS (R1)
// ═══════════════════════════════════════════════════════════════

export interface ObtenerAuspiciosNoIniciadosQuery {
  type: 'ObtenerAuspiciosNoIniciados'
  payload: {
    emisoraId?: string
    soloCountdownActivo?: boolean
  }
}

export interface AuspicioNoIniciadoResult {
  cupoComercialId: string
  clienteNombre: string
  programaNombre: string
  ejecutivoNombre: string
  fechaInicioEsperada: Date
  diasSinIniciar: number
  countdown48h: {
    activo: boolean
    horasRestantes: number
    expira?: Date
  }
  extensionesPrevias: number
  accionSugerida: string
}

// ═══════════════════════════════════════════════════════════════
// TYPE UNION
// ═══════════════════════════════════════════════════════════════

export type VencimientosQuery =
  | ObtenerDisponibilidadCuposQuery
  | BuscarProgramasDisponiblesQuery
  | ObtenerTarifarioActualQuery
  | ObtenerVencimientosProximosQuery
  | ObtenerAuspiciosNoIniciadosQuery
