-- Módulo 10: Facturación Inteligente - Tablas adicionales para modelos CPVI y CPCN

-- Tabla de contratos para facturación
CREATE TABLE "contracts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "organization_id" uuid NOT NULL,
    "tenant_id" uuid NOT NULL,
    "contract_number" varchar(50) NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "start_date" timestamp NOT NULL,
    "end_date" timestamp,
    "total_budget" numeric(15, 2),
    "currency" varchar(3) DEFAULT 'CLP',
    "status" varchar(50) DEFAULT 'draft',
    "billing_cycle" varchar(20) DEFAULT 'monthly',
    "payment_terms" varchar(100),
    "created_by" uuid,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "deleted_at" timestamp,
    CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number")
);

-- Índices para contratos
CREATE INDEX "contracts_organization_id_idx" ON "contracts" USING btree ("organization_id");
CREATE INDEX "contracts_tenant_id_idx" ON "contracts" USING btree ("tenant_id");
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");
CREATE INDEX "contracts_start_date_idx" ON "contracts" USING btree ("start_date");
CREATE INDEX "contracts_end_date_idx" ON "contracts" USING btree ("end_date");

-- Tabla de líneas de contrato (items de facturación)
CREATE TABLE "contract_line_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "contract_id" uuid NOT NULL,
    "line_number" integer NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "billing_model" varchar(10) NOT NULL, -- CPM, CPC, CPVI, CPCN
    "billing_event_identifier" varchar(100),
    "narrative_completion_node" varchar(100),
    "rate" numeric(12, 6) NOT NULL,
    "currency" varchar(3) DEFAULT 'CLP',
    "budget_limit" numeric(15, 2),
    "current_spend" numeric(15, 2) DEFAULT '0.00',
    "event_count" integer DEFAULT 0,
    "status" varchar(20) DEFAULT 'active',
    "start_date" timestamp,
    "end_date" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "contract_line_items_contract_line_unique" UNIQUE("contract_id", "line_number")
);

-- Índices para líneas de contrato
CREATE INDEX "contract_line_items_contract_id_idx" ON "contract_line_items" USING btree ("contract_id");
CREATE INDEX "contract_line_items_billing_model_idx" ON "contract_line_items" USING btree ("billing_model");
CREATE INDEX "contract_line_items_status_idx" ON "contract_line_items" USING btree ("status");
CREATE INDEX "contract_line_items_start_date_idx" ON "contract_line_items" USING btree ("start_date");

-- Tabla de contadores de facturación
CREATE TABLE "billing_counters" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "contract_line_item_id" uuid NOT NULL,
    "counter_type" varchar(50) NOT NULL, -- impressions, clicks, interactions, completions
    "counter_value" bigint DEFAULT 0,
    "reset_date" timestamp,
    "last_updated" timestamp DEFAULT now(),
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "billing_counters_line_type_unique" UNIQUE("contract_line_item_id", "counter_type")
);

-- Índices para contadores
CREATE INDEX "billing_counters_line_item_idx" ON "billing_counters" USING btree ("contract_line_item_id");
CREATE INDEX "billing_counters_type_idx" ON "billing_counters" USING btree ("counter_type");

-- Tabla de eventos de facturación
CREATE TABLE "billing_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "contract_line_item_id" uuid NOT NULL,
    "event_type" varchar(50) NOT NULL,
    "event_identifier" varchar(100),
    "user_id" uuid,
    "campaign_id" uuid,
    "creative_id" varchar(100),
    "timestamp" timestamp DEFAULT now(),
    "value" numeric(12, 6) DEFAULT '0.000000',
    "currency" varchar(3) DEFAULT 'CLP',
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "processed" boolean DEFAULT false,
    "processed_at" timestamp,
    "billing_status" varchar(20) DEFAULT 'pending',
    "created_at" timestamp DEFAULT now()
);

