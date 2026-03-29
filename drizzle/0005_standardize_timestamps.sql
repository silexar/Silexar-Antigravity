-- ============================================================
-- Migration 0005: Standardize timestamps (CLAUDE.md compliance)
--
-- Adds created_at / updated_at columns to tables that only had
-- fecha_creacion / fecha_modificacion (domain-specific Spanish names).
-- Both sets of columns coexist:
--   - fecha_creacion/fecha_modificacion: business-level audit dates
--   - created_at/updated_at: standard system timestamps for generic queries
--
-- AUTHOR: Silexar Pulse — auto-generated 2026-03-24
-- ============================================================

-- contratos
ALTER TABLE contratos
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill from existing business dates
UPDATE contratos SET
  created_at = COALESCE(fecha_creacion, NOW()),
  updated_at = COALESCE(fecha_modificacion, fecha_creacion, NOW())
WHERE created_at = '1970-01-01' OR created_at IS NULL;

-- campanas
ALTER TABLE campanas
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE campanas SET
  created_at = COALESCE(fecha_creacion, NOW()),
  updated_at = COALESCE(fecha_modificacion, fecha_creacion, NOW())
WHERE created_at = '1970-01-01' OR created_at IS NULL;

-- anunciantes
ALTER TABLE anunciantes
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE anunciantes SET
  created_at = COALESCE(fecha_creacion, NOW()),
  updated_at = COALESCE(fecha_modificacion, fecha_creacion, NOW())
WHERE created_at = '1970-01-01' OR created_at IS NULL;

-- emisoras
ALTER TABLE emisoras
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE emisoras SET
  created_at = COALESCE(fecha_creacion, NOW()),
  updated_at = COALESCE(fecha_modificacion, fecha_creacion, NOW())
WHERE created_at = '1970-01-01' OR created_at IS NULL;

-- cunas
ALTER TABLE cunas
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE cunas SET
  created_at = COALESCE(fecha_subida, NOW()),
  updated_at = COALESCE(fecha_modificacion, fecha_subida, NOW())
WHERE created_at = '1970-01-01' OR created_at IS NULL;

-- facturas
ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE facturas SET
  created_at = COALESCE(fecha_creacion, NOW()),
  updated_at = COALESCE(fecha_modificacion, fecha_creacion, NOW())
WHERE created_at = '1970-01-01' OR created_at IS NULL;

-- ============================================================
-- Indexes for the new standard timestamp columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contratos_created_at  ON contratos(created_at);
CREATE INDEX IF NOT EXISTS idx_campanas_created_at   ON campanas(created_at);
CREATE INDEX IF NOT EXISTS idx_anunciantes_created_at ON anunciantes(created_at);
CREATE INDEX IF NOT EXISTS idx_emisoras_created_at   ON emisoras(created_at);
CREATE INDEX IF NOT EXISTS idx_cunas_created_at      ON cunas(created_at);
CREATE INDEX IF NOT EXISTS idx_facturas_created_at   ON facturas(created_at);
