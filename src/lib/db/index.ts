/**
 * SILEXAR PULSE - Database Connection
 *
 * Drizzle ORM client configured for PostgreSQL.
 * Requires DATABASE_URL environment variable — throws if not set.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Schemas
import * as usersSchema from './users-schema';
import * as anunciantesSchema from './anunciantes-schema';
import * as archivosAdjuntosSchema from './archivos-adjuntos-schema';
import * as agenciasSchema from './agencias-medios-schema';
import * as emisorasSchema from './emisoras-schema';
import * as cunasSchema from './cunas-schema';
import * as contratosSchema from './contratos-schema';
import * as campanasSchema from './campanas-schema';
import * as vendedoresSchema from './vendedores-schema';
import * as facturacionSchema from './facturacion-schema';
import * as vencimientosSchema from './vencimientos-schema';
import * as emisionSchema from './emision-schema';
import * as propuestasSchema from './propuestas-schema';
import * as materialesSchema from './materiales-schema';
import * as cunasDigitalSchema from './cunas-digital-schema';
import * as rrssSchema from './rrss-schema';
import * as auditLogsSchema from './audit-logs-schema';

// ═══════════════════════════════════════════════════════════════
// CONNECTION
// ═══════════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required. Set it in your .env.local file.\n' +
    'Example: postgres://user:password@localhost:5432/silexar_pulse'
  );
}

const DB_POOL_MAX = parseInt(process.env.DB_POOL_MAX || '20', 10);

const client = postgres(connectionString, {
  max: DB_POOL_MAX,
  idle_timeout: 300,
  connect_timeout: 30,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

// Drizzle instance with all schemas
export const db = drizzle(client, {
      schema: {
        ...usersSchema,
        ...anunciantesSchema,
        ...archivosAdjuntosSchema,
        ...agenciasSchema,
        ...emisorasSchema,
        ...cunasSchema,
        ...contratosSchema,
        ...campanasSchema,
        ...vendedoresSchema,
        ...facturacionSchema,
        ...vencimientosSchema,
        ...emisionSchema,
        ...propuestasSchema,
        ...materialesSchema,
        ...cunasDigitalSchema,
        ...rrssSchema,
        ...auditLogsSchema,
      },
    });

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Database is always connected — throws on startup if DATABASE_URL is missing.
 * This function exists for backwards compatibility.
 */
export function isDatabaseConnected(): boolean {
  return true;
}

/**
 * Returns the Drizzle database instance.
 */
export function getDB() {
  return db;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS DE SCHEMAS
// ═══════════════════════════════════════════════════════════════

export * from './users-schema';
export * from './anunciantes-schema';
export * from './archivos-adjuntos-schema';
export * from './agencias-medios-schema';
export * from './emisoras-schema';
export * from './cunas-schema';
export * from './contratos-schema';
export * from './campanas-schema';
export * from './vendedores-schema';
export * from './facturacion-schema';
export * from './vencimientos-schema';
export * from './emision-schema';
export * from './propuestas-schema';
export * from './materiales-schema';
export * from './cunas-digital-schema';
export * from './digital-schema';
export * from './rrss-schema';
export * from './audit-logs-schema';

