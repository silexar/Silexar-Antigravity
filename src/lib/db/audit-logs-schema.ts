/**
 * Drizzle Schema — audit_logs
 *
 * Append-only table. No UPDATE/DELETE via application code.
 * Retention: 7 years for financial events, 2 years for access logs.
 * NOT tenant-scoped (no RLS) — accessible by super-admin for cross-tenant review.
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, numeric } from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id:             uuid('id').defaultRandom().primaryKey(),
  eventId:        varchar('event_id', { length: 255 }).notNull(),
  eventType:      varchar('event_type', { length: 100 }).notNull(),
  eventCategory:  varchar('event_category', { length: 50 }).notNull().default('SYSTEM'),
  userId:         uuid('user_id'),
  tenantId:       uuid('tenant_id'),
  sessionId:      varchar('session_id', { length: 255 }),
  correlationId:  varchar('correlation_id', { length: 255 }),
  requestId:      varchar('request_id', { length: 255 }),
  ipAddress:      varchar('ip_address', { length: 45 }),
  userAgent:      text('user_agent'),
  resource:       varchar('resource', { length: 255 }),
  action:         varchar('action', { length: 100 }),
  result:         varchar('result', { length: 50 }).notNull().default('unknown'),
  eventData:      jsonb('event_data').default({}),
  metadata:       jsonb('metadata').default({}),
  riskScore:      integer('risk_score'),
  severity:       varchar('severity', { length: 20 }).notNull().default('LOW'),
  timestamp:      timestamp('timestamp').defaultNow(),
  retentionPeriod: integer('retention_period'),
  complianceFlags: jsonb('compliance_flags').default([]),
  processed:      boolean('processed').default(false),
  processedAt:    timestamp('processed_at'),
  archived:       boolean('archived').default(false),
})

export type AuditLogRow = typeof auditLogs.$inferSelect
export type NewAuditLog  = typeof auditLogs.$inferInsert
