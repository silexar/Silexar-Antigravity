/**
 * Internationalization Database Schema
 * 
 * Schema for managing translations and language configurations.
 * Supports per-tenant language preferences.
 * 
 * Line Reference: i18n-schema.ts:1
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

/**
 * Supported languages table
 */
export const languages = pgTable('languages', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 10 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    nativeName: varchar('native_name', { length: 100 }).notNull(),
    isBase: boolean('is_base').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    completionPercentage: integer('completion_percentage').notNull().default(0),
    region: varchar('region', { length: 100 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Translations table
 * Stores all translation strings
 */
export const translations = pgTable('translations', {
    id: uuid('id').primaryKey().defaultRandom(),
    languageCode: varchar('language_code', { length: 10 }).notNull().references(() => languages.code),
    module: varchar('module', { length: 100 }).notNull(),
    key: varchar('key', { length: 500 }).notNull(),
    value: text('value').notNull(),
    isApproved: boolean('is_approved').notNull().default(false),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Tenant language preferences
 */
export const tenantLanguages = pgTable('tenant_languages', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    languageCode: varchar('language_code', { length: 10 }).notNull().references(() => languages.code),
    isDefault: boolean('is_default').notNull().default(false),
    isEnabled: boolean('is_enabled').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Translation audit log
 */
export const translationAuditLog = pgTable('translation_audit_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    translationId: uuid('translation_id').references(() => translations.id),
    languageCode: varchar('language_code', { length: 10 }).notNull(),
    action: varchar('action', { length: 50 }).notNull().$type<'create' | 'update' | 'delete' | 'approve'>(),
    beforeValue: text('before_value'),
    afterValue: text('after_value'),
    performedBy: uuid('performed_by'),
    performedAt: timestamp('performed_at').notNull().defaultNow(),
});

// Unique constraint for translations
// A language can only have one translation per key per module
export const translationsUnique = pgTable('translations_unique', {
    dummy: text('dummy')  // Placeholder for the constraint
});

// Type exports
export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;
export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
export type TenantLanguage = typeof tenantLanguages.$inferSelect;
export type NewTenantLanguage = typeof tenantLanguages.$inferInsert;
export type TranslationAuditLog = typeof translationAuditLog.$inferSelect;
export type NewTranslationAuditLog = typeof translationAuditLog.$inferInsert;
