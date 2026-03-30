-- ============================================================================
-- Silexar Pulse — RLS Extension: Remaining Tenant-Scoped Tables
-- Migration: 0002_rls_remaining_tables.sql
-- ============================================================================
-- Extends RLS coverage to all tables that carry a tenant_id column but were
-- not covered by 0001_enable_rls_multi_tenant.sql.
--
-- Pattern used (same as 0001):
--   USING   — read/update/delete: row must belong to current tenant
--   WITH CHECK — insert/update: row must be written to current tenant
--   Super-admin bypass via app.is_super_admin = 'true'
--
-- Safe to run multiple times: IF NOT EXISTS guards prevent duplicate policies.
-- ============================================================================

-- ─── Helper: idempotent policy creation ─────────────────────────────────────
-- We use DO $$ blocks so re-running this migration is safe.

-- ─── Cunas (spots/jingles) ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cunas' AND policyname = 'tenant_isolation_cunas'
  ) THEN
    ALTER TABLE cunas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_cunas ON cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Cunas Digital ───────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cunas_gemelas' AND policyname = 'tenant_isolation_cunas_gemelas'
  ) THEN
    ALTER TABLE IF EXISTS cunas_gemelas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_cunas_gemelas ON cunas_gemelas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cunas_inbox' AND policyname = 'tenant_isolation_cunas_inbox'
  ) THEN
    ALTER TABLE IF EXISTS cunas_inbox ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_cunas_inbox ON cunas_inbox
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cunas_vencimientos' AND policyname = 'tenant_isolation_cunas_vencimientos'
  ) THEN
    ALTER TABLE IF EXISTS cunas_vencimientos ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_cunas_vencimientos ON cunas_vencimientos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'alertas_cuna' AND policyname = 'tenant_isolation_alertas_cuna'
  ) THEN
    ALTER TABLE IF EXISTS alertas_cuna ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_alertas_cuna ON alertas_cuna
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'programacion_cunas' AND policyname = 'tenant_isolation_programacion_cunas'
  ) THEN
    ALTER TABLE IF EXISTS programacion_cunas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_programacion_cunas ON programacion_cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rotacion_cunas' AND policyname = 'tenant_isolation_rotacion_cunas'
  ) THEN
    ALTER TABLE IF EXISTS rotacion_cunas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_rotacion_cunas ON rotacion_cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reproducciones_cuna' AND policyname = 'tenant_isolation_reproducciones_cuna'
  ) THEN
    ALTER TABLE IF EXISTS reproducciones_cuna ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_reproducciones_cuna ON reproducciones_cuna
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Registro de Emisiones ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'registro_emisiones' AND policyname = 'tenant_isolation_registro_emisiones'
  ) THEN
    ALTER TABLE IF EXISTS registro_emisiones ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_registro_emisiones ON registro_emisiones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Campanas extended tables ────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campanas_cunas' AND policyname = 'tenant_isolation_campanas_cunas'
  ) THEN
    ALTER TABLE IF EXISTS campanas_cunas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_campanas_cunas ON campanas_cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campanas_emisoras' AND policyname = 'tenant_isolation_campanas_emisoras'
  ) THEN
    ALTER TABLE IF EXISTS campanas_emisoras ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_campanas_emisoras ON campanas_emisoras
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pauta_campana' AND policyname = 'tenant_isolation_pauta_campana'
  ) THEN
    ALTER TABLE IF EXISTS pauta_campana ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_pauta_campana ON pauta_campana
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'templates_campana' AND policyname = 'tenant_isolation_templates_campana'
  ) THEN
    ALTER TABLE IF EXISTS templates_campana ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_templates_campana ON templates_campana
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'creativos_campana' AND policyname = 'tenant_isolation_creativos_campana'
  ) THEN
    ALTER TABLE IF EXISTS creativos_campana ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_creativos_campana ON creativos_campana
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Contratos extended ──────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contratos_aprobaciones' AND policyname = 'tenant_isolation_contratos_aprobaciones'
  ) THEN
    ALTER TABLE IF EXISTS contratos_aprobaciones ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_contratos_aprobaciones ON contratos_aprobaciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contratos_historial_cambios' AND policyname = 'tenant_isolation_contratos_historial_cambios'
  ) THEN
    ALTER TABLE IF EXISTS contratos_historial_cambios ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_contratos_historial_cambios ON contratos_historial_cambios
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contratos_evidencias' AND policyname = 'tenant_isolation_contratos_evidencias'
  ) THEN
    ALTER TABLE IF EXISTS contratos_evidencias ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_contratos_evidencias ON contratos_evidencias
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Facturación / Billing ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'facturas_detalle' AND policyname = 'tenant_isolation_facturas_detalle'
  ) THEN
    ALTER TABLE IF EXISTS facturas_detalle ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_facturas_detalle ON facturas_detalle
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'folios_dte' AND policyname = 'tenant_isolation_folios_dte'
  ) THEN
    ALTER TABLE IF EXISTS folios_dte ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_folios_dte ON folios_dte
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pagos' AND policyname = 'tenant_isolation_pagos'
  ) THEN
    ALTER TABLE IF EXISTS pagos ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_pagos ON pagos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cierres' AND policyname = 'tenant_isolation_cierres'
  ) THEN
    ALTER TABLE IF EXISTS cierres ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_cierres ON cierres
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'periodos_cierre' AND policyname = 'tenant_isolation_periodos_cierre'
  ) THEN
    ALTER TABLE IF EXISTS periodos_cierre ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_periodos_cierre ON periodos_cierre
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'historial_cierre' AND policyname = 'tenant_isolation_historial_cierre'
  ) THEN
    ALTER TABLE IF EXISTS historial_cierre ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_historial_cierre ON historial_cierre
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── CRM / Ventas ────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'actividades_crm' AND policyname = 'tenant_isolation_actividades_crm'
  ) THEN
    ALTER TABLE IF EXISTS actividades_crm ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_actividades_crm ON actividades_crm
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'tenant_isolation_deals'
  ) THEN
    ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_deals ON deals
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deal_actividades' AND policyname = 'tenant_isolation_deal_actividades'
  ) THEN
    ALTER TABLE IF EXISTS deal_actividades ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_deal_actividades ON deal_actividades
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cotizaciones' AND policyname = 'tenant_isolation_cotizaciones'
  ) THEN
    ALTER TABLE IF EXISTS cotizaciones ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_cotizaciones ON cotizaciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'historial_cotizacion' AND policyname = 'tenant_isolation_historial_cotizacion'
  ) THEN
    ALTER TABLE IF EXISTS historial_cotizacion ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_historial_cotizacion ON historial_cotizacion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'metas_ventas' AND policyname = 'tenant_isolation_metas_ventas'
  ) THEN
    ALTER TABLE IF EXISTS metas_ventas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_metas_ventas ON metas_ventas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'metas_vendedor' AND policyname = 'tenant_isolation_metas_vendedor'
  ) THEN
    ALTER TABLE IF EXISTS metas_vendedor ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_metas_vendedor ON metas_vendedor
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'historial_comisiones' AND policyname = 'tenant_isolation_historial_comisiones'
  ) THEN
    ALTER TABLE IF EXISTS historial_comisiones ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_historial_comisiones ON historial_comisiones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'asignacion_clientes' AND policyname = 'tenant_isolation_asignacion_clientes'
  ) THEN
    ALTER TABLE IF EXISTS asignacion_clientes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_asignacion_clientes ON asignacion_clientes
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Agencias / Inventario ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agencias_medios' AND policyname = 'tenant_isolation_agencias_medios'
  ) THEN
    ALTER TABLE IF EXISTS agencias_medios ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_agencias_medios ON agencias_medios
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contactos_agencia' AND policyname = 'tenant_isolation_contactos_agencia'
  ) THEN
    ALTER TABLE IF EXISTS contactos_agencia ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_contactos_agencia ON contactos_agencia
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventario_cupos' AND policyname = 'tenant_isolation_inventario_cupos'
  ) THEN
    ALTER TABLE IF EXISTS inventario_cupos ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_inventario_cupos ON inventario_cupos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bloques_comerciales' AND policyname = 'tenant_isolation_bloques_comerciales'
  ) THEN
    ALTER TABLE IF EXISTS bloques_comerciales ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_bloques_comerciales ON bloques_comerciales
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bloques_programacion' AND policyname = 'tenant_isolation_bloques_programacion'
  ) THEN
    ALTER TABLE IF EXISTS bloques_programacion ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_bloques_programacion ON bloques_programacion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tarifario' AND policyname = 'tenant_isolation_tarifario'
  ) THEN
    ALTER TABLE IF EXISTS tarifario ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_tarifario ON tarifario
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Materiales / Archivos ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'archivos_adjuntos' AND policyname = 'tenant_isolation_archivos_adjuntos'
  ) THEN
    ALTER TABLE IF EXISTS archivos_adjuntos ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_archivos_adjuntos ON archivos_adjuntos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'material_pendiente' AND policyname = 'tenant_isolation_material_pendiente'
  ) THEN
    ALTER TABLE IF EXISTS material_pendiente ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_material_pendiente ON material_pendiente
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activos_digitales' AND policyname = 'tenant_isolation_activos_digitales'
  ) THEN
    ALTER TABLE IF EXISTS activos_digitales ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_activos_digitales ON activos_digitales
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Tickets / Soporte ───────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'tenant_isolation_tickets'
  ) THEN
    ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_tickets ON tickets
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_messages' AND policyname = 'tenant_isolation_ticket_messages'
  ) THEN
    ALTER TABLE IF EXISTS ticket_messages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_ticket_messages ON ticket_messages
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Presentaciones / Propuestas extended ────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'presentaciones' AND policyname = 'tenant_isolation_presentaciones'
  ) THEN
    ALTER TABLE IF EXISTS presentaciones ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_presentaciones ON presentaciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Emisoras extended ───────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'programas_emisora' AND policyname = 'tenant_isolation_programas_emisora'
  ) THEN
    ALTER TABLE IF EXISTS programas_emisora ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_programas_emisora ON programas_emisora
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'asignaciones_turno' AND policyname = 'tenant_isolation_asignaciones_turno'
  ) THEN
    ALTER TABLE IF EXISTS asignaciones_turno ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_asignaciones_turno ON asignaciones_turno
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── User Preferences / Notifications ────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'tenant_isolation_user_preferences'
  ) THEN
    ALTER TABLE IF EXISTS user_preferences ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_user_preferences ON user_preferences
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_settings' AND policyname = 'tenant_isolation_notification_settings'
  ) THEN
    ALTER TABLE IF EXISTS notification_settings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_notification_settings ON notification_settings
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Ensure future tables automatically inherit policy grants ─────────────────
-- (Already set in 0001 via ALTER DEFAULT PRIVILEGES)
-- This comment serves as a reminder: new tables MUST be added to this file
-- or a new migration file with their RLS policy.

-- ============================================================================
-- VERIFICATION QUERY (run after migration to confirm RLS is active):
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- All tenant-scoped tables should show rowsecurity = true.
-- ============================================================================
