// ═══════════════════════════════════════════════════════════════
// INFRASTRUCTURE LAYER — Registro de Emisión
// ═══════════════════════════════════════════════════════════════

// Repositories
export { DrizzleRegistroAireRepository } from './repositories/DrizzleRegistroAireRepository';
export { DrizzleVerificacionEmisionRepository } from './repositories/DrizzleVerificacionEmisionRepository';
export { DrizzleClipEvidenciaRepository } from './repositories/DrizzleClipEvidenciaRepository';
export { DrizzleLinkTemporalRepository } from './repositories/DrizzleLinkTemporalRepository';
export { DrizzleRegistroDeteccionRepository } from './repositories/DrizzleRegistroDeteccionRepository';

// Services
export { AudioFingerprintStub } from './services/AudioFingerprintStub';
export { SpeechToTextStub } from './services/SpeechToTextStub';
export { ClipExtractionStub } from './services/ClipExtractionStub';
export { HashServiceNode } from './services/HashServiceNode';
export { CertificateGeneratorStub } from './services/CertificateGeneratorStub';
