-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN 0007: Módulo Vencimientos — Entidades Complementarias
-- Tablas: vencimientos_auspicio, alertas_programador, solicitudes_extension,
--         listas_espera, tandas_comerciales, senales_especiales,
--         exclusividades_rubro, configuracion_tarifa, historial_ocupacion,
--         cupo_comercial
-- ═══════════════════════════════════════════════════════════════════

-- ── TABLA: vencimientos_auspicio ──
CREATE TABLE "vencimientos_auspicio" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "codigo" varchar(30) NOT NULL,
    "programa_id" uuid NOT NULL,
    "programa_nombre" varchar(255),
    "cliente_id" uuid NOT NULL,
    "cliente_nombre" varchar(255) NOT NULL,
    "contrato_id" uuid,
    "contrato_codigo" varchar(30),
    "tipo" varchar(50) DEFAULT 'auspicio_programa' NOT NULL,
    "fecha_inicio" date NOT NULL,
    "fecha_vencimientos" date NOT NULL,
    "nivel" varchar(20) DEFAULT 'verde' NOT NULL,
    "estado" varchar(20) DEFAULT 'ACTIVO' NOT NULL,
    "dias_restantes" integer DEFAULT 0,
    "horas_countdown" integer,
    "valor_contrato" numeric(14, 2),
    "monto_pagado" numeric(14, 2) DEFAULT '0.00',
    "monto_pendiente" numeric(14, 2) DEFAULT '0.00',
    "acciones_data" text,
    "notificacion_48h_enviada" boolean DEFAULT false,
    "notificacion_7dias_enviada" boolean DEFAULT false,
    "alerta_trafico_enviada" boolean DEFAULT false,
    "alerta_trafico_final_enviada" boolean DEFAULT false,
    "ejecutivo_id" uuid,
    "ejecutivo_nombre" varchar(255),
    "notas" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX "venc_auspicio_tenant_idx" ON "vencimientos_auspicio" USING btree ("tenant_id");
CREATE INDEX "venc_auspicio_programa_idx" ON "vencimientos_auspicio" USING btree ("programa_id");
CREATE INDEX "venc_auspicio_fecha_idx" ON "vencimientos_auspicio" USING btree ("fecha_vencimientos");
CREATE INDEX "venc_auspicio_estado_idx" ON "vencimientos_auspicio" USING btree ("estado");
CREATE INDEX "venc_auspicio_cliente_idx" ON "vencimientos_auspicio" USING btree ("cliente_id");
CREATE INDEX "venc_auspicio_ejecutivo_idx" ON "vencimientos_auspicio" USING btree ("ejecutivo_id");

ALTER TABLE "vencimientos_auspicio" ADD CONSTRAINT "venc_auspicio_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "vencimientos_auspicio" ADD CONSTRAINT "venc_auspicio_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;
ALTER TABLE "vencimientos_auspicio" ADD CONSTRAINT "venc_auspicio_contrato_fk"
    FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE SET NULL;
ALTER TABLE "vencimientos_auspicio" ADD CONSTRAINT "venc_auspicio_ejecutivo_fk"
    FOREIGN KEY ("ejecutivo_id") REFERENCES "users"("id") ON DELETE SET NULL;

-- ── TABLA: alertas_programador ──
CREATE TABLE "alertas_programador" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "emisora_id" uuid NOT NULL,
    "programa_id" uuid NOT NULL,
    "programa_nombre" varchar(255),
    "cupo_comercial_id" uuid NOT NULL,
    "cliente_nombre" varchar(255) NOT NULL,
    "tipo" varchar(50) NOT NULL,
    "titulo" varchar(255) NOT NULL,
    "mensaje" text NOT NULL,
    "prioridad" varchar(20) DEFAULT 'media' NOT NULL,
    "destinatario_id" uuid NOT NULL,
    "destinatario_nombre" varchar(255),
    "canales_notificacion" text,
    "estado_confirmacion" varchar(20) DEFAULT 'pendiente',
    "comentario_confirmacion" text,
    "leida" boolean DEFAULT false,
    "fecha_lectura" timestamp,
    "fecha_expiracion" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX "alertas_prog_tenant_idx" ON "alertas_programador" USING btree ("tenant_id");