-- Índices para eventos de facturación
CREATE INDEX "billing_events_line_item_idx" ON "billing_events" USING btree ("contract_line_item_id");
CREATE INDEX "billing_events_event_type_idx" ON "billing_events" USING btree ("event_type");
CREATE INDEX "billing_events_timestamp_idx" ON "billing_events" USING btree ("timestamp");
CREATE INDEX "billing_events_user_idx" ON "billing_events" USING btree ("user_id");
CREATE INDEX "billing_events_campaign_idx" ON "billing_events" USING btree ("campaign_id");
CREATE INDEX "billing_events_processed_idx" ON "billing_events" USING btree ("processed");

-- Tabla de nodos de narrativa para CPCN
CREATE TABLE "narrative_nodes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "narrative_id" varchar(100) NOT NULL,
    "node_id" varchar(100) NOT NULL,
    "node_type" varchar(50) NOT NULL, -- start, content, decision, completion
    "title" varchar(255),
    "content" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "narrative_nodes_narrative_node_unique" UNIQUE("narrative_id", "node_id")
);

-- Índices para nodos de narrativa
CREATE INDEX "narrative_nodes_narrative_idx" ON "narrative_nodes" USING btree ("narrative_id");
CREATE INDEX "narrative_nodes_type_idx" ON "narrative_nodes" USING btree ("node_type");

-- Tabla de reglas de finalización de narrativa
CREATE TABLE "narrative_completion_rules" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "narrative_id" varchar(100) NOT NULL,
    "completion_node_id" varchar(100) NOT NULL,
    "min_nodes_visited" integer DEFAULT 1,
    "min_time_spent" integer DEFAULT 0, -- en segundos
    "required_interactions" jsonb DEFAULT '[]'::jsonb,
    "value_calculation" varchar(20) DEFAULT 'fixed', -- fixed, progressive, quality_based
    "base_value" numeric(10, 2) DEFAULT '0.00',
    "quality_multipliers" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "narrative_rules_narrative_completion_unique" UNIQUE("narrative_id", "completion_node_id")
);

-- Índices para reglas de narrativa
CREATE INDEX "narrative_rules_narrative_idx" ON "narrative_completion_rules" USING btree ("narrative_id");

-- Tabla de interacciones valiosas para CPVI
CREATE TABLE "value_interactions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "event_identifier" varchar(100) NOT NULL UNIQUE,
    "category" varchar(50) NOT NULL, -- utility, engagement, conversion, completion
    "base_value" numeric(10, 2) NOT NULL,
    "quality_multipliers" jsonb DEFAULT '{}'::jsonb,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Índices para interacciones valiosas
CREATE INDEX "value_interactions_category_idx" ON "value_interactions" USING btree ("category");
CREATE INDEX "value_interactions_active_idx" ON "value_interactions" USING btree ("is_active");

-- Tabla de alertas de presupuesto
CREATE TABLE "budget_alerts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "contract_line_item_id" uuid NOT NULL,
    "alert_type" varchar(20) NOT NULL, -- info, warning, critical
    "threshold_percentage" numeric(5, 2) NOT NULL,
    "current_spend" numeric(15, 2) NOT NULL,
    "budget_limit" numeric(15, 2),
    "message" text,
    "is_sent" boolean DEFAULT false,
    "sent_at" timestamp,
    "created_at" timestamp DEFAULT now()
);

-- Índices para alertas
CREATE INDEX "budget_alerts_line_item_idx" ON "budget_alerts" USING btree ("contract_line_item_id");
CREATE INDEX "budget_alerts_type_idx" ON "budget_alerts" USING btree ("alert_type");
CREATE INDEX "budget_alerts_sent_idx" ON "budget_alerts" USING btree ("is_sent");

