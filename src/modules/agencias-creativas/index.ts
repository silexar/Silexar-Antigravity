/**
 * 🎨 MÓDULO AGENCIAS CREATIVAS - TIER 0 ENTERPRISE
 * 
 * Hub de talento creativo inteligente para empresas Fortune 10
 * Gestión automatizada de agencias, proyectos creativos y colaboración con IA
 * 
 * @version 2024.1.0
 * @tier TIER_0_ENTERPRISE
 */

// ===== DOMAIN LAYER EXPORTS =====

// Entidades principales
export * from './domain/entities/AgenciaCreativa'
export * from './domain/entities/ContactoCreativo'
export * from './domain/entities/ProyectoCreativo'
export * from './domain/entities/BriefCreativo'
export * from './domain/entities/PortfolioTrabajo'

// Value Objects
export * from './domain/value-objects/RutAgenciaCreativa'
export * from './domain/value-objects/TipoAgenciaCreativa'
export * from './domain/value-objects/ScoreCreativo'
export * from './domain/value-objects/EspecializacionCreativa'
export * from './domain/value-objects/NivelExperiencia'
export * from './domain/value-objects/EstadoDisponibilidad'
export * from './domain/value-objects/RangoPresupuesto'

// Repositorios
export * from './domain/repositories/IAgenciaCreativaRepository'
export * from './domain/repositories/IContactoCreativoRepository'

// ===== APPLICATION LAYER EXPORTS =====

// Comandos
export * from './application/commands/CrearAgenciaCreativaCommand'
export * from './application/commands/AsignarProyectoCommand'

// Handlers
export * from './application/handlers/AgenciaCreativaCommandHandler'

// ===== INFRASTRUCTURE LAYER EXPORTS =====

// Servicios externos
export * from './infrastructure/external/CortexCreativeService'

// Configuración
export * from './infrastructure/config/moduleConfig'

// ===== PRESENTATION LAYER EXPORTS =====

// Controladores
export * from './presentation/controllers/AgenciaCreativaController'

// Rutas
export * from './presentation/routes/agenciaCreativaRoutes'

// ===== MODULE CONFIGURATION =====

export const AGENCIAS_CREATIVAS_MODULE_CONFIG = {
  name: 'agencias-creativas',
  version: '2024.1.0',
  tier: 'TIER_0_ENTERPRISE',
  description: 'Centro de Talento Creativo con IA Avanzada para Fortune 10',
  
  // Características principales
  features: [
    'CORTEX_CREATIVE_AI',           // Motor de IA creativa
    'INTELLIGENT_MATCHING',         // Matching automático proyecto-agencia
    'PREDICTIVE_ANALYTICS',         // Analytics predictivos
    'QUALITY_ASSURANCE_AUTO',       // Validación automática de calidad
    'PORTFOLIO_INTELLIGENCE',       // Análisis inteligente de portfolios
    'BRIEF_AUTOMATION',            // Automatización de briefs
    'DEADLINE_PREDICTION',         // Predicción de entregas
    'COST_OPTIMIZATION',           // Optimización de costos
    'TALENT_MATCHING',             // Matching de talento
    'REAL_TIME_COLLABORATION',     // Colaboración en tiempo real
    'MOBILE_FIRST_DESIGN',         // Diseño mobile-first
    'ENTERPRISE_SECURITY',         // Seguridad empresarial
    'MULTI_TENANT_SUPPORT',        // Soporte multi-tenant
    'ADVANCED_REPORTING'           // Reportes avanzados
  ],
  
  // Integraciones del ecosistema
  integrations: [
    'modulo-creatividades',        // Gestión de creatividades
    'modulo-contratos',           // Contratos y facturación
    'modulo-campanas',            // Campañas publicitarias
    'modulo-facturacion',         // Facturación automática
    'cortex-creative',            // Motor de IA creativa
    'cortex-quality',             // Análisis de calidad
    'sii-validation',             // Validación tributaria
    'behance-api',                // Integración Behance
    'dribbble-api',               // Integración Dribbble
    'instagram-business'          // Instagram Business
  ],
  
  // Capacidades técnicas
  capabilities: {
    maxAgencies: 10000,           // Máximo 10K agencias
    maxConcurrentProjects: 50000, // 50K proyectos simultáneos
    aiAnalysisTime: '<30s',       // Análisis IA en menos de 30s
    uptime: '99.9%',              // SLA de disponibilidad
    responseTime: '<100ms',       // Tiempo de respuesta API
    dataRetention: '7years',      // Retención de datos
    compliance: ['SOX', 'GDPR', 'ISO27001'] // Cumplimiento normativo
  },
  
  // Métricas de performance
  benchmarks: {
    qualityImprovement: '40%',    // Mejora en calidad
    timeReduction: '60%',         // Reducción de tiempos
    costOptimization: '25%',      // Optimización de costos
    clientSatisfaction: '89%',    // Satisfacción de clientes
    onTimeDelivery: '94%',        // Entregas puntuales
    roi: '340%'                   // Retorno de inversión
  }
} as const

// Tipos de configuración para TypeScript
export type AgenciasCreativasModuleConfig = typeof AGENCIAS_CREATIVAS_MODULE_CONFIG
export type ModuleFeature = typeof AGENCIAS_CREATIVAS_MODULE_CONFIG.features[number]
export type ModuleIntegration = typeof AGENCIAS_CREATIVAS_MODULE_CONFIG.integrations[number]