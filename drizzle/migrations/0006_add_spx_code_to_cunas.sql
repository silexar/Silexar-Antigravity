-- Migration: Agregar spx_code a cunas
-- Created: 2026-04-17

ALTER TABLE "cunas"
  ADD COLUMN IF NOT EXISTS "spx_code" varchar(20) UNIQUE;

CREATE INDEX IF NOT EXISTS "cunas_spx_code_idx" ON "cunas" ("spx_code");
