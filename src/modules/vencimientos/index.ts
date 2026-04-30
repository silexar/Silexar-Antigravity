/**
 * MÓDULO VENCIMIENTOS - BARREL EXPORT TIER 0
 */

// ── Value Objects ──
export { HorarioEmision } from './domain/value-objects/HorarioEmision.js'
export { TipoAuspicio } from './domain/value-objects/TipoAuspicio.js'
export { EstadoAuspicio } from './domain/value-objects/EstadoAuspicio.js'
export { CupoDisponible } from './domain/value-objects/CupoDisponible.js'
export { ValorComercial } from './domain/value-objects/ValorComercial.js'
export { DuracionSegundos } from './domain/value-objects/DuracionSegundos.js'
export { FactorTarifa } from './domain/value-objects/FactorTarifa.js'
export { PeriodoVigencia } from './domain/value-objects/PeriodoVigencia.js'
export { ConfirmacionProgramador } from './domain/value-objects/ConfirmacionProgramador.js'
export { NivelAprobacion } from './domain/value-objects/NivelAprobacion.js'

// ── Entities ──
export { Emisora } from './domain/entities/Emisora.js'
export { ProgramaAuspicio } from './domain/entities/ProgramaAuspicio.js'
export { AuspicioSlot } from './domain/entities/AuspicioSlot.js'
export { CupoComercial } from './domain/entities/CupoComercial.js'
export { TarifarioPrograma } from './domain/entities/TarifarioPrograma.js'
export { TandaComercial } from './domain/entities/TandaComercial.js'
export { SenalEspecial } from './domain/entities/SenalEspecial.js'
export { ExclusividadRubro } from './domain/entities/ExclusividadRubro.js'
export { VencimientosAuspicio } from './domain/entities/VencimientosAuspicio.js'
export { AlertaProgramador } from './domain/entities/AlertaProgramador.js'
export { SolicitudExtension } from './domain/entities/SolicitudExtension.js'
export { ListaEspera } from './domain/entities/ListaEspera.js'
export { DisponibilidadCupo } from './domain/entities/DisponibilidadCupo.js'
export { HistorialOcupacion } from './domain/entities/HistorialOcupacion.js'
export { ConfiguracionTarifa } from './domain/entities/ConfiguracionTarifa.js'

// ── Repository Interfaces ──
export type { IEmisoraRepository } from './domain/repositories/IEmisoraRepository.js'
export type { IProgramaAuspicioRepository } from './domain/repositories/IProgramaAuspicioRepository.js'
export type { ICupoComercialRepository } from './domain/repositories/ICupoComercialRepository.js'
export type { ITarifarioRepository } from './domain/repositories/ITarifarioRepository.js'
export type { IVencimientosRepository } from './domain/repositories/IVencimientosRepository.js'
export type { IDisponibilidadRepository } from './domain/repositories/IDisponibilidadRepository.js'
