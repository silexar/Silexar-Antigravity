/**
 * MÓDULO CUÑAS — BARREL DE EXPORTS PÚBLICOS
 *
 * Expone únicamente las interfaces públicas del módulo.
 * Los módulos externos deben importar SOLO desde aquí,
 * nunca directamente desde las subcarpetas internas.
 *
 * @tier TIER_0_FORTUNE_10
 * @version 2026.2.0 — Incluye capa DDD completa para activos digitales
 */

// ─── Domain — Entities ────────────────────────────────────────────────────────
export { Cuna } from './domain/entities/Cuna';
export type { CunaProps, TipoCunaValor } from './domain/entities/Cuna';
export { Audio } from './domain/entities/Audio';
export type { AudioProps, FormatoAudioValor, EstadoProcesamiento } from './domain/entities/Audio';
export { GrupoDistribucion } from './domain/entities/GrupoDistribucion';
export type { GrupoDistribucionProps, MiembroGrupo, RolDestinatario } from './domain/entities/GrupoDistribucion';
export { PromoIDA } from './domain/entities/PromoIDA';
export type { PromoIDAProps, VariableIDA } from './domain/entities/PromoIDA';

// ─── Domain — Entities Secundarias ────────────────────────────────────────────
export { Mencion } from './domain/entities/Mencion';
export type { MencionProps } from './domain/entities/Mencion';
export { Presentacion } from './domain/entities/Presentacion';
export type { PresentacionProps } from './domain/entities/Presentacion';
export { Cierre } from './domain/entities/Cierre';
export type { CierreProps } from './domain/entities/Cierre';

// ─── Domain — Entities — Digital ──────────────────────────────────────────────
export { ActivoDigital } from './domain/entities/ActivoDigital';
export type {
    ActivoDigitalProps,
    EstadoActivoDigitalValor,
    TipoActivoDigitalValor,
    FormatoArchivoValor,
} from './domain/entities/ActivoDigital';

// ─── Domain — Value Objects ───────────────────────────────────────────────────
export { CunaId } from './domain/value-objects/CunaId';
export { EstadoCuna } from './domain/value-objects/EstadoCuna';
export type { EstadoCunaValor } from './domain/value-objects/EstadoCuna';
export { Duracion } from './domain/value-objects/Duracion';
export { CalidadAudio } from './domain/value-objects/CalidadAudio';
export { TiempoLocucion } from './domain/value-objects/TiempoLocucion';
export { VariablePersonalizada } from './domain/value-objects/VariablePersonalizada';
export type { TipoVariable } from './domain/value-objects/VariablePersonalizada';

// ─── Domain — Value Objects — Digital ─────────────────────────────────────────
export { FormatoBanner } from './domain/value-objects/FormatoBanner';
export type { FormatoBannerValor } from './domain/value-objects/FormatoBanner';
export { TipoVideo } from './domain/value-objects/TipoVideo';
export type { TipoVideoValor } from './domain/value-objects/TipoVideo';
export { DimensionesAsset } from './domain/value-objects/DimensionesAsset';
export type { AspectRatio } from './domain/value-objects/DimensionesAsset';
export { PlataformaDestino } from './domain/value-objects/PlataformaDestino';
export type { PlataformaDestinoValor } from './domain/value-objects/PlataformaDestino';

// ─── Domain — Repository Interfaces ───────────────────────────────────────────
export type { ICunaRepository, CunaFilter, CunaListResult } from './domain/repositories/ICunaRepository';
export type { IActivoDigitalRepository, ActivoDigitalFilter, ActivoDigitalListResult } from './domain/repositories/IActivoDigitalRepository';
export type { IAudioRepository } from './domain/repositories/IAudioRepository';
export type { IDistribucionRepository, RegistroEnvio } from './domain/repositories/IDistribucionRepository';

// ─── Domain — Events ─────────────────────────────────────────────────────────
export { CunaAprobadaEvent } from './domain/events/CunaAprobadaEvent';
export { CunaEnAireEvent } from './domain/events/CunaEnAireEvent';
export { CunaVencidaEvent } from './domain/events/CunaVencidaEvent';