CREATE INDEX "alertas_prog_dest_idx" ON "alertas_programador" USING btree ("destinatario_id");
CREATE INDEX "alertas_prog_estado_idx" ON "alertas_programador" USING btree ("estado_confirmacion");
CREATE INDEX "alertas_prog_prio_idx" ON "alertas_programador" USING btree ("prioridad");
CREATE INDEX "alertas_prog_tipo_idx" ON "alertas_programador" USING btree ("tipo");

ALTER TABLE "alertas_programador" ADD CONSTRAINT "alertas_prog_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "alertas_programador" ADD CONSTRAINT "alertas_prog_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;
ALTER TABLE "alertas_programador" ADD CONSTRAINT "alertas_prog_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;
ALTER TABLE "alertas_programador" ADD CONSTRAINT "alertas_prog_dest_fk"
    FOREIGN KEY ("destinatario_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- ── TABLA: solicitudes_extension ──
CREATE TABLE "solicitudes_extension" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "cupo_comercial_id" uuid NOT NULL,
    "programa_id" uuid NOT NULL,
    "emisora_id" uuid NOT NULL,
    "cliente_id" uuid NOT NULL,
    "cliente_nombre" varchar(255) NOT NULL,
    "ejecutivo_id" uuid NOT NULL,
    "ejecutivo_nombre" varchar(255),
    "fecha_inicio_original" date NOT NULL,
    "fecha_fin_original" date NOT NULL,
    "fecha_inicio_solicitada" date NOT NULL,
    "fecha_fin_solicitada" date NOT NULL,
    "motivo_solicitud" text NOT NULL,
    "nivel_aprobacion" varchar(50) DEFAULT 'automatico' NOT NULL,
    "aprobador_id" uuid,
    "aprobador_nombre" varchar(255),
    "extensiones_previas" integer DEFAULT 0,
    "estado" varchar(20) DEFAULT 'pendiente' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX "ext_tenant_idx" ON "solicitudes_extension" USING btree ("tenant_id");
CREATE INDEX "ext_cupo_idx" ON "solicitudes_extension" USING btree ("cupo_comercial_id");
CREATE INDEX "ext_programa_idx" ON "solicitudes_extension" USING btree ("programa_id");
CREATE INDEX "ext_estado_idx" ON "solicitudes_extension" USING btree ("estado");
CREATE INDEX "ext_cliente_idx" ON "solicitudes_extension" USING btree ("cliente_id");

ALTER TABLE "solicitudes_extension" ADD CONSTRAINT "ext_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "solicitudes_extension" ADD CONSTRAINT "ext_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;
ALTER TABLE "solicitudes_extension" ADD CONSTRAINT "ext_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;
ALTER TABLE "solicitudes_extension" ADD CONSTRAINT "ext_ejecutivo_fk"
    FOREIGN KEY ("ejecutivo_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "solicitudes_extension" ADD CONSTRAINT "ext_aprobador_fk"
    FOREIGN KEY ("aprobador_id") REFERENCES "users"("id") ON DELETE SET NULL;

-- ── TABLA: listas_espera ──
CREATE TABLE "listas_espera" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "programa_id" uuid NOT NULL,
    "programa_nombre" varchar(255),
    "emisora_id" uuid NOT NULL,
    "emisora_nombre" varchar(255),
    "clientes_data" text,
    "max_espera" integer DEFAULT 20 NOT NULL,
    "notificacion_automatica" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX "lista_espera_tenant_idx" ON "listas_espera" USING btree ("tenant_id");
CREATE INDEX "lista_espera_programa_idx" ON "listas_espera" USING btree ("programa_id");

ALTER TABLE "listas_espera" ADD CONSTRAINT "lista_espera_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "listas_espera" ADD CONSTRAINT "lista_espera_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;
ALTER TABLE "listas_espera" ADD CONSTRAINT "lista_espera_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;

-- ── TABLA: tandas_comerciales ──
CREATE TABLE "tandas_comerciales" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "emisora_id" uuid NOT NULL,
    "nombre" varchar(100) NOT NULL,
    "hora_inicio" time NOT NULL,
    "hora_fin" time NOT NULL,
    "factor_multiplicador" numeric(4, 2) DEFAULT '1.00',
    "audiencia_promedio" integer,
    "rating_promedio" numeric(4, 2),
    "tarifas_data" text,
    "activo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "tandas_tenant_idx" ON "tandas_comerciales" USING btree ("tenant_id");
CREATE INDEX "tandas_emisora_idx" ON "tandas_comerciales" USING btree ("emisora_id");
CREATE INDEX "tandas_nombre_idx" ON "tandas_comerciales" USING btree ("nombre");

ALTER TABLE "tandas_comerciales" ADD CONSTRAINT "tandas_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "tandas_comerciales" ADD CONSTRAINT "tandas_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;

-- ── TABLA: senales_especiales ──
CREATE TABLE "senales_especiales" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "emisora_id" uuid NOT NULL,
    "tipo" varchar(50) NOT NULL,
    "nombre" varchar(255) NOT NULL,
    "horarios" text,
    "duracion_segundos" integer,
    "formato" text,
    "precio_mensual" numeric(12, 2),
    "exclusividad" integer DEFAULT 1,
    "estado" varchar(20) DEFAULT 'disponible',
    "anunciante_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "senales_tenant_idx" ON "senales_especiales" USING btree ("tenant_id");
CREATE INDEX "senales_emisora_idx" ON "senales_especiales" USING btree ("emisora_id");
CREATE INDEX "senales_tipo_idx" ON "senales_especiales" USING btree ("tipo");

ALTER TABLE "senales_especiales" ADD CONSTRAINT "senales_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "senales_especiales" ADD CONSTRAINT "senales_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;
ALTER TABLE "senales_especiales" ADD CONSTRAINT "senales_anunciante_fk"
    FOREIGN KEY ("anunciante_id") REFERENCES "anunciantes"("id") ON DELETE SET NULL;

-- ── TABLA: exclusividades_rubro ──
CREATE TABLE "exclusividades_rubro" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "programa_id" uuid NOT NULL,
    "rubro" varchar(100) NOT NULL,
    "tipo_restriccion" varchar(50) DEFAULT 'unico' NOT NULL,
    "maximo_clientes" integer DEFAULT 1,
    "separacion_minima_minutos" integer DEFAULT 0,
    "activo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "excl_tenant_idx" ON "exclusividades_rubro" USING btree ("tenant_id");
CREATE INDEX "excl_programa_idx" ON "exclusividades_rubro" USING btree ("programa_id");
CREATE INDEX "excl_rubro_idx" ON "exclusividades_rubro" USING btree ("rubro");

ALTER TABLE "exclusividades_rubro" ADD CONSTRAINT "excl_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "exclusividades_rubro" ADD CONSTRAINT "excl_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;

-- ── TABLA: configuracion_tarifa ──
CREATE TABLE "configuracion_tarifa" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "programa_id" uuid NOT NULL,
    "tipo_auspicio" varchar(50) NOT NULL,
    "duracion_segundos" integer,
    "precio_base" numeric(12, 2) NOT NULL,
    "factor_temporada" numeric(4, 2) DEFAULT '1.00',
    "factor_rating" numeric(4, 2) DEFAULT '1.00',
    "factor_ocupacion" numeric(4, 2) DEFAULT '1.00',
    "descuento_cliente_nuevo" numeric(4, 2) DEFAULT '0.00',
    "descuento_renovacion" numeric(4, 2) DEFAULT '0.00',
    "vigencia_desde" date,
    "vigencia_hasta" date,
    "activo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "tarifa_tenant_idx" ON "configuracion_tarifa" USING btree ("tenant_id");
CREATE INDEX "tarifa_programa_idx" ON "configuracion_tarifa" USING btree ("programa_id");
CREATE INDEX "tarifa_tipo_idx" ON "configuracion_tarifa" USING btree ("tipo_auspicio");

ALTER TABLE "configuracion_tarifa" ADD CONSTRAINT "tarifa_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "configuracion_tarifa" ADD CONSTRAINT "tarifa_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;

-- ── TABLA: historial_ocupacion ──
CREATE TABLE "historial_ocupacion" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "emisora_id" uuid NOT NULL,
    "programa_id" uuid,
    "mes" integer NOT NULL,
    "anio" integer NOT NULL,
    "ocupacion_promedio" numeric(5, 2),
    "revenue_total" numeric(14, 2),
    "revenue_potencial" numeric(14, 2),
    "cupos_vendidos" integer,
    "cupos_disponibles" integer,
    "metricas_data" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "hist_tenant_idx" ON "historial_ocupacion" USING btree ("tenant_id");
CREATE INDEX "hist_emisora_idx" ON "historial_ocupacion" USING btree ("emisora_id");
CREATE INDEX "hist_periodo_idx" ON "historial_ocupacion" USING btree ("anio", "mes");

ALTER TABLE "historial_ocupacion" ADD CONSTRAINT "hist_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "historial_ocupacion" ADD CONSTRAINT "hist_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;
ALTER TABLE "historial_ocupacion" ADD CONSTRAINT "hist_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE SET NULL;

-- ── TABLA: cupo_comercial ──
CREATE TABLE "cupo_comercial" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "programa_id" uuid NOT NULL,
    "emisora_id" uuid NOT NULL,
    "cliente_id" uuid,
    "cliente_nombre" varchar(255),
    "ejecutivo_id" uuid,
    "ejecutivo_nombre" varchar(255),
    "tipo_auspicio" varchar(50) NOT NULL,
    "estado" varchar(20) DEFAULT 'disponible' NOT NULL,
    "fecha_inicio" date,
    "fecha_fin" date,
    "valor" numeric(14, 2),
    "historial_modificaciones" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX "cupo_tenant_idx" ON "cupo_comercial" USING btree ("tenant_id");
CREATE INDEX "cupo_programa_idx" ON "cupo_comercial" USING btree ("programa_id");
CREATE INDEX "cupo_emisora_idx" ON "cupo_comercial" USING btree ("emisora_id");
CREATE INDEX "cupo_estado_idx" ON "cupo_comercial" USING btree ("estado");
CREATE INDEX "cupo_cliente_idx" ON "cupo_comercial" USING btree ("cliente_id");

ALTER TABLE "cupo_comercial" ADD CONSTRAINT "cupo_tenant_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
ALTER TABLE "cupo_comercial" ADD CONSTRAINT "cupo_programa_fk"
    FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE;
ALTER TABLE "cupo_comercial" ADD CONSTRAINT "cupo_emisora_fk"
    FOREIGN KEY ("emisora_id") REFERENCES "emisoras"("id") ON DELETE CASCADE;
ALTER TABLE "cupo_comercial" ADD CONSTRAINT "cupo_cliente_fk"
    FOREIGN KEY ("cliente_id") REFERENCES "anunciantes"("id") ON DELETE SET NULL;
ALTER TABLE "cupo_comercial" ADD CONSTRAINT "cupo_ejecutivo_fk"
    FOREIGN KEY ("ejecutivo_id") REFERENCES "users"("id") ON DELETE SET NULL;
