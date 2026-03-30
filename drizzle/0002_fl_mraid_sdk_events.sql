-- ═══════════════════════════════════════════════════════════════
-- SILEXAR PULSE - MIGRACIÓN: MÓDULOS FL, MRAID, SDK, EVENTOS
-- Esquema de base de datos para nuevos módulos implementados
-- 
-- Versión: 2.0.0
-- Fecha: 2025-12-15
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: APRENDIZAJE FEDERADO (FL)
-- ═══════════════════════════════════════════════════════════════

-- Tabla de modelos globales de Aprendizaje Federado
CREATE TABLE IF NOT EXISTS "fl_global_models" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "version" varchar(20) NOT NULL UNIQUE,
    "weights_url" text NOT NULL,
    "weights_checksum" varchar(64) NOT NULL,
    "weights_size_bytes" bigint NOT NULL,
    "contributing_clients" integer DEFAULT 0,
    "total_samples" bigint DEFAULT 0,
    "validation_loss" numeric(10, 6),
    "validation_accuracy" numeric(5, 4),
    "aggregation_strategy" varchar(20) NOT NULL DEFAULT 'weighted_fedavg',
    "platform_distribution" jsonb DEFAULT '{"ios": 0, "android": 0}'::jsonb,
    "context_distribution" jsonb DEFAULT '{}'::jsonb,
    "status" varchar(20) NOT NULL DEFAULT 'active',
    "previous_version" varchar(20),
    "aggregation_time_ms" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "activated_at" timestamp,
    "deprecated_at" timestamp,
    "metadata" jsonb DEFAULT '{}'::jsonb
);

-- Índices para modelos FL
CREATE INDEX IF NOT EXISTS "fl_models_status_idx" ON "fl_global_models" USING btree ("status");
CREATE INDEX IF NOT EXISTS "fl_models_version_idx" ON "fl_global_models" USING btree ("version");
CREATE INDEX IF NOT EXISTS "fl_models_created_idx" ON "fl_global_models" USING btree ("created_at" DESC);

-- Tabla de rondas de agregación FL
CREATE TABLE IF NOT EXISTS "fl_aggregation_rounds" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "round_id" varchar(100) NOT NULL UNIQUE,
    "target_model_version" varchar(20) NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'collecting',
    "updates_received" integer DEFAULT 0,
    "min_updates_required" integer DEFAULT 100,
    "started_at" timestamp DEFAULT now() NOT NULL,
    "ended_at" timestamp,
    "result_model_version" varchar(20),
    "result_metrics" jsonb DEFAULT '{}'::jsonb,
    "error_message" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Índices para rondas
CREATE INDEX IF NOT EXISTS "fl_rounds_status_idx" ON "fl_aggregation_rounds" USING btree ("status");
CREATE INDEX IF NOT EXISTS "fl_rounds_started_idx" ON "fl_aggregation_rounds" USING btree ("started_at" DESC);

-- Tabla de actualizaciones de clientes FL
CREATE TABLE IF NOT EXISTS "fl_client_updates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "round_id" uuid NOT NULL REFERENCES "fl_aggregation_rounds"("id") ON DELETE CASCADE,
    "sdk_id" varchar(100) NOT NULL,
    "device_hash" varchar(64) NOT NULL,
    "platform" varchar(10) NOT NULL,
    "model_version" varchar(20) NOT NULL,
    "gradients_checksum" varchar(64) NOT NULL,
    "num_samples" integer NOT NULL,
    "local_epochs" integer NOT NULL,
    "avg_loss" numeric(10, 6) NOT NULL,
    "primary_context" varchar(50),
    "session_duration_minutes" integer,
    "received_at" timestamp DEFAULT now() NOT NULL,
    "processed" boolean DEFAULT false,
    "processed_at" timestamp,
    CONSTRAINT "fl_updates_round_device_unique" UNIQUE("round_id", "device_hash")
);

-- Índices para actualizaciones
CREATE INDEX IF NOT EXISTS "fl_updates_round_idx" ON "fl_client_updates" USING btree ("round_id");
CREATE INDEX IF NOT EXISTS "fl_updates_platform_idx" ON "fl_client_updates" USING btree ("platform");
CREATE INDEX IF NOT EXISTS "fl_updates_context_idx" ON "fl_client_updates" USING btree ("primary_context");
CREATE INDEX IF NOT EXISTS "fl_updates_received_idx" ON "fl_client_updates" USING btree ("received_at" DESC);

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: SDK MÓVIL
-- ═══════════════════════════════════════════════════════════════

