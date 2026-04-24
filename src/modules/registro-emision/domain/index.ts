// ═══════════════════════════════════════════════════════════════
// DOMAIN LAYER — Registro de Emisión
// ═══════════════════════════════════════════════════════════════

// Entities
export { RegistroAire, type RegistroAireProps, type RegistroAireDomainEvent } from './entities/RegistroAire';
export { RegistroDeteccion, type RegistroDeteccionProps } from './entities/RegistroDeteccion';
export { VerificacionEmision, type VerificacionEmisionProps, type VerificacionEmisionDomainEvent, type TipoMaterialVerificacion } from './entities/VerificacionEmision';
export { ClipEvidencia, type ClipEvidenciaProps } from './entities/ClipEvidencia';
export { AccesoSeguro, type AccesoSeguroProps, type EstadoAccesoSeguroValue } from './entities/AccesoSeguro';

// Value Objects
export { EstadoVerificacion, type EstadoVerificacionValue } from './value-objects/EstadoVerificacion';
export { EstadoRegistroAire, type EstadoRegistroAireValue } from './value-objects/EstadoRegistroAire';
export { HashSHA256 } from './value-objects/HashSHA256';
export { RangoHorario, type RangoHorarioData } from './value-objects/RangoHorario';
export { CodigoAcceso } from './value-objects/CodigoAcceso';

// Repositories
export type { IRegistroAireRepository, RegistroAireFilters, RegistroAirePaginado } from './repositories/IRegistroAireRepository';
export type { IVerificacionEmisionRepository, VerificacionEmisionFilters, VerificacionEmisionPaginada } from './repositories/IVerificacionEmisionRepository';
export type { IClipEvidenciaRepository, ClipEvidenciaFilters } from './repositories/IClipEvidenciaRepository';
export type { ILinkTemporalRepository, AccesoSeguroFilters } from './repositories/ILinkTemporalRepository';

// Errors
export * from './errors/RegistroEmisionErrors';
