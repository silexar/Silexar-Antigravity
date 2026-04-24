-- Migration: Registro de Emisión - Registros de Aire, Clips y Auditoría de Accesos
-- Created: 2026-04-15

-- ═══════════════════════════════════════════════════════════════
-- TABLE: registros_aire
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "registros_aire" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "emisora_id" uuid NOT NULL REFERENCES "emisoras"("id"),
  "fecha_emision" date NOT NULL,
  "url_archivo" varchar(500) NOT NULL,
  "duracion_segundos" integer NOT NULL,
  "formato" varchar(10) NOT NULL,
  "tamanio_bytes" integer,
  "hash_sha256" varchar(64),
  "metadata" jsonb DEFAULT '{}',
  "estado" "estado_registro_aire" DEFAULT 'pendiente' NOT NULL,
  "error_mensaje" text,
  "procesado_por_id" uuid REFERENCES "users"("id"),
  "fecha_procesamiento" timestamp,
  "creado_por_id" uuid REFERENCES "users"("id"),
  "fecha_creacion" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "aire_tenant_idx" ON "registros_aire" ("tenant_id");
CREATE INDEX IF NOT EXISTS "aire_emisora_idx" ON "registros_aire" ("emisora_id");
CREATE INDEX IF NOT EXISTS "aire_fecha_idx" ON "registros_aire" ("fecha_emision");
CREATE INDEX IF NOT EXISTS "aire_estado_idx" ON "registros_aire" ("estado");

-- ═══════════════════════════════════════════════════════════════
-- ALTER: verificaciones_emision (link to air recordings)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "verificaciones_emision"
  ADD COLUMN IF NOT EXISTS "registros_aire_ids" jsonb DEFAULT '[]';

-- ═══════════════════════════════════════════════════════════════
-- TABLE: clips_evidencia
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "clips_evidencia" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "verificacion_id" uuid NOT NULL REFERENCES "verificaciones_emision"("id") ON DELETE CASCADE,
  "deteccion_id" uuid REFERENCES "registro_deteccion"("id"),
  "url_archivo" varchar(500) NOT NULL,
  "duracion_segundos" integer NOT NULL,
  "formato" varchar(10) NOT NULL,
  "hora_inicio_clip" time NOT NULL,
  "hora_fin_clip" time NOT NULL,
  "hash_sha256" varchar(64) NOT NULL,
  "transcripcion" text,
  "aprobado" boolean DEFAULT false NOT NULL,
  "aprobado_por_id" uuid REFERENCES "users"("id"),
  "fecha_aprobacion" timestamp,
  "fecha_expiracion" timestamp NOT NULL,
  "creado_por_id" uuid REFERENCES "users"("id"),
  "fecha_creacion" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "clips_tenant_idx" ON "clips_evidencia" ("tenant_id");
CREATE INDEX IF NOT EXISTS "clips_verif_idx" ON "clips_evidencia" ("verificacion_id");
CREATE INDEX IF NOT EXISTS "clips_expiracion_idx" ON "clips_evidencia" ("fecha_expiracion");
CREATE INDEX IF NOT EXISTS "clips_hash_idx" ON "clips_evidencia" ("hash_sha256");

-- ═══════════════════════════════════════════════════════════════
-- TABLE: accesos_link_temporal
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "accesos_link_temporal" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "link_temporal_id" uuid NOT NULL REFERENCES "links_temporales"("id") ON DELETE CASCADE,
  "ip_address" varchar(50),
  "user_agent" varchar(500),
  "accion" varchar(20) NOT NULL,
  "fecha_acceso" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "accesos_tenant_idx" ON "accesos_link_temporal" ("tenant_id");
CREATE INDEX IF NOT EXISTS "accesos_link_idx" ON "accesos_link_temporal" ("link_temporal_id");
CREATE INDEX IF NOT EXISTS "accesos_fecha_idx" ON "accesos_link_temporal" ("fecha_acceso");

-- ═══════════════════════════════════════════════════════════════
-- ALTER: links_temporales (secure delivery enhancements)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "links_temporales"
  ADD COLUMN IF NOT EXISTS "clip_evidencia_id" uuid REFERENCES "clips_evidencia"("id");

ALTER TABLE "links_temporales"
  ADD COLUMN IF NOT EXISTS "usos_permitidos" integer DEFAULT 0;

ALTER TABLE "links_temporales"
  ADD COLUMN IF NOT EXISTS "usos_realizados" integer DEFAULT 0;
