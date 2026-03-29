/**
 * SILEXAR PULSE - TIER0+ MÓDULO CAMPAÑAS
 * Barrel export para módulo de campañas
 */

// Domain
export { Campana } from './domain/entities/Campana';
export type { CampanaProps, TipoCampana, CampanaDomainEvent } from './domain/entities/Campana';
export { EstadoCampana } from './domain/value-objects/EstadoCampana';
export type { EstadoCampanaValue } from './domain/value-objects/EstadoCampana';
export { NumeroCampana } from './domain/value-objects/NumeroCampana';
export { PresupuestoCampana } from './domain/value-objects/PresupuestoCampana';
export type { PresupuestoData } from './domain/value-objects/PresupuestoCampana';
export type { ICampanaRepository, CampanaFilters, CampanaPaginada } from './domain/repositories/ICampanaRepository';

// Application
export { CampanaCommandHandler } from './application/handlers/CampanaCommandHandler';
export type { CreateCampanaCommand } from './application/commands/CreateCampanaCommand';

// Infrastructure
export { DrizzleCampanaRepository } from './infrastructure/repositories/DrizzleCampanaRepository';

// Presentation services (legacy)
export { CampanaService, type CampanaResumen, type MetricasGenerales, type FiltrosCampana } from './presentation/services/CampanaService';

// Componentes
export { default as MetricasRapidas } from './presentation/components/MetricasRapidas';
