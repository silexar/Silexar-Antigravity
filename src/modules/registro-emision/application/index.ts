// ═══════════════════════════════════════════════════════════════
// APPLICATION LAYER — Registro de Emisión
// ═══════════════════════════════════════════════════════════════

// DTOs
export * from './dtos/RegistroAireDTOs';
export * from './dtos/VerificacionEmisionDTOs';
export * from './dtos/ClipEvidenciaDTOs';
export * from './dtos/AccesoSeguroDTOs';

// Services (interfaces)
export type { IAudioFingerprintService, FingerprintMatch, FingerprintRequest } from './services/IAudioFingerprintService';
export type { ISpeechToTextService, TranscriptionResult, SpeechToTextRequest } from './services/ISpeechToTextService';
export type { IClipExtractionService, ClipExtractionRequest, ClipExtractionResult } from './services/IClipExtractionService';
export type { IHashService } from './services/IHashService';
export type { ICertificateGeneratorService, CertificateData, CertificateResult } from './services/ICertificateGeneratorService';

// Use Cases
export { CrearRegistroAireUseCase } from './use-cases/CrearRegistroAireUseCase';
export { CrearVerificacionUseCase } from './use-cases/CrearVerificacionUseCase';
export { EjecutarVerificacionUseCase, type EjecutarVerificacionInput } from './use-cases/EjecutarVerificacionUseCase';
export { AprobarClipUseCase, type AprobarClipResult } from './use-cases/AprobarClipUseCase';
export { CrearAccesoSeguroUseCase } from './use-cases/CrearAccesoSeguroUseCase';
export { ValidarAccesoSeguroUseCase, type ValidarAccesoResult } from './use-cases/ValidarAccesoSeguroUseCase';
export { RegistrarDescargaUseCase } from './use-cases/RegistrarDescargaUseCase';
export { LimpiarExpiradosUseCase, type LimpiarExpiradosResult } from './use-cases/LimpiarExpiradosUseCase';