// ─── Application — Commands ───────────────────────────────────────────────────
export { CrearCunaCommand } from './application/commands/CrearCunaCommand';
export type { CrearCunaInput } from './application/commands/CrearCunaCommand';
export { ActualizarCunaCommand } from './application/commands/ActualizarCunaCommand';
export type { ActualizarCunaInput } from './application/commands/ActualizarCunaCommand';
export { CambiarEstadoCunaCommand } from './application/commands/CambiarEstadoCunaCommand';
export { BulkUpdateCunasCommand } from './application/commands/BulkUpdateCunasCommand';
export type { BulkUpdateResult } from './application/commands/BulkUpdateCunasCommand';
export { CrearActivoDigitalCommand } from './application/commands/CrearActivoDigitalCommand';
export type { CrearActivoDigitalInput } from './application/commands/CrearActivoDigitalCommand';
export { ProcesarAudioCommand } from './application/commands/ProcesarAudioCommand';
export type { ProcesarAudioInput } from './application/commands/ProcesarAudioCommand';
export { CopiarCunaCommand } from './application/commands/CopiarCunaCommand';
export type { CopiarCunaInput } from './application/commands/CopiarCunaCommand';
export { EnviarGrupoDistribucionCommand } from './application/commands/EnviarGrupoDistribucionCommand';
export type { EnviarGrupoDistribucionInput, CanalDistribucion } from './application/commands/EnviarGrupoDistribucionCommand';

// ─── Application — Queries ────────────────────────────────────────────────────
export { BuscarCunasQuery } from './application/queries/BuscarCunasQuery';
export { ObtenerDetalleCunaQuery } from './application/queries/ObtenerDetalleCunaQuery';
export { ObtenerCunasPorVencerQuery } from './application/queries/ObtenerCunasPorVencerQuery';
export { ObtenerHistorialUsoQuery } from './application/queries/ObtenerHistorialUsoQuery';
export type { ObtenerHistorialUsoInput } from './application/queries/ObtenerHistorialUsoQuery';
export { ObtenerPresentacionesFaltantesQuery } from './application/queries/ObtenerPresentacionesFaltantesQuery';
export type { ObtenerPresentacionesFaltantesInput } from './application/queries/ObtenerPresentacionesFaltantesQuery';
export { ValidarMaterialContratoQuery } from './application/queries/ValidarMaterialContratoQuery';
export type { ValidarMaterialContratoInput } from './application/queries/ValidarMaterialContratoQuery';
export { GenerarReporteDistribucionQuery } from './application/queries/GenerarReporteDistribucionQuery';
export type { GenerarReporteDistribucionInput } from './application/queries/GenerarReporteDistribucionQuery';

// ─── Application — Handlers ───────────────────────────────────────────────────
export { CrearCunaHandler } from './application/handlers/CrearCunaHandler';
export { ActualizarCunaHandler } from './application/handlers/ActualizarCunaHandler';
export { CambiarEstadoCunaHandler } from './application/handlers/CambiarEstadoCunaHandler';
export { BulkUpdateCunasHandler } from './application/handlers/BulkUpdateCunasHandler';
export { CrearActivoDigitalHandler } from './application/handlers/CrearActivoDigitalHandler';
export { ProcesarAudioHandler } from './application/handlers/ProcesarAudioHandler';
export type { AudioProcessingResult, IAudioProcessingService } from './application/handlers/ProcesarAudioHandler';
export { CopiarCunaHandler } from './application/handlers/CopiarCunaHandler';
export { EnviarGrupoDistribucionHandler } from './application/handlers/EnviarGrupoDistribucionHandler';
export type { IDistributionExternalService } from './application/handlers/EnviarGrupoDistribucionHandler';

// ─── Application — Services ───────────────────────────────────────────────────
export { AnuncianteValidatorService, type IAnuncianteService } from './application/services/AnuncianteValidatorService';

// ─── Infrastructure ───────────────────────────────────────────────────────────
export { CunaDrizzleRepository } from './infrastructure/repositories/CunaDrizzleRepository';
export { CunaMapper } from './infrastructure/mappers/CunaMapper';
export { ActivoDigitalDrizzleRepository } from './infrastructure/repositories/ActivoDigitalDrizzleRepository';
export { ActivoDigitalMapper } from './infrastructure/mappers/ActivoDigitalMapper';
export { CortexVoiceService } from './infrastructure/external/CortexVoiceService';
export { CortexSenseService } from './infrastructure/external/CortexSenseService';
export { BroadcastExportService } from './infrastructure/external/BroadcastExportService';
export { AlertaVencimientoService } from './infrastructure/external/AlertaVencimientoService';
export { VencimientosValidationService } from './infrastructure/external/VencimientosValidationService';
export type { VencimientoValidacion, ResultadoValidacionMasiva, CunaParaValidar } from './infrastructure/external/VencimientosValidationService';

// ─── Infrastructure — Messaging ──────────────────────────────────────────────
export { CunaEventPublisher } from './infrastructure/messaging/CunaEventPublisher';
export type { CunaDomainEvent, EventHandler } from './infrastructure/messaging/CunaEventPublisher';
export { VencimientoAlertPublisher } from './infrastructure/messaging/VencimientoAlertPublisher';
export type { AlertaVencimientoPayload, NivelAlertaVencimiento, AlertHandler } from './infrastructure/messaging/VencimientoAlertPublisher';