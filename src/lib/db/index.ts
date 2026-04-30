/**
 * SILEXAR PULSE - DB Module
 * 
 * @description Barrel export for all database utilities including Drizzle ORM instance
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import {
  withTransaction,
  batchTransaction,
  withSavepoint,
  transactionManager,
  TransactionManager,
  TransactionError,
  type TransactionOptions,
  type IsolationLevel,
} from './TransactionHelper';

// ═══════════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════

let sql: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create the database connection
 */
function getSql(): ReturnType<typeof postgres> {
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL!, {
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      idle_timeout: 30,
      connect_timeout: 2,
    });
  }
  return sql;
}

/**
 * Get the Drizzle database instance
 */
export function getDB() {
  if (!dbInstance) {
    dbInstance = drizzle(getSql(), { schema });
  }
  return dbInstance;
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  try {
    if (!process.env.DATABASE_URL) return false;
    return true;
  } catch {
    return false;
  }
}

// Main database instance export
export { schema };
export const db = getDB();

// Re-export transaction helpers
export {
  withTransaction,
  batchTransaction,
  withSavepoint,
  transactionManager,
  TransactionManager,
  TransactionError,
  type TransactionOptions,
  type IsolationLevel,
} from './TransactionHelper';
