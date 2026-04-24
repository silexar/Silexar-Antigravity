/**
 * 🏢 SILEXAR PULSE - Enterprise Module Index
 *
 * @description Exporta todos los componentes y servicios enterprise
 * para el módulo de contratos TIER 0.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

export { AnalyticsDashboard } from "./AnalyticsDashboard";
export { CopilotFAB, CopilotPanel } from "./CopilotPanel";
export { ObligacionesPanel } from "./ObligacionesPanel";
export { AuditPanel } from "./AuditPanel";
export { ClausulasPanel } from "./ClausulasPanel";

// ═══════════════════════════════════════════════════════════════
// SERVICIOS
// ═══════════════════════════════════════════════════════════════

export { AuditService, useAudit, withAudit } from "../services/AuditService";

export {
  ObligacionesService,
  useObligaciones,
} from "../services/ObligacionesService";

export { CopilotService, useCopilot } from "../services/CopilotService";

export { ClausulasService, useClausulas } from "../services/ClausulasService";

export {
  FirmaDigitalService,
  useFirmaDigital,
} from "../services/FirmaDigitalService";

export {
  useWhatsAppIntegration,
  WhatsAppIntegrationService,
} from "../services/WhatsAppIntegrationService";

export {
  RenovacionesEngine,
  useRenovaciones,
} from "../services/RenovacionesEngine";

export {
  PentagonSecurityService,
  usePentagonSecurity,
} from "../services/PentagonSecurityService";

export {
  AccessControlService,
  useAccessControl,
} from "../services/AccessControlService";

export {
  BroadcastIntegrationService,
  useBroadcastIntegration,
} from "../services/BroadcastIntegrationService";

export {
  MaterialValidationService,
  useMaterialValidation,
} from "../services/MaterialValidationService";

export {
  AIAutoComplete,
  useAIAutoComplete,
} from "../services/AIAutoCompleteService";

export {
  AnomalyDetection,
  useAnomalyDetection,
} from "../services/AnomalyDetectionService";

export {
  AIContractCreator,
  useAIContractCreator,
} from "../services/AIContractCreatorService";

export { PDFGenerator, usePDFGenerator } from "../services/PDFGeneratorService";

export {
  EmailContrato,
  useEmailContrato,
} from "../services/EmailContratoService";

export {
  DocumentationIngestion,
  useDocumentationIngestion,
} from "../services/DocumentationIngestionService";

export {
  getAlertaInfo,
  SmartAlerts,
  useSmartAlerts,
} from "../services/SmartAlertsService";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type {
  AccionCopilot,
  AlertaInteligente,
  CambioContrato,
  // Cláusulas
  CategoriaClausula,
  ClausulaLegal,
  // Integraciones
  ConfiguracionIntegraciones,
  // Renovaciones
  ConfiguracionRenovacion,
  ConfiguracionSeguridad,
  ContextoCopilot,
  // Analytics
  ContractAnalyticsDashboard,
  EnmiendaContrato,
  EstadoClausula,
  // Estados y ciclo de vida
  EstadoContratoExtendido,
  EstadoObligacion,
  EventoAuditoria,
  FrecuenciaObligacion,
  // Copilot
  IntentoCopilot,
  MensajeCopilot,
  // Notificaciones
  NotificacionPush,
  ObligacionContrato,
  OportunidadUpsell,
  PermisoContrato,
  PermisosPorRol,
  PlantillaContrato,
  PrediccionChurn,
  PrediccionRenovacion,
  PrediccionRiesgoPago,
  PreferenciasNotificacion,
  RentabilidadCliente,
  RentabilidadEjecutivo,
  RentabilidadMedio,
  ResumenObligaciones,
  // Seguridad
  RolUsuario,
  SeccionPlantilla,
  SugerenciaCopilot,
  TendenciaRentabilidad,
  TipoEventoAuditoria,
  // Obligaciones
  TipoObligacion,
  TransicionEstado,
  VariableClausula,
  // Versionado
  VersionContrato,
} from "../types/enterprise.types";

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEFAULT
// ═══════════════════════════════════════════════════════════════

export const ENTERPRISE_CONFIG = {
  // Features habilitadas
  features: {
    copilot: true,
    analytics: true,
    obligaciones: true,
    clausulas: true,
    auditoria: true,
    firmaDigital: true,
    notificacionesPush: true,
  },

  // Configuración de seguridad
  security: {
    mfaRequerido: true,
    tiempoSesion: 480, // 8 horas
    intentosMaximos: 5,
    retentcionAuditoria: 2555, // 7 años
  },

  // Límites de negocio
  limits: {
    aprobacionAutomatica: 10000000, // 10M CLP
    descuentoMaximoSinAprobacion: 10, // 10%
    diasPagoMaximoSinAprobacion: 30,
  },
} as const;
