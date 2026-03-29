-- Migration: 0006_cortex_motores
-- Creates the cortex_motores table for persisting Cortex AI engine state per tenant.
-- Run AFTER 0003_enable_rls_multi_tenant.sql to get RLS policies.

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE tipo_motor_cortex AS ENUM (
    'SUPREME', 'ORCHESTRATOR', 'PROPHET', 'PROPHET_V2', 'GUARDIAN',
    'RISK', 'VOICE', 'SENSE', 'AUDIENCE', 'CREATIVE', 'SENTIMENT',
    'COMPLIANCE', 'FLOW'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_motor_cortex AS ENUM (
    'INICIALIZANDO', 'ACTIVO', 'DEGRADADO', 'DETENIDO', 'ERROR'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cortex_motores (
  id                           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  tipo                         tipo_motor_cortex NOT NULL,
  nombre                       VARCHAR(255) NOT NULL,
  version                      VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  estado                       estado_motor_cortex NOT NULL DEFAULT 'INICIALIZANDO',

  -- Metrics as dedicated columns for fast alerting queries
  metrica_precision            REAL NOT NULL DEFAULT 0,
  metrica_latencia_ms          REAL NOT NULL DEFAULT 0,
  metrica_solicitudes_total    INTEGER NOT NULL DEFAULT 0,
  metrica_solicitudes_exitosas INTEGER NOT NULL DEFAULT 0,
  metrica_ultima_ejecucion     TIMESTAMPTZ,

  -- Engine-specific algorithm parameters
  configuracion                JSONB NOT NULL DEFAULT '{}',

  created_at                   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at                   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cortex_motores_tenant     ON cortex_motores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cortex_motores_tipo       ON cortex_motores(tipo);
CREATE INDEX IF NOT EXISTS idx_cortex_motores_estado     ON cortex_motores(estado);
-- Unique: one engine type per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_cortex_motores_tenant_tipo ON cortex_motores(tenant_id, tipo);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE cortex_motores ENABLE ROW LEVEL SECURITY;

-- Tenants see only their own engine records
CREATE POLICY IF NOT EXISTS cortex_motores_tenant_isolation
  ON cortex_motores
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Super admin bypass
CREATE POLICY IF NOT EXISTS cortex_motores_super_admin
  ON cortex_motores
  USING (current_setting('app.is_super_admin', true) = 'true');

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cortex_motores_updated_at ON cortex_motores;
CREATE TRIGGER cortex_motores_updated_at
  BEFORE UPDATE ON cortex_motores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
