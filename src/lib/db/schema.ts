/**
 * Silexar Pulse - Master Schema Registry
 * Central export of all Drizzle ORM table definitions for migrations and queries
 */

// Core - Users, Tenants, Roles, Sessions
export * from './users-schema';

// Business modules
export * from './anunciantes-schema';
export * from './agencias-creativas-schema';
export * from './agencias-medios-schema';
export * from './contratos-schema';
export * from './campanas-schema';
export * from './emisoras-schema';
export { tipoComisionEnum, periodoMetaEnum, equiposVentas, equiposVentasRelations, metasVentas, historialComisiones } from './equipos-ventas-schema';
export type { VendedorSelect, VendedorInsert, EquipoVentasSelect, MetaVentasSelect } from './equipos-ventas-schema';
export * from './facturacion-schema';
export * from './vencimientos-schema';
export * from './emision-schema';
export * from './propuestas-schema';
export * from './crm-schema';
export * from './vendedores-schema';

// Priority schemas — used by audit-logger, routes, and cross-module code
export * from './cunas-schema';
export * from './audit-logs-schema';
export * from './materiales-schema';

// Cunas ecosystem schemas
export * from './cunas-extended-schema';
export * from './cunas-digital-schema';
export * from './cunas-compliance-schema';

// Additional domain schemas
export * from './archivos-adjuntos-schema';
export * from './cierre-mensual-schema';
export * from './cotizaciones-schema';
export * from './ventas-premium-schema';

export * from './activos-digitales-schema';
export * from './cunas-programacion-schema';

// AI / Cortex engines state persistence
export * from './cortex-schema';

// Propiedades (configurable media asset attributes per tenant)
export * from './propiedades-schema';
