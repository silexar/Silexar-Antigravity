-- Migration: 0010_i18n_system
-- Description: Internationalization system for multi-language support
-- Created: 2024
-- Line Reference: 0010_i18n_system.sql:1

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_base BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    region VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language_code VARCHAR(10) NOT NULL REFERENCES languages(code),
    module VARCHAR(100) NOT NULL,
    key VARCHAR(500) NOT NULL,
    value TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(language_code, module, key)
);

-- Tenant language preferences
CREATE TABLE IF NOT EXISTS tenant_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    language_code VARCHAR(10) NOT NULL REFERENCES languages(code),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Translation audit log
CREATE TABLE IF NOT EXISTS translation_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    translation_id UUID REFERENCES translations(id) ON DELETE SET NULL,
    language_code VARCHAR(10) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve')),
    before_value TEXT,
    after_value TEXT,
    performed_by UUID,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_languages_code ON languages(code);
CREATE INDEX idx_languages_is_active ON languages(is_active);
CREATE INDEX idx_translations_language_code ON translations(language_code);
CREATE INDEX idx_translations_module ON translations(module);
CREATE INDEX idx_translations_key ON translations(key);
CREATE INDEX idx_tenant_languages_tenant_id ON tenant_languages(tenant_id);
CREATE INDEX idx_translation_audit_language ON translation_audit_log(language_code);
CREATE INDEX idx_translation_audit_performed_at ON translation_audit_log(performed_at);

-- Row Level Security
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "languages_all_super_admin" ON languages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

CREATE POLICY "translations_all_super_admin" ON translations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

CREATE POLICY "tenant_languages_all_authenticated" ON tenant_languages
    FOR ALL TO authenticated
    USING (tenant_id = auth.uid() OR 
           EXISTS (
               SELECT 1 FROM auth.users 
               WHERE id = auth.uid() 
               AND raw_user_meta_data->>'role' = 'super_admin'
           )
    );

CREATE POLICY "translation_audit_all_super_admin" ON translation_audit_log
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Insert base languages
INSERT INTO languages (code, name, native_name, is_base, completion_percentage, region) VALUES
    ('es-CL', 'Español Chile', 'Español (Chile)', true, 100, 'Chile'),
    ('es-AR', 'Español Argentina', 'Español (Argentina)', false, 95, 'Argentina'),
    ('en', 'English', 'English', false, 95, NULL),
    ('pt-BR', 'Português Brasil', 'Português (Brasil)', false, 78, 'Brasil'),
    ('es-MX', 'Español México', 'Español (México)', false, 65, 'México');

-- Insert base translations (common module)
INSERT INTO translations (language_code, module, key, value, is_approved) VALUES
    -- Common - Spanish Chile (base)
    ('es-CL', 'common', 'welcome', 'Bienvenido', true),
    ('es-CL', 'common', 'logout', 'Cerrar sesión', true),
    ('es-CL', 'common', 'save', 'Guardar', true),
    ('es-CL', 'common', 'cancel', 'Cancelar', true),
    ('es-CL', 'common', 'delete', 'Eliminar', true),
    ('es-CL', 'common', 'edit', 'Editar', true),
    ('es-CL', 'common', 'search', 'Buscar', true),
    ('es-CL', 'common', 'loading', 'Cargando...', true),
    ('es-CL', 'common', 'error', 'Error', true),
    ('es-CL', 'common', 'success', 'Éxito', true),
    ('es-CL', 'common', 'warning', 'Advertencia', true),
    ('es-CL', 'common', 'info', 'Información', true),
    -- Common - Spanish Argentina
    ('es-AR', 'common', 'welcome', 'Bienvenido', true),
    ('es-AR', 'common', 'logout', 'Cerrar sesión', true),
    ('es-AR', 'common', 'save', 'Guardar', true),
    ('es-AR', 'common', 'cancel', 'Cancelar', true),
    ('es-AR', 'common', 'delete', 'Eliminar', true),
    -- Common - English
    ('en', 'common', 'welcome', 'Welcome', true),
    ('en', 'common', 'logout', 'Logout', true),
    ('en', 'common', 'save', 'Save', true),
    ('en', 'common', 'cancel', 'Cancel', true),
    ('en', 'common', 'delete', 'Delete', true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_languages_updated_at
    BEFORE UPDATE ON languages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
    BEFORE UPDATE ON translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON languages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON languages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON languages TO authenticated;

GRANT SELECT ON translations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON translations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON translations TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_languages TO authenticated;

GRANT SELECT ON translation_audit_log TO authenticated;
GRANT SELECT, INSERT ON translation_audit_log TO authenticated;
