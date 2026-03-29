/**
 * 🗃️ SILEXAR PULSE - Conexión a Base de Datos
 * 
 * @description Cliente Drizzle configurado para PostgreSQL
 * 
 * @version 2025.1.0
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { logger } from '@/lib/observability';
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
import * as auditLogsSchema from './audit-logs-schema';

// ═══════════════════════════════════════════════════════════════
// CONEXIÓN
// ═══════════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.warn('⚠️ DATABASE_URL no definida - usando modo mock');
}

// Cliente PostgreSQL
const DB_POOL_MAX = parseInt(process.env.DB_POOL_MAX || '20', 10);

const client = connectionString
  ? postgres(connectionString, {
      max: DB_POOL_MAX,
      idle_timeout: 300,
      connect_timeout: 30,
    })
  : null;

// Instancia Drizzle con todos los schemas
export const db = client 
  ? drizzle(client, {
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
        ...auditLogsSchema,
      }
    })
  : null;

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica si la conexión a BD está activa
 */
export function isDatabaseConnected(): boolean {
  return db !== null;
}

/**
 * Obtiene la instancia de DB o lanza error
 */
export function getDB() {
  if (!db) {
    throw new Error('Base de datos no configurada. Verifica DATABASE_URL en .env.local');
  }
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
export * from './audit-logs-schema';

