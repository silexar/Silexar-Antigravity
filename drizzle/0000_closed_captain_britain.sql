CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_category" varchar(50) NOT NULL,
	"user_id" uuid,
	"tenant_id" uuid,
	"organization_id" uuid,
	"session_id" varchar(255),
	"correlation_id" varchar(255),
	"request_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"resource" varchar(255),
	"action" varchar(100),
	"result" varchar(50),
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"risk_score" integer,
	"severity" varchar(20),
	"security_level" varchar(50),
	"consciousness_level" numeric(5, 3),
	"quantum_enhanced" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now(),
	"execution_time" numeric(10, 3),
	"retention_period" integer,
	"compliance_flags" jsonb DEFAULT '[]'::jsonb,
	"processed" boolean DEFAULT false,
	"processed_at" timestamp,
	"archived" boolean DEFAULT false,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"type" varchar(50) DEFAULT 'standard',
	"status" varchar(50) DEFAULT 'draft',
	"priority" varchar(20) DEFAULT 'medium',
	"budget" numeric(12, 2),
	"spent" numeric(12, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'USD',
	"start_date" timestamp,
	"end_date" timestamp,
	"timezone" varchar(50) DEFAULT 'UTC',
	"target_audience" jsonb,
	"content" jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"ai_optimized" boolean DEFAULT false,
	"consciousness_level" numeric(5, 3) DEFAULT '0.500',
	"quantum_enhanced" boolean DEFAULT false,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "cortex_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"campaign_id" uuid,
	"metric_type" varchar(100) NOT NULL,
	"metric_category" varchar(50) NOT NULL,
	"metric_name" varchar(255) NOT NULL,
	"value" jsonb NOT NULL,
	"numeric_value" numeric(15, 6),
	"unit" varchar(50),
	"context" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"source" varchar(100) DEFAULT 'cortex',
	"ai_analyzed" boolean DEFAULT false,
	"consciousness_score" numeric(5, 3),
	"quantum_enhanced" boolean DEFAULT false,
	"accuracy" numeric(5, 4),
	"confidence" numeric(5, 4),
	"reliability" numeric(5, 4),
	"timestamp" timestamp DEFAULT now(),
	"period_start" timestamp,
	"period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"website" varchar(255),
	"logo" text,
	"industry" varchar(100),
	"size" varchar(50),
	"subscription_tier" varchar(50) DEFAULT 'free',
	"subscription_status" varchar(50) DEFAULT 'active',
	"billing_email" varchar(255),
	"settings" jsonb DEFAULT '{}'::jsonb,
	"features" jsonb DEFAULT '[]'::jsonb,
	"limits" jsonb DEFAULT '{}'::jsonb,
	"consciousness_level" numeric(5, 3) DEFAULT '0.500',
	"quantum_enhanced" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"compliance_level" varchar(50) DEFAULT 'standard',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"device_id" varchar(255),
	"device_name" varchar(255),
	"device_type" varchar(50),
	"ip_address" varchar(45),
	"user_agent" text,
	"location" jsonb,
	"expires_at" timestamp NOT NULL,
	"last_accessed_at" timestamp DEFAULT now(),
	"consciousness_level" numeric(5, 3) DEFAULT '0.500',
	"quantum_secured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"revoked_at" timestamp,
	"revoked_by" uuid,
	"revocation_reason" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token"),
	CONSTRAINT "sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100),
	"password" varchar(255) NOT NULL,
	"password_salt" varchar(255),
	"password_history" jsonb DEFAULT '[]'::jsonb,
	"name" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"avatar" text,
	"bio" text,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"custom_permissions" jsonb DEFAULT '{}'::jsonb,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"is_suspended" boolean DEFAULT false,
	"suspension_reason" text,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"last_login" timestamp,
	"last_login_ip" varchar(45),
	"last_login_user_agent" text,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" varchar(255),
	"two_factor_backup_codes" jsonb,
	"webauthn_enabled" boolean DEFAULT false,
	"webauthn_credentials" jsonb DEFAULT '[]'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"theme" varchar(20) DEFAULT 'system',
	"language" varchar(10) DEFAULT 'en',
	"timezone" varchar(50) DEFAULT 'UTC',
	"consciousness_level" numeric(5, 3) DEFAULT '0.500',
	"quantum_enhanced" boolean DEFAULT false,
	"quantum_signature" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	"version" integer DEFAULT 1,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"deletion_reason" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_correlation_idx" ON "audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "audit_logs_risk_score_idx" ON "audit_logs" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "campaigns_user_id_idx" ON "campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaigns_tenant_id_idx" ON "campaigns" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_type_idx" ON "campaigns" USING btree ("type");--> statement-breakpoint
CREATE INDEX "campaigns_start_date_idx" ON "campaigns" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "campaigns_consciousness_idx" ON "campaigns" USING btree ("consciousness_level");--> statement-breakpoint
CREATE INDEX "cortex_metrics_user_id_idx" ON "cortex_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cortex_metrics_tenant_id_idx" ON "cortex_metrics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cortex_metrics_type_idx" ON "cortex_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "cortex_metrics_category_idx" ON "cortex_metrics" USING btree ("metric_category");--> statement-breakpoint
CREATE INDEX "cortex_metrics_timestamp_idx" ON "cortex_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "cortex_metrics_campaign_idx" ON "cortex_metrics" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "cortex_metrics_consciousness_idx" ON "cortex_metrics" USING btree ("consciousness_score");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "organizations_tier_idx" ON "organizations" USING btree ("subscription_tier");--> statement-breakpoint
CREATE INDEX "organizations_active_idx" ON "organizations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_refresh_token_idx" ON "sessions" USING btree ("refresh_token");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_device_idx" ON "sessions" USING btree ("device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_consciousness_idx" ON "users" USING btree ("consciousness_level");--> statement-breakpoint
CREATE INDEX "users_quantum_idx" ON "users" USING btree ("quantum_enhanced");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");