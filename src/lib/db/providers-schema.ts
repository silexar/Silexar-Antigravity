/**
 * Providers Database Schema
 * 
 * Schema for storing provider configurations in the database.
 * This allows runtime configuration of services without code changes.
 * 
 * Line Reference: providers-schema.ts:1
 */

import { pgTable, uuid, text, boolean, timestamp, jsonb, varchar, numeric, integer } from 'drizzle-orm/pg-core';

/**
 * Providers configuration table
 * Stores all provider configurations (API keys, endpoints, etc.)
 */
export const providers = pgTable('providers', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    serviceType: varchar('service_type', { length: 50 }).notNull().$type<
        | 'speech'
        | 'database'
        | 'storage'
        | 'email'
        | 'sms'
        | 'tts'
        | 'cache'
    >(),
    providerClass: varchar('provider_class', { length: 100 }).notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    config: jsonb('config').notNull().$type<Record<string, unknown>>(),
    status: varchar('status', { length: 20 }).notNull().default('active').$type<
        'active' | 'inactive' | 'degraded' | 'unavailable'
    >(),
    healthStatus: jsonb('health_status').$type<{
        status: string;
        latency?: number;
        errorRate?: number;
        lastCheck: string;
        message?: string;
    }>(),
    lastHealthCheck: timestamp('last_health_check'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    createdBy: uuid('created_by'),
});

/**
 * Providers audit log
 * Tracks all changes to provider configurations
 */
export const providersAuditLog = pgTable('providers_audit_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    providerId: uuid('provider_id').notNull().references(() => providers.id),
    action: varchar('action', { length: 50 }).notNull().$type<
        'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'test' | 'failover'
    >(),
    changes: jsonb('changes').$type<{
        field: string;
        before: unknown;
        after: unknown;
    }[]>(),
    performedBy: uuid('performed_by'),
    performedAt: timestamp('performed_at').notNull().defaultNow(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
});

/**
 * Provider health history
 * Stores historical health metrics for monitoring and prediction
 */
export const providerHealthHistory = pgTable('provider_health_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    providerId: uuid('provider_id').notNull().references(() => providers.id),
    status: varchar('status', { length: 20 }).notNull(),
    latency: integer('latency'),
    errorRate: numeric('error_rate', { precision: 5, scale: 2 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    recordedAt: timestamp('recorded_at').notNull().defaultNow(),
});

// Type exports for use in application code
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;
export type ProviderAuditLog = typeof providersAuditLog.$inferSelect;
export type NewProviderAuditLog = typeof providersAuditLog.$inferInsert;
export type ProviderHealthHistory = typeof providerHealthHistory.$inferSelect;
export type NewProviderHealthHistory = typeof providerHealthHistory.$inferInsert;