-- Tabla de configuraciones de SDK
CREATE TABLE IF NOT EXISTS "sdk_configurations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "api_key" varchar(100) NOT NULL UNIQUE,
    "api_key_hash" varchar(64) NOT NULL,
    "platform" varchar(10) NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'active',
    "model_version" varchar(20) NOT NULL DEFAULT '1.0.0',
    "feature_flags" jsonb DEFAULT '{
        "federated_learning_enabled": true,
        "context_detection_enabled": true,
        "narrative_ads_enabled": true,
        "mraid_utilities_enabled": true
    }'::jsonb,
    "rate_limits" jsonb DEFAULT '{
        "max_requests_per_minute": 60,
        "max_events_per_second": 10
    }'::jsonb,
    "last_used_at" timestamp,
    "last_used_ip" varchar(50),
    "usage_count" bigint DEFAULT 0,
    "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "revoked_at" timestamp,
    "revoked_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Índices para SDK
CREATE INDEX IF NOT EXISTS "sdk_configs_tenant_idx" ON "sdk_configurations" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "sdk_configs_status_idx" ON "sdk_configurations" USING btree ("status");
CREATE INDEX IF NOT EXISTS "sdk_configs_platform_idx" ON "sdk_configurations" USING btree ("platform");
CREATE INDEX IF NOT EXISTS "sdk_configs_api_key_hash_idx" ON "sdk_configurations" USING btree ("api_key_hash");

-- Tabla de instalaciones de SDK
CREATE TABLE IF NOT EXISTS "sdk_installations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "sdk_config_id" uuid NOT NULL REFERENCES "sdk_configurations"("id") ON DELETE CASCADE,
    "sdk_id" varchar(100) NOT NULL UNIQUE,
    "device_hash" varchar(64) NOT NULL,
    "platform" varchar(10) NOT NULL,
    "os_version" varchar(20),
    "app_version" varchar(20),
    "sdk_version" varchar(20),
    "first_seen_at" timestamp DEFAULT now() NOT NULL,
    "last_active_at" timestamp DEFAULT now() NOT NULL,
    "total_sessions" integer DEFAULT 1,
    "total_events" integer DEFAULT 0,
    "consent_given" boolean DEFAULT false,
    "consent_updated_at" timestamp,
    "metadata" jsonb DEFAULT '{}'::jsonb
);

-- Índices para instalaciones
CREATE INDEX IF NOT EXISTS "sdk_installs_config_idx" ON "sdk_installations" USING btree ("sdk_config_id");
CREATE INDEX IF NOT EXISTS "sdk_installs_platform_idx" ON "sdk_installations" USING btree ("platform");
CREATE INDEX IF NOT EXISTS "sdk_installs_active_idx" ON "sdk_installations" USING btree ("last_active_at" DESC);

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: MRAID MICRO-APLICACIONES
-- ═══════════════════════════════════════════════════════════════

-- Tabla de configuraciones de micro-apps MRAID
CREATE TABLE IF NOT EXISTS "mraid_utilities" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "name" varchar(255) NOT NULL,
    "template_type" varchar(50) NOT NULL,
    "brand_name" varchar(255) NOT NULL,
    "brand_logo_url" text,
    "click_through_url" text,
    "sponsor_text" varchar(255),
    "billing_event_type" varchar(50) NOT NULL,
    "billing_event_identifier" varchar(100) NOT NULL,
    "functionality_config" jsonb DEFAULT '{}'::jsonb,
    "appearance_config" jsonb DEFAULT '{
        "primary_color": "#3b82f6",
        "secondary_color": "#1e40af",
        "background_color": "#f3f4f6",
        "text_color": "#1f2937",
        "font_family": "Inter",
        "border_radius": 12
    }'::jsonb,
    "tracking_pixels" jsonb DEFAULT '[]'::jsonb,
    "generated_html" text,
    "generated_checksum" varchar(64),
    "status" varchar(20) NOT NULL DEFAULT 'draft',
    "version" integer DEFAULT 1,
    "impressions" bigint DEFAULT 0,
    "interactions" bigint DEFAULT 0,
    "conversions" bigint DEFAULT 0,
    "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "published_at" timestamp
);

