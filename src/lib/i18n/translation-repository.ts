/**
 * Translation Repository
 * 
 * Repository for managing translations in the database.
 * 
 * Line Reference: translation-repository.ts:1
 */

import { db } from '@/lib/db';
import { languages, translations, tenantLanguages, translationAuditLog, type Language, type Translation, type TenantLanguage } from '@/lib/db/i18n-schema';
import { eq, and, like } from 'drizzle-orm';

export interface TranslationFilter {
    languageCode?: string;
    module?: string;
    key?: string;
    isApproved?: boolean;
}

export interface CreateTranslationInput {
    languageCode: string;
    module: string;
    key: string;
    value: string;
}

export interface UpdateTranslationInput {
    value?: string;
    isApproved?: boolean;
}

/**
 * TranslationRepository handles all translation operations
 */
export class TranslationRepository {
    /**
     * Get all languages
     */
    async getLanguages(): Promise<Language[]> {
        return db.select().from(languages).where(eq(languages.isActive, true));
    }

    /**
     * Get language by code
     */
    async getLanguageByCode(code: string): Promise<Language | null> {
        const results = await db.select().from(languages).where(eq(languages.code, code)).limit(1);
        return results[0] || null;
    }

    /**
     * Get translations with optional filters
     */
    async getTranslations(filter?: TranslationFilter): Promise<Translation[]> {
        const conditions = [];

        if (filter?.languageCode) {
            conditions.push(eq(translations.languageCode, filter.languageCode));
        }
        if (filter?.module) {
            conditions.push(eq(translations.module, filter.module));
        }
        if (filter?.key) {
            conditions.push(like(translations.key, `%${filter.key}%`));
        }
        if (filter?.isApproved !== undefined) {
            conditions.push(eq(translations.isApproved, filter.isApproved));
        }

        if (conditions.length > 0) {
            return db.select().from(translations).where(and(...conditions));
        }

        return db.select().from(translations);
    }

    /**
     * Get a single translation
     */
    async getTranslation(
        languageCode: string,
        module: string,
        key: string
    ): Promise<Translation | null> {
        const results = await db
            .select()
            .from(translations)
            .where(
                and(
                    eq(translations.languageCode, languageCode),
                    eq(translations.module, module),
                    eq(translations.key, key)
                )
            )
            .limit(1);
        return results[0] || null;
    }

    /**
     * Create a new translation
     */
    async createTranslation(input: CreateTranslationInput): Promise<Translation> {
        const result = await db
            .insert(translations)
            .values({
                languageCode: input.languageCode,
                module: input.module,
                key: input.key,
                value: input.value,
                isApproved: false,
            })
            .returning()
            .onConflictDoUpdate({
                target: [translations.languageCode, translations.module, translations.key],
                set: {
                    value: input.value,
                    updatedAt: new Date(),
                },
            });

        return result[0];
    }

    /**
     * Update a translation
     */
    async updateTranslation(
        id: string,
        input: UpdateTranslationInput,
        performedBy?: string
    ): Promise<Translation | null> {
        // Get current value for audit
        const current = await db
            .select()
            .from(translations)
            .where(eq(translations.id, id))
            .limit(1);

        if (!current[0]) {
            return null;
        }

        const result = await db
            .update(translations)
            .set({
                value: input.value ?? current[0].value,
                isApproved: input.isApproved ?? current[0].isApproved,
                approvedBy: input.isApproved ? performedBy : current[0].approvedBy,
                approvedAt: input.isApproved ? new Date() : current[0].approvedAt,
                updatedAt: new Date(),
            })
            .where(eq(translations.id, id))
            .returning();

        // Create audit log
        if (input.value !== undefined && input.value !== current[0].value) {
            await db.insert(translationAuditLog).values({
                translationId: id,
                languageCode: current[0].languageCode,
                action: 'update',
                beforeValue: current[0].value,
                afterValue: input.value,
                performedBy: performedBy as `uuid`,
            });
        }

        return result[0] || null;
    }

    /**
     * Delete a translation
     */
    async deleteTranslation(id: string): Promise<boolean> {
        const result = await db.delete(translations).where(eq(translations.id, id)).returning();
        return result.length > 0;
    }

    /**
     * Get tenant language preferences
     */
    async getTenantLanguages(tenantId: string): Promise<TenantLanguage[]> {
        return db
            .select()
            .from(tenantLanguages)
            .where(eq(tenantLanguages.tenantId, tenantId as `uuid`));
    }

    /**
     * Set tenant language preference
     */
    async setTenantLanguage(
        tenantId: string,
        languageCode: string,
        isDefault: boolean = false
    ): Promise<void> {
        if (isDefault) {
            // Remove default from other languages
            await db
                .update(tenantLanguages)
                .set({ isDefault: false })
                .where(eq(tenantLanguages.tenantId, tenantId as `uuid`));
        }

        await db
            .insert(tenantLanguages)
            .values({
                tenantId: tenantId as `uuid`,
                languageCode,
                isDefault,
                isEnabled: true,
            })
            .onConflictDoUpdate({
                target: [tenantLanguages.tenantId, tenantLanguages.languageCode],
                set: {
                    isDefault,
                    isEnabled: true,
                },
            });
    }

    /**
     * Get all modules with translations
     */
    async getModules(): Promise<string[]> {
        const results = await db
            .select({ module: translations.module })
            .from(translations)
            .groupBy(translations.module);

        return results.map(r => r.module);
    }

    /**
     * Bulk create translations
     */
    async bulkCreateTranslations(
        translationsList: CreateTranslationInput[]
    ): Promise<void> {
        for (const t of translationsList) {
            await this.createTranslation(t);
        }
    }

    /**
     * Get translation statistics for a language
     */
    async getLanguageStats(languageCode: string): Promise<{
        total: number;
        approved: number;
        pending: number;
        completionPercentage: number;
    }> {
        const all = await db
            .select()
            .from(translations)
            .where(eq(translations.languageCode, languageCode));

        const approved = all.filter(t => t.isApproved);
        const baseTotal = await db
            .select()
            .from(translations)
            .where(
                and(
                    eq(translations.languageCode, 'es-CL'),
                    eq(translations.isApproved, true)
                )
            );

        return {
            total: all.length,
            approved: approved.length,
            pending: all.length - approved.length,
            completionPercentage: baseTotal.length > 0
                ? Math.round((all.length / baseTotal.length) * 100)
                : 0,
        };
    }
}

// Singleton instance
let translationRepository: TranslationRepository | null = null;

export function getTranslationRepository(): TranslationRepository {
    if (!translationRepository) {
        translationRepository = new TranslationRepository();
    }
    return translationRepository;
}
