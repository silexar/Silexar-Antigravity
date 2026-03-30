-- ============================================================================
-- Silexar Pulse - Complete RLS Coverage (Migration 0002)
-- ============================================================================
-- Extends RLS to ALL remaining tenant-scoped tables not covered in 0001.
-- Uses the same current_tenant_id() function and super admin bypass.
-- ============================================================================

-- ─── Cunas (Spots) ──────────────────────────────────────────────────────────

ALTER TABLE cunas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cunas ON cunas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE cunas_programacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cunas_programacion ON cunas_programacion
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Cunas Extended ─────────────────────────────────────────────────────────

ALTER TABLE materiales_creativos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_materiales_creativos ON materiales_creativos
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE versiones_cuna ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_versiones_cuna ON versiones_cuna
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE rotaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_rotaciones ON rotaciones
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE separaciones_competencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_separaciones_competencia ON separaciones_competencia
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE grupos_distribucion ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_grupos_distribucion ON grupos_distribucion
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE reglas_competencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_reglas_competencia ON reglas_competencia
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE historial_operaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_historial_operaciones ON historial_operaciones
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Cunas Compliance ───────────────────────────────────────────────────────

ALTER TABLE cunas_verificacion_compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cunas_verificacion_compliance ON cunas_verificacion_compliance
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE cunas_licencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cunas_licencias ON cunas_licencias
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Emisión (Broadcasting) ─────────────────────────────────────────────────

ALTER TABLE tandas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tandas ON tandas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE registros_emision ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_registros_emision ON registros_emision
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE verificaciones_emision ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_verificaciones_emision ON verificaciones_emision
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE certificaciones_emision ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_certificaciones_emision ON certificaciones_emision
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE alertas_emision ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_alertas_emision ON alertas_emision
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE links_temporales ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_links_temporales ON links_temporales
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Campañas Sub-tables ────────────────────────────────────────────────────

ALTER TABLE lineas_campana ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lineas_campana ON lineas_campana
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE confirmaciones_campana ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_confirmaciones_campana ON confirmaciones_campana
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE distribuciones_campana ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_distribuciones_campana ON distribuciones_campana
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Agencias de Medios ─────────────────────────────────────────────────────

ALTER TABLE agencias_medios ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agencias_medios ON agencias_medios
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE contactos_agencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_contactos_agencia ON contactos_agencia
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Activos Digitales ──────────────────────────────────────────────────────

ALTER TABLE activos_digitales ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_activos_digitales ON activos_digitales
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Archivos Adjuntos ──────────────────────────────────────────────────────

ALTER TABLE archivos_adjuntos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_archivos_adjuntos ON archivos_adjuntos
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Cotizaciones ───────────────────────────────────────────────────────────

ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cotizaciones ON cotizaciones
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE items_cotizacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_items_cotizacion ON items_cotizacion
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── CRM (Actividades) ─────────────────────────────────────────────────────

ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_actividades ON actividades
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Vencimientos Sub-tables ────────────────────────────────────────────────

ALTER TABLE inventario_cupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventario_cupos ON inventario_cupos
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE notificaciones_vencimiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_notificaciones_vencimiento ON notificaciones_vencimiento
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE acciones_vencimiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_acciones_vencimiento ON acciones_vencimiento
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ─── Ventas Premium ─────────────────────────────────────────────────────────

ALTER TABLE ventas_premium ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ventas_premium ON ventas_premium
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE metas_vendedor ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_metas_vendedor ON metas_vendedor
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE comisiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_comisiones ON comisiones
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- ============================================================================
-- SUMMARY: 33 additional tables secured with RLS
-- Combined with 0001 (16 tables), total = 49 tables with tenant isolation
-- ============================================================================