-- Índices para MRAID
CREATE INDEX IF NOT EXISTS "mraid_tenant_idx" ON "mraid_utilities" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "mraid_template_idx" ON "mraid_utilities" USING btree ("template_type");
CREATE INDEX IF NOT EXISTS "mraid_status_idx" ON "mraid_utilities" USING btree ("status");
CREATE INDEX IF NOT EXISTS "mraid_billing_event_idx" ON "mraid_utilities" USING btree ("billing_event_identifier");

-- Tabla de eventos de micro-apps MRAID
CREATE TABLE IF NOT EXISTS "mraid_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "mraid_utility_id" uuid NOT NULL REFERENCES "mraid_utilities"("id") ON DELETE CASCADE,
    "sdk_installation_id" uuid REFERENCES "sdk_installations"("id") ON DELETE SET NULL,
    "event_type" varchar(50) NOT NULL,
    "event_identifier" varchar(100),
    "event_data" jsonb DEFAULT '{}'::jsonb,
    "user_context" varchar(50),
    "timestamp" timestamp DEFAULT now() NOT NULL,
    "processed" boolean DEFAULT false,
    "billed" boolean DEFAULT false,
    "billed_at" timestamp
);

-- Índices para eventos MRAID
CREATE INDEX IF NOT EXISTS "mraid_events_utility_idx" ON "mraid_events" USING btree ("mraid_utility_id");
CREATE INDEX IF NOT EXISTS "mraid_events_type_idx" ON "mraid_events" USING btree ("event_type");
CREATE INDEX IF NOT EXISTS "mraid_events_timestamp_idx" ON "mraid_events" USING btree ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "mraid_events_billed_idx" ON "mraid_events" USING btree ("billed") WHERE NOT "billed";

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: DETECCIÓN DE CONTEXTO
-- ═══════════════════════════════════════════════════════════════

-- Tabla de eventos de contexto
CREATE TABLE IF NOT EXISTS "context_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "sdk_installation_id" uuid NOT NULL REFERENCES "sdk_installations"("id") ON DELETE CASCADE,
    "context_type" varchar(50) NOT NULL,
    "confidence" numeric(4, 3) NOT NULL,
    "duration_seconds" integer,
    "activity_level" varchar(10),
    "time_of_day" varchar(20),
    "day_type" varchar(10),
    "network_type" varchar(20),
    "battery_level" integer,
    "is_charging" boolean,
    "timestamp" timestamp DEFAULT now() NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb
);

-- Índices para contexto
CREATE INDEX IF NOT EXISTS "context_events_install_idx" ON "context_events" USING btree ("sdk_installation_id");
CREATE INDEX IF NOT EXISTS "context_events_type_idx" ON "context_events" USING btree ("context_type");
CREATE INDEX IF NOT EXISTS "context_events_timestamp_idx" ON "context_events" USING btree ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "context_events_confidence_idx" ON "context_events" USING btree ("confidence") WHERE "confidence" > 0.7;

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: IA GENERATIVA
-- ═══════════════════════════════════════════════════════════════

-- Tabla de generaciones de IA
CREATE TABLE IF NOT EXISTS "ai_generations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "generation_type" varchar(20) NOT NULL, -- image, text, audio
    "model_used" varchar(100) NOT NULL,
    "prompt" text NOT NULL,
    "system_prompt" text,
    "parameters" jsonb DEFAULT '{}'::jsonb,
    "result_url" text,
    "result_content" text,
    "quality_score" numeric(4, 3),
    "effectiveness_prediction" numeric(4, 3),
    "tokens_used" integer DEFAULT 0,
    "cost_usd" numeric(10, 6) DEFAULT 0,
    "duration_ms" integer,
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "error_message" text,
    "approved" boolean,
    "approved_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "approved_at" timestamp,
    "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Índices para generaciones IA
CREATE INDEX IF NOT EXISTS "ai_gen_tenant_idx" ON "ai_generations" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "ai_gen_type_idx" ON "ai_generations" USING btree ("generation_type");
CREATE INDEX IF NOT EXISTS "ai_gen_status_idx" ON "ai_generations" USING btree ("status");
CREATE INDEX IF NOT EXISTS "ai_gen_created_idx" ON "ai_generations" USING btree ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "ai_gen_approved_idx" ON "ai_generations" USING btree ("approved") WHERE "approved" IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: BUS DE EVENTOS CORTEX-CONTEXT
-- ═══════════════════════════════════════════════════════════════

