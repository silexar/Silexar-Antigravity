/**
 * COMMANDS: VENCIMIENTOS - TIER 0 ENTERPRISE
 *
 * @description Todos los Commands de Fase 1 del módulo Vencimientos
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// CREAR PROGRAMA AUSPICIO
// ═══════════════════════════════════════════════════════════════

import type { HorarioEmisionProps } from '../../domain/value-objects/HorarioEmision.js'
import type { CupoDisponibleProps } from '../../domain/value-objects/CupoDisponible.js'
import type { ConductorPrograma } from '../../domain/entities/ProgramaAuspicio.js'

export interface CrearProgramaAuspicioCommand {
  type: 'CrearProgramaAuspicio'
  payload: {
    emisoraId: string
    emisoraNombre: string
    nombre: string
    descripcion: string
    conductores: ConductorPrograma[]
    horario: HorarioEmisionProps
    cuposTipoA: CupoDisponibleProps
    cuposTipoB: CupoDisponibleProps
    cuposMenciones: CupoDisponibleProps
    creadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTUALIZAR CUPOS
// ═══════════════════════════════════════════════════════════════

export interface ActualizarCuposCommand {
  type: 'ActualizarCupos'
  payload: {
    programaId: string
    tipoCupo: 'tipo_a' | 'tipo_b' | 'menciones'
    cuposActualizados: CupoDisponibleProps
    responsable: string
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTIVAR AUSPICIO
// ═══════════════════════════════════════════════════════════════

export interface ActivarAuspicioCommand {
  type: 'ActivarAuspicio'
  payload: {
    cupoComercialId: string
    confirmadoPor: string
    comentario?: string
  }
}

// ═══════════════════════════════════════════════════════════════
// FINALIZAR AUSPICIO
// ═══════════════════════════════════════════════════════════════

export interface FinalizarAuspicioCommand {
  type: 'FinalizarAuspicio'
  payload: {
    cupoComercialId: string
    finalizadoPor: string
    motivo: 'vencimientos' | 'cancelacion' | 'no_inicio'
    comentario?: string
  }
}

// ═══════════════════════════════════════════════════════════════
// VALIDAR DISPONIBILIDAD
// ═══════════════════════════════════════════════════════════════

export interface ValidarDisponibilidadCommand {
  type: 'ValidarDisponibilidad'
  payload: {
    programaId: string
    emisoraId: string
    tipoAuspicio: 'tipo_a' | 'tipo_b' | 'solo_menciones'
    clienteRubro: string
    fechaInicio: Date
    fechaFin: Date
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAR TARIFARIO
// ═══════════════════════════════════════════════════════════════

export interface ConfigurarTarifarioCommand {
  type: 'ConfigurarTarifario'
  payload: {
    programaId: string
    emisoraId: string
    precioBaseTipoA: number
    precioBaseTipoB: number
    precioBaseMencion: number
    moneda: 'CLP' | 'USD' | 'UF'
    factoresAdicionales: Array<{ motivo: string; valor: number; descripcion: string }>
    vigenciaDesde: Date
    vigenciaHasta: Date
    configuradoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// SOLICITAR EXTENSIÓN (R1)
// ═══════════════════════════════════════════════════════════════

export interface SolicitarExtensionCommand {
  type: 'SolicitarExtension'
  payload: {
    cupoComercialId: string
    nuevaFechaInicio: Date
    nuevaFechaFin: Date
    motivoSolicitud: string
    ejecutivoId: string
    ejecutivoNombre: string
  }
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR AUSPICIO NO INICIADO (R1)
// ═══════════════════════════════════════════════════════════════

export interface EliminarAuspicioNoIniciadoCommand {
  type: 'EliminarAuspicioNoIniciado'
  payload: {
    cupoComercialId: string
    motivo: string
    ejecutadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// TYPE UNION
// ═══════════════════════════════════════════════════════════════

export type VencimientosCommand =
  | CrearProgramaAuspicioCommand
  | ActualizarCuposCommand
  | ActivarAuspicioCommand
  | FinalizarAuspicioCommand
  | ValidarDisponibilidadCommand
  | ConfigurarTarifarioCommand
  | SolicitarExtensionCommand
  | EliminarAuspicioNoIniciadoCommand