-- Tabla de métricas diarias para dashboards (materializada)
CREATE TABLE "daily_billing_metrics" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "date" date NOT NULL,
    "organization_id" uuid,
    "contract_id" uuid,
    "billing_model" varchar(10),
    "total_events" bigint DEFAULT 0,
    "total_value" numeric(15, 2) DEFAULT '0.00',
    "total_spend" numeric(15, 2) DEFAULT '0.00',
    "avg_value_per_event" numeric(12, 6) DEFAULT '0.000000',
    "conversion_rate" numeric(5, 4) DEFAULT '0.0000',
    "quality_score" numeric(5, 4) DEFAULT '0.0000',
    "roi_estimate" numeric(5, 4) DEFAULT '0.0000',
    "cost_efficiency" numeric(8, 6) DEFAULT '0.000000',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "daily_metrics_date_org_contract_model_unique" UNIQUE("date", "organization_id", "contract_id", "billing_model")
);

-- Índices para métricas diarias
CREATE INDEX "daily_metrics_date_idx" ON "daily_billing_metrics" USING btree ("date");
CREATE INDEX "daily_metrics_organization_idx" ON "daily_billing_metrics" USING btree ("organization_id");
CREATE INDEX "daily_metrics_contract_idx" ON "daily_billing_metrics" USING btree ("contract_id");
CREATE INDEX "daily_metrics_billing_model_idx" ON "daily_billing_metrics" USING btree ("billing_model");

-- Claves foráneas
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organization_fk" 
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;

ALTER TABLE "contract_line_items" ADD CONSTRAINT "contract_line_items_contract_fk" 
    FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE;

ALTER TABLE "billing_counters" ADD CONSTRAINT "billing_counters_line_item_fk" 
    FOREIGN KEY ("contract_line_item_id") REFERENCES "contract_line_items"("id") ON DELETE CASCADE;

ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_line_item_fk" 
    FOREIGN KEY ("contract_line_item_id") REFERENCES "contract_line_items"("id") ON DELETE CASCADE;

ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_campaign_fk" 
    FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL;

ALTER TABLE "budget_alerts" ADD CONSTRAINT "budget_alerts_line_item_fk" 
    FOREIGN KEY ("contract_line_item_id") REFERENCES "contract_line_items"("id") ON DELETE CASCADE;

-- Datos iniciales para interacciones valiosas
INSERT INTO "value_interactions" ("name", "description", "event_identifier", "category", "base_value", "quality_multipliers") VALUES
    ('Cálculo de Préstamo Completado', 'Usuario completó cálculo en calculadora de préstamos', 'loan_calculated', 'utility', 5.00, '{"time_spent": 1.2, "completion_rate": 1.5, "user_satisfaction": 1.3}'),
    ('Cotización Solicitada', 'Usuario solicitó cotización después de usar utilidad', 'quote_requested', 'conversion', 15.00, '{"time_spent": 1.1, "completion_rate": 2.0, "user_satisfaction": 1.8}'),
    ('Checklist Completado', 'Usuario completó checklist de viaje', 'checklist_completed', 'engagement', 3.00, '{"time_spent": 1.3, "completion_rate": 1.4, "user_satisfaction": 1.2}'),
    ('Juego Completado', 'Usuario completó mini-juego de memoria', 'game_completed', 'engagement', 4.00, '{"time_spent": 1.4, "completion_rate": 1.6, "user_satisfaction": 1.5}'),
    ('Narrativa Completada', 'Usuario completó journey narrativo completo', 'narrative_journey_completed', 'completion', 12.00, '{"time_spent": 1.5, "completion_rate": 2.2, "user_satisfaction": 2.0}');

-- Datos iniciales para reglas de narrativa
INSERT INTO "narrative_completion_rules" ("narrative_id", "completion_node_id", "min_nodes_visited", "min_time_spent", "required_interactions", "value_calculation", "base_value") VALUES
    ('travel_journey_2025', 'final_booking_node', 5, 180, '["destination_selected", "dates_chosen", "hotel_viewed"]', 'progressive', 25.00),
    ('insurance_wizard_2025', 'policy_purchased_node', 8, 300, '["risk_assessment", "coverage_selected", "quote_generated"]', 'quality_based', 35.00),
    ('investment_guide_2025', 'portfolio_created_node', 6, 240, '["risk_profile", "investment_goals", "strategy_selected"]', 'fixed', 20.00);