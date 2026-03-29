/**
 * 🗄️ SILEXAR PULSE - User Management Schema
 * Schema de base de datos para los 3 niveles de usuario
 * 
 * @description Database Schema for:
 * - Super Admin (Silexar)
 * - Admin Cliente (Tenant Admin)
 * - Usuario Final (Operator)
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended', 'pending'])
export const userCategoryEnum = pgEnum('user_category', [
  'super_admin', 'vendedor', 'ejecutivo', 'trafico', 'operacional', 
  'marketing', 'soporte', 'analista', 'developer'
])
export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'trial', 'suspended', 'cancelled'])
export const tenantPlanEnum = pgEnum('tenant_plan', ['starter', 'professional', 'enterprise', 'custom'])
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed'])
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'critical'])
export const themeEnum = pgEnum('theme', ['dark', 'light', 'system'])
export const languageEnum = pgEnum('language', ['es', 'en', 'pt'])

// ═══════════════════════════════════════════════════════════════
// TENANTS (Clientes/Empresas)
// ═══════════════════════════════════════════════════════════════

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  logo: text('logo'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#FF6B00'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#1E293B'),
  plan: tenantPlanEnum('plan').default('starter').notNull(),
  status: tenantStatusEnum('status').default('trial').notNull(),
  maxUsers: integer('max_users').default(5).notNull(),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  settings: jsonb('settings').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  slugIdx: uniqueIndex('idx_tenants_slug').on(table.slug),
  statusIdx: index('idx_tenants_status').on(table.status),
  planIdx: index('idx_tenants_plan').on(table.plan),
  createdAtIdx: index('idx_tenants_created_at').on(table.createdAt),
}))

// ═══════════════════════════════════════════════════════════════
// USERS (Todos los usuarios del sistema)
// ═══════════════════════════════════════════════════════════════

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  avatar: text('avatar'),
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  category: userCategoryEnum('category').default('vendedor').notNull(),
  status: userStatusEnum('status').default('pending').notNull(),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  isTenantAdmin: boolean('is_tenant_admin').default(false).notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  backupCodes: jsonb('backup_codes').default('[]'),
  requirePasswordChange: boolean('require_password_change').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: varchar('last_login_ip', { length: 50 }),
  loginAttempts: integer('login_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until'),
  createdById: uuid('created_by_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  tenantIdIdx: index('idx_users_tenant_id').on(table.tenantId),
  emailIdx: uniqueIndex('idx_users_email').on(table.email),
  statusIdx: index('idx_users_status').on(table.status),
  categoryIdx: index('idx_users_category').on(table.category),
  tenantStatusIdx: index('idx_users_tenant_status').on(table.tenantId, table.status),
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
}))

// ═══════════════════════════════════════════════════════════════
// USER PREFERENCES
// ═══════════════════════════════════════════════════════════════

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  theme: themeEnum('theme').default('dark').notNull(),
  language: languageEnum('language').default('es').notNull(),
  timezone: varchar('timezone', { length: 100 }).default('America/Santiago').notNull(),
  dateFormat: varchar('date_format', { length: 20 }).default('DD/MM/YYYY').notNull(),
  notifyEmail: boolean('notify_email').default(true).notNull(),
  notifyPush: boolean('notify_push').default(true).notNull(),
  notifyInApp: boolean('notify_in_app').default(true).notNull(),
  dashboardWidgets: jsonb('dashboard_widgets').default('[]'),
  favorites: jsonb('favorites').default('[]'),
  shortcuts: jsonb('shortcuts').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// ═══════════════════════════════════════════════════════════════
// PERMISSIONS
// ═══════════════════════════════════════════════════════════════

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  isSuperOnly: boolean('is_super_only').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// ═══════════════════════════════════════════════════════════════
// USER PERMISSIONS (Many-to-Many)
// ═══════════════════════════════════════════════════════════════

export const userPermissions = pgTable('user_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  grantedById: uuid('granted_by_id').references(() => users.id, { onDelete: 'set null' }),
  grantedAt: timestamp('granted_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_user_permissions_user_id').on(table.userId),
  permissionIdIdx: index('idx_user_permissions_permission_id').on(table.permissionId),
  userPermissionIdx: index('idx_user_permissions_user_permission').on(table.userId, table.permissionId),
}))

// ═══════════════════════════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════════════════════════

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  device: varchar('device', { length: 255 }),
  browser: varchar('browser', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  location: varchar('location', { length: 255 }),
  isCurrent: boolean('is_current').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
  isCurrentIdx: index('idx_sessions_is_current').on(table.userId, table.isCurrent),
}))

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOGS (Auditoría)
// ═══════════════════════════════════════════════════════════════

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details').default('{}'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  result: varchar('result', { length: 20 }).default('success').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_activity_logs_user_id').on(table.userId),
  tenantIdIdx: index('idx_activity_logs_tenant_id').on(table.tenantId),
  actionIdx: index('idx_activity_logs_action').on(table.action),
  resourceIdx: index('idx_activity_logs_resource').on(table.resource),
  createdAtIdx: index('idx_activity_logs_created_at').on(table.createdAt),
  tenantCreatedAtIdx: index('idx_activity_logs_tenant_created_at').on(table.tenantId, table.createdAt),
}))

// ═══════════════════════════════════════════════════════════════
// TICKETS (Soporte)
// ═══════════════════════════════════════════════════════════════

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  priority: ticketPriorityEnum('priority').default('medium').notNull(),
  isAutoGenerated: boolean('is_auto_generated').default(false).notNull(),
  errorCode: varchar('error_code', { length: 100 }),
  errorStack: text('error_stack'),
  systemInfo: jsonb('system_info').default('{}'),
  chatEnabled: boolean('chat_enabled').default(false).notNull(),
  agentConnected: boolean('agent_connected').default(false).notNull(),
  slaDeadline: timestamp('sla_deadline'),
  resolvedAt: timestamp('resolved_at'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  tenantIdIdx: index('idx_tickets_tenant_id').on(table.tenantId),
  statusIdx: index('idx_tickets_status').on(table.status),
  priorityIdx: index('idx_tickets_priority').on(table.priority),
  tenantStatusIdx: index('idx_tickets_tenant_status').on(table.tenantId, table.status),
  assignedToIdIdx: index('idx_tickets_assigned_to_id').on(table.assignedToId),
  createdAtIdx: index('idx_tickets_created_at').on(table.createdAt),
}))

// ═══════════════════════════════════════════════════════════════
// TICKET MESSAGES
// ═══════════════════════════════════════════════════════════════

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }),
  senderType: varchar('sender_type', { length: 20 }).default('user').notNull(), // user, agent, ai, system
  content: text('content').notNull(),
  attachments: jsonb('attachments').default('[]'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  ticketIdIdx: index('idx_ticket_messages_ticket_id').on(table.ticketId),
  createdAtIdx: index('idx_ticket_messages_created_at').on(table.createdAt),
}))

// ═══════════════════════════════════════════════════════════════
// MANUAL TASKS
// ═══════════════════════════════════════════════════════════════

export const manualTasks = pgTable('manual_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  assignedById: uuid('assigned_by_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  checklist: jsonb('checklist').default('[]'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  tenantIdIdx: index('idx_manual_tasks_tenant_id').on(table.tenantId),
  assignedToIdIdx: index('idx_manual_tasks_assigned_to_id').on(table.assignedToId),
  statusIdx: index('idx_manual_tasks_status').on(table.status),
  dueDateIdx: index('idx_manual_tasks_due_date').on(table.dueDate),
}))

// ═══════════════════════════════════════════════════════════════
// INVITATIONS
// ═══════════════════════════════════════════════════════════════

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  category: userCategoryEnum('category').default('vendedor').notNull(),
  permissions: jsonb('permissions').default('[]'),
  invitedById: uuid('invited_by_id').references(() => users.id, { onDelete: 'set null' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  tenantIdIdx: index('idx_invitations_tenant_id').on(table.tenantId),
  emailIdx: index('idx_invitations_email').on(table.email),
  statusIdx: index('idx_invitations_status').on(table.status),
  expiresAtIdx: index('idx_invitations_expires_at').on(table.expiresAt),
}))

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION SETTINGS
// ═══════════════════════════════════════════════════════════════

export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  notificationType: varchar('notification_type', { length: 100 }).notNull(),
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  pushEnabled: boolean('push_enabled').default(true).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_notification_settings_user_id').on(table.userId),
  userTypeIdx: index('idx_notification_settings_user_type').on(table.userId, table.notificationType),
}))

// ═══════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  tickets: many(tickets),
  tasks: many(manualTasks),
  invitations: many(invitations),
  activityLogs: many(activityLogs)
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  preferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
  permissions: many(userPermissions),
  sessions: many(sessions),
  activityLogs: many(activityLogs),
  tickets: many(tickets),
  tasks: many(manualTasks),
  notificationSettings: many(notificationSettings)
}))

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  tenant: one(tenants, { fields: [tickets.tenantId], references: [tenants.id] }),
  createdBy: one(users, { fields: [tickets.createdById], references: [users.id] }),
  assignedTo: one(users, { fields: [tickets.assignedToId], references: [users.id] }),
  messages: many(ticketMessages)
}))

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
  sender: one(users, { fields: [ticketMessages.senderId], references: [users.id] })
}))

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Permission = typeof permissions.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Ticket = typeof tickets.$inferSelect
export type TicketMessage = typeof ticketMessages.$inferSelect
export type ManualTask = typeof manualTasks.$inferSelect
export type ActivityLog = typeof activityLogs.$inferSelect
export type Invitation = typeof invitations.$inferSelect
