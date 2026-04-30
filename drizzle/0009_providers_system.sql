-- Migration: 0009_providers_system
-- Description: Providers configuration system for configurable services
-- Created: 2024
-- Line Reference: 0009_providers_system.sql:1

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Providers configuration table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('speech', 'database', 'storage', 'email', 'sms', 'tts', 'cache')),
    provider_class VARCHAR(100) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'degraded', 'unavailable')),
    health_status JSONB,
    last_health_check TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID
);

-- Providers audit log
CREATE TABLE IF NOT EXISTS providers_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'activate', 'deactivate', 'test', 'failover')),
    changes JSONB,
    performed_by UUID,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Provider health history
CREATE TABLE IF NOT EXISTS provider_health_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    latency INTEGER,
    error_rate NUMERIC(5, 2),
    metadata JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_providers_service_type ON providers(service_type);
CREATE INDEX idx_providers_is_primary ON providers(is_primary);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_audit_provider_id ON providers_audit_log(provider_id);
CREATE INDEX idx_providers_audit_performed_at ON providers_audit_log(performed_at);
CREATE INDEX idx_provider_health_provider_id ON provider_health_history(provider_id);
CREATE INDEX idx_provider_health_recorded_at ON provider_health_history(recorded_at);

-- Row Level Security (RLS)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_health_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only super admin (CEO) can access providers
CREATE POLICY "providers_all_super_admin" ON providers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

CREATE POLICY "providers_audit_all_super_admin" ON providers_audit_log
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

CREATE POLICY "providers_health_all_super_admin" ON provider_health_history
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default providers for Silexar
INSERT INTO providers (name, service_type, provider_class, is_primary, config, status) VALUES
    ('Supabase PostgreSQL', 'database', 'supabase', true, 
     '{"supabaseUrl": "placeholder", "supabaseKey": "placeholder", "poolSize": 10}', 
     'active'),
    ('Google Cloud SQL (Standby)', 'database', 'google_cloud_sql', false, 
     '{"host": "placeholder", "port": 5432}', 
     'active'),
    ('Cloudflare R2', 'storage', 'cloudflare_r2', true, 
     '{"accountId": "placeholder", "bucketName": "silexar-media"}', 
     'active'),
    ('Redis Cache', 'cache', 'redis', true, 
     '{"host": "localhost", "port": 6379}', 
     'active'),
    ('OpenAI Whisper', 'speech', 'openai_whisper', true, 
     '{"apiKey": "placeholder", "model": "whisper-1"}', 
     'active'),
    ('Resend Email', 'email', 'resend', true, 
     '{"apiKey": "placeholder", "fromEmail": "noreply@silexar.com"}', 
     'active'),
    ('Twilio SMS', 'sms', 'twilio', true, 
     '{"accountSid": "placeholder", "fromNumber": "+1234567890"}', 
     'active');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON providers TO authenticated;
GRANT SELECT, INSERT ON providers_audit_log TO authenticated;
GRANT SELECT, INSERT ON provider_health_history TO authenticated;
