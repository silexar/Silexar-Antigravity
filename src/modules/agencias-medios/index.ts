/**
 * 🏢 MÓDULO AGENCIAS DE MEDIOS - TIER 0 ENTERPRISE
 * 
 * Centro de Inteligencia de Partnerships Comerciales
 * Gestión automatizada de relaciones con agencias de medios,
 * analytics predictivos y colaboración digital avanzada
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

// ===== DOMAIN LAYER EXPORTS =====

// Entidades principales
export * from './domain/entities/AgenciaMedios'
export * from './domain/entities/ContactoAgencia'

// Value Objects
export * from './domain/value-objects/RutAgenciaMedios'
export * from './domain/value-objects/TipoAgenciaMedios'
export * from './domain/value-objects/ScorePartnership'
export * from './domain/value-objects/EspecializacionVertical'
export * from './domain/value-objects/EstructuraComision'
export * from './domain/value-objects/CapacidadesDigitales'
export * from './domain/value-objects/CertificacionesPlataforma'

// Repositorios
export * from './domain/repositories/IAgenciaMediosRepository'
export * from './domain/repositories/IContactoAgenciaRepository'

// ===== APPLICATION LAYER EXPORTS =====

// Comandos
export * from './application/commands/CrearAgenciaMediosCommand'
export * from './application/commands/ActualizarAgenciaMediosCommand'
export * from './application/commands/ConfigurarComisionesCommand'
export * from './application/commands/AsignarContactoCommand'

// Queries
export * from './application/queries/BuscarAgenciasMediosQuery'
export * from './application/queries/ObtenerDetalleAgenciaQuery'

// Handlers
export * from './application/handlers/AgenciaMediosCommandHandler'

// ===== INFRASTRUCTURE LAYER EXPORTS =====

// Repositorios
export * from './infrastructure/repositories/DrizzleAgenciaMediosRepository'

// Servicios externos
export * from './infrastructure/external/CortexPartnershipService'

// ===== PRESENTATION LAYER EXPORTS =====

// Controladores
export * from './presentation/controllers/AgenciaMediosController'

// Rutas
export * from './presentation/routes/agenciaMediosRoutes'

// ===== MODULE CONFIGURATION =====

export const AGENCIAS_MEDIOS_MODULE_CONFIG = {
    name: 'agencias-medios',
    version: '2025.1.0',
    tier: 'TIER_0_ENTERPRISE',
    description: 'Centro de Inteligencia de Partnerships con IA Avanzada',

    // Características principales
    features: [
        'CORTEX_PARTNERSHIP_AI',           // Motor de IA de partnerships
        'SCORE_PARTNERSHIP_SYSTEM',        // Sistema de scoring 0-1000
        'PREDICTIVE_ANALYTICS',            // Analytics predictivos
        'COMMISSION_AUTOMATION',           // Automatización de comisiones
        'REAL_TIME_COLLABORATION',         // Colaboración en tiempo real
        'INTELLIGENCE_COMPETITIVE',        // Inteligencia competitiva
        'ALERTAS_ESTRATEGICAS',            // Sistema de alertas inteligentes
        'PORTFOLIO_CLIENTES',              // Gestión de cartera de clientes
        'PERFORMANCE_TRACKING',            // Seguimiento de performance
        'CERTIFICATION_TRACKING',          // Seguimiento de certificaciones
        'RENEWAL_PREDICTION',              // Predicción de renovaciones
        'MOBILE_FIRST_DESIGN',             // Diseño mobile-first
        'ENTERPRISE_SECURITY',             // Seguridad empresarial
        'MULTI_TENANT_SUPPORT',            // Soporte multi-tenant
        'ADVANCED_REPORTING'               // Reportes avanzados
    ],

    // Integraciones del ecosistema
    integrations: [
        'modulo-anunciantes',              // Mapeo agencia-cliente
        'modulo-contratos',               // Contratos y términos preferenciales
        'modulo-campanas',                // Colaboración en campañas
        'modulo-facturacion',            // Facturación de comisiones
        'cortex-partnership',             // Motor de IA de partnerships
        'cortex-intelligence',            // Inteligencia competitiva
        'sii-validation',                // Validación tributaria
        'google-partners-api',            // Google Partners API
        'meta-business-partners',         // Meta Business Partners
        'linkedin-sales',                 // LinkedIn Sales Navigator
        'whatsapp-business',             // WhatsApp Business API
        'calendly-integration',          // Integración Calendly
        'slack-collaboration',            // Slack para colaboración
        'docusign-integration',          // DocuSign para firmas
        'banking-api'                    // APIs bancarias
    ],

    // Capacidades técnicas
    capabilities: {
        maxAgencies: 10000,              // Máximo 10K agencias
        maxContactsPerAgency: 100,       // Máximo 100 contactos por agencia
        maxCollaborations: 50000,       // 50K colaboraciones simultáneas
        aiAnalysisTime: '<30s',          // Análisis IA en menos de 30s
        uptime: '99.9%',                 // SLA de disponibilidad
        responseTime: '<100ms',          // Tiempo de respuesta API
        dataRetention: '7years',         // Retención de datos
        compliance: ['SOX', 'GDPR', 'ISO27001', 'PDPA'] // Cumplimiento normativo
    },

    // Métricas de performance esperadas
    benchmarks: {
        partnershipGrowth: '30%',         // Crecimiento de partnerships
        commissionAccuracy: '99.5%',     // Precisión en comisiones
        satisfactionScore: '89%',        // Score de satisfacción
        renewalRate: '94%',              // Tasa de renovación
        timeToOnboard: '21days',         // Tiempo de onboarding
        roi: '340%'                      // Retorno de inversión
    }
} as const

// Tipos de configuración para TypeScript
export type AgenciasMediosModuleConfig = typeof AGENCIAS_MEDIOS_MODULE_CONFIG
export type ModuleFeature = typeof AGENCIAS_MEDIOS_MODULE_CONFIG.features[number]
export type ModuleIntegration = typeof AGENCIAS_MEDIOS_MODULE_CONFIG.integrations[number]
