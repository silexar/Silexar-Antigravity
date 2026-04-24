/**
 * MÓDULO PAQUETES - EXPORTS
 * 
 * @description Catálogo maestro de productos comercializables.
 * Controla inventario, pricing dinámico y disponibilidad en tiempo real.
 * 
 * @version 1.0.0
 * @tier TIER_0_ENTERPRISE
 */

export * from './domain/entities/Paquete.js'
export * from './domain/entities/DisponibilidadInventario.js'
export * from './domain/entities/RestriccionPaquete.js'
export * from './domain/entities/PerformancePaquete.js'

export * from './domain/value-objects/CodigoPaquete.js'
export * from './domain/value-objects/TipoPaquete.js'
export * from './domain/value-objects/DuracionPublicidad.js'
export * from './domain/value-objects/HorarioEmision.js'
export * from './domain/value-objects/PrecioBase.js'
export * from './domain/value-objects/FactorEstacionalidad.js'
export * from './domain/value-objects/NivelExclusividad.js'

export * from './application/commands/index.js'
export * from './application/queries/index.js'
export * from './application/handlers/index.js'
export * from './application/hooks/usePaquetesIntegration.js'

export * from './infrastructure/repositories/index.js'
export * from './infrastructure/external/index.js'

// Presentation exports - controllers folder does not exist yet
// export { default as PaqueteController } from './presentation/controllers/PaqueteController.js'