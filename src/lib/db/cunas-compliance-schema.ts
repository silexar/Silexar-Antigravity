import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { cunas } from './cunas-schema';

// ═══════════════════════════════════════════════════════════════
// REPORTES DE COMPLIANCE
// ═══════════════════════════════════════════════════════════════

export const complianceReports = pgTable('compliance_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Resultados detallados
  overallScore: varchar('overall_score', { length: 10 }).notNull(), // "95/100"
  riskLevel: varchar('risk_level', { length: 20 }).notNull(), // 'low' | 'medium' | 'high'
  
  // JSONs completos de cada módulo
  broadcastingResult: jsonb('broadcasting_result'), // CNTV
  conarResult: jsonb('conar_result'), // Ética
  sectorResult: jsonb('sector_result'), // Alcohol/Comida
  technicalResult: jsonb('technical_result'), // Audio
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  cunaIdx: index('compliance_reports_cuna_idx').on(table.cunaId),
  riskIdx: index('compliance_reports_risk_idx').on(table.riskLevel)
}));

// ═══════════════════════════════════════════════════════════════
// AUDITORÍA DE OVERRIDES (Forzar Aprobación)
// ═══════════════════════════════════════════════════════════════

export const approvalOverrides = pgTable('approval_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Quién autorizó
  supervisorId: uuid('supervisor_id').references(() => users.id).notNull(), 
  supervisorNombre: varchar('supervisor_nombre', { length: 255 }), // Snapshot por si borran el user
  
  // Razón
  motivo: text('motivo').notNull(),
  codigoAutorizacion: varchar('codigo_autorizacion', { length: 50 }), // El PIN usado (hash o ref)
  
  // Qué se ignoró (Snapshot de los errores al momento de forzar)
  erroresIgnorados: jsonb('errores_ignorados'),
  
  fechaOverride: timestamp('fecha_override').defaultNow().notNull()
}, (table) => ({
  cunaIdx: index('approval_overrides_cuna_idx').on(table.cunaId),
  supervisorIdx: index('approval_overrides_supervisor_idx').on(table.supervisorId)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const complianceReportsRelations = relations(complianceReports, ({ one }) => ({
  cuna: one(cunas, {
    fields: [complianceReports.cunaId],
    references: [cunas.id]
  })
}));

export const approvalOverridesRelations = relations(approvalOverrides, ({ one }) => ({
  cuna: one(cunas, {
    fields: [approvalOverrides.cunaId],
    references: [cunas.id]
  }),
  supervisor: one(users, {
    fields: [approvalOverrides.supervisorId],
    references: [users.id]
  })
}));