-- Tabla de eventos fallidos (dead letter queue)
CREATE TABLE IF NOT EXISTS "event_dead_letters" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "topic" varchar(100) NOT NULL,
    "event_type" varchar(100) NOT NULL,
    "payload" jsonb NOT NULL,
    "error_message" text NOT NULL,
    "error_stack" text,
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "last_retry_at" timestamp,
    "resolved" boolean DEFAULT false,
    "resolved_at" timestamp,
    "resolved_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Índices para dead letters
CREATE INDEX IF NOT EXISTS "dead_letters_topic_idx" ON "event_dead_letters" USING btree ("topic");
CREATE INDEX IF NOT EXISTS "dead_letters_resolved_idx" ON "event_dead_letters" USING btree ("resolved") WHERE NOT "resolved";
CREATE INDEX IF NOT EXISTS "dead_letters_created_idx" ON "event_dead_letters" USING btree ("created_at" DESC);

-- ═══════════════════════════════════════════════════════════════
-- MÓDULO: PROGRESO DE NARRATIVAS
-- ═══════════════════════════════════════════════════════════════

-- Tabla de progreso de usuarios en narrativas
CREATE TABLE IF NOT EXISTS "narrative_user_progress" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "sdk_installation_id" uuid REFERENCES "sdk_installations"("id") ON DELETE SET NULL,
    "user_session_id" varchar(100) NOT NULL,
    "narrative_id" varchar(100) NOT NULL,
    "campaign_id" uuid,
    "current_node_id" varchar(100) NOT NULL,
    "nodes_visited" jsonb DEFAULT '[]'::jsonb,
    "total_nodes_visited" integer DEFAULT 1,
    "total_time_spent_seconds" integer DEFAULT 0,
    "engagement_score" numeric(5, 2) DEFAULT 0,
    "is_completed" boolean DEFAULT false,
    "completion_node_id" varchar(100),
    "started_at" timestamp DEFAULT now() NOT NULL,
    "last_interaction_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT "narrative_progress_session_narrative_unique" UNIQUE("user_session_id", "narrative_id")
);

-- Índices para progreso
CREATE INDEX IF NOT EXISTS "narrative_progress_narrative_idx" ON "narrative_user_progress" USING btree ("narrative_id");
CREATE INDEX IF NOT EXISTS "narrative_progress_campaign_idx" ON "narrative_user_progress" USING btree ("campaign_id");
CREATE INDEX IF NOT EXISTS "narrative_progress_completed_idx" ON "narrative_user_progress" USING btree ("is_completed");
CREATE INDEX IF NOT EXISTS "narrative_progress_started_idx" ON "narrative_user_progress" USING btree ("started_at" DESC);

-- ═══════════════════════════════════════════════════════════════
-- COMENTARIOS Y DOCUMENTACIÓN
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE "fl_global_models" IS 'Modelos globales de Aprendizaje Federado agregados desde actualizaciones de clientes';
COMMENT ON TABLE "fl_aggregation_rounds" IS 'Rondas de agregación para el sistema de Aprendizaje Federado';
COMMENT ON TABLE "fl_client_updates" IS 'Actualizaciones de gradientes recibidas de los SDK móviles';
COMMENT ON TABLE "sdk_configurations" IS 'Configuraciones y API keys de SDK por tenant';
COMMENT ON TABLE "sdk_installations" IS 'Instalaciones de SDK registradas (anónimas por device_hash)';
COMMENT ON TABLE "mraid_utilities" IS 'Configuraciones de micro-aplicaciones MRAID para publicidad';
COMMENT ON TABLE "mraid_events" IS 'Eventos de interacción con micro-aplicaciones MRAID';
COMMENT ON TABLE "context_events" IS 'Eventos de detección de contexto del usuario';
COMMENT ON TABLE "ai_generations" IS 'Historial de generaciones de contenido con IA (imágenes, texto, audio)';
COMMENT ON TABLE "event_dead_letters" IS 'Eventos fallidos del bus de eventos Cortex-Context';
COMMENT ON TABLE "narrative_user_progress" IS 'Progreso de usuarios a través de narrativas publicitarias';
