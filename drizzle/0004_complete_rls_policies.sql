-- ============================================================================
-- Silexar Pulse — Complete RLS for All Tenant-Scoped Tables
-- ============================================================================
-- Extends 0003_enable_rls_multi_tenant.sql to cover all remaining tables.
-- Uses DO blocks so this migration is idempotent and safe to run even if
-- a table doesn't exist yet (forward-compatible with future schema migrations).
--
-- Pattern per table:
--   1. ENABLE ROW LEVEL SECURITY (idempotent in PostgreSQL)
--   2. DROP POLICY IF EXISTS (safe to drop before recreate)
--   3. CREATE POLICY with tenant isolation
-- ============================================================================

-- ─── Cunas (Spots de Radio) ──────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cunas') THEN
    ALTER TABLE cunas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cunas ON cunas;
    CREATE POLICY tenant_isolation_cunas ON cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reproducciones_cuna') THEN
    ALTER TABLE reproducciones_cuna ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_reproducciones_cuna ON reproducciones_cuna;
    CREATE POLICY tenant_isolation_reproducciones_cuna ON reproducciones_cuna
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Cunas Digitales ─────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='digital_assets') THEN
    ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_digital_assets ON digital_assets;
    CREATE POLICY tenant_isolation_digital_assets ON digital_assets
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ad_targeting_profiles') THEN
    ALTER TABLE ad_targeting_profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_ad_targeting_profiles ON ad_targeting_profiles;
    CREATE POLICY tenant_isolation_ad_targeting_profiles ON ad_targeting_profiles
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='digital_trackers') THEN
    ALTER TABLE digital_trackers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_digital_trackers ON digital_trackers;
    CREATE POLICY tenant_isolation_digital_trackers ON digital_trackers
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='brand_dna') THEN
    ALTER TABLE brand_dna ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_brand_dna ON brand_dna;
    CREATE POLICY tenant_isolation_brand_dna ON brand_dna
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='neuromorphic_profiles') THEN
    ALTER TABLE neuromorphic_profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_neuromorphic_profiles ON neuromorphic_profiles;
    CREATE POLICY tenant_isolation_neuromorphic_profiles ON neuromorphic_profiles
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cross_device_sequences') THEN
    ALTER TABLE cross_device_sequences ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cross_device_sequences ON cross_device_sequences;
    CREATE POLICY tenant_isolation_cross_device_sequences ON cross_device_sequences
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='performance_predictions') THEN
    ALTER TABLE performance_predictions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_performance_predictions ON performance_predictions;
    CREATE POLICY tenant_isolation_performance_predictions ON performance_predictions
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Cunas Extended (Menciones, Presentaciones, Cierres) ─────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='menciones') THEN
    ALTER TABLE menciones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_menciones ON menciones;
    CREATE POLICY tenant_isolation_menciones ON menciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='presentaciones') THEN
    ALTER TABLE presentaciones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_presentaciones ON presentaciones;
    CREATE POLICY tenant_isolation_presentaciones ON presentaciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cierres') THEN
    ALTER TABLE cierres ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cierres ON cierres;
    CREATE POLICY tenant_isolation_cierres ON cierres
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='promo_ida') THEN
    ALTER TABLE promo_ida ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_promo_ida ON promo_ida;
    CREATE POLICY tenant_isolation_promo_ida ON promo_ida
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='grupos_distribucion') THEN
    ALTER TABLE grupos_distribucion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_grupos_distribucion ON grupos_distribucion;
    CREATE POLICY tenant_isolation_grupos_distribucion ON grupos_distribucion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='envios_distribucion') THEN
    ALTER TABLE envios_distribucion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_envios_distribucion ON envios_distribucion;
    CREATE POLICY tenant_isolation_envios_distribucion ON envios_distribucion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='alertas_cuna') THEN
    ALTER TABLE alertas_cuna ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_alertas_cuna ON alertas_cuna;
    CREATE POLICY tenant_isolation_alertas_cuna ON alertas_cuna
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Cunas Programación ──────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='bloques_programacion') THEN
    ALTER TABLE bloques_programacion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_bloques_programacion ON bloques_programacion;
    CREATE POLICY tenant_isolation_bloques_programacion ON bloques_programacion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='programacion_cunas') THEN
    ALTER TABLE programacion_cunas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_programacion_cunas ON programacion_cunas;
    CREATE POLICY tenant_isolation_programacion_cunas ON programacion_cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='registro_emisiones') THEN
    ALTER TABLE registro_emisiones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_registro_emisiones ON registro_emisiones;
    CREATE POLICY tenant_isolation_registro_emisiones ON registro_emisiones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='material_pendiente') THEN
    ALTER TABLE material_pendiente ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_material_pendiente ON material_pendiente;
    CREATE POLICY tenant_isolation_material_pendiente ON material_pendiente
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cunas_inbox') THEN
    ALTER TABLE cunas_inbox ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cunas_inbox ON cunas_inbox;
    CREATE POLICY tenant_isolation_cunas_inbox ON cunas_inbox
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cunas_vencimientos') THEN
    ALTER TABLE cunas_vencimientos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cunas_vencimientos ON cunas_vencimientos;
    CREATE POLICY tenant_isolation_cunas_vencimientos ON cunas_vencimientos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Compliance ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='compliance_reports') THEN
    ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_compliance_reports ON compliance_reports;
    CREATE POLICY tenant_isolation_compliance_reports ON compliance_reports
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='approval_overrides') THEN
    ALTER TABLE approval_overrides ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_approval_overrides ON approval_overrides;
    CREATE POLICY tenant_isolation_approval_overrides ON approval_overrides
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Emisión (Tandas, Spots, Conciliación, Detección, Certificados) ──────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tandas') THEN
    ALTER TABLE tandas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_tandas ON tandas;
    CREATE POLICY tenant_isolation_tandas ON tandas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='spots_tanda') THEN
    ALTER TABLE spots_tanda ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_spots_tanda ON spots_tanda;
    CREATE POLICY tenant_isolation_spots_tanda ON spots_tanda
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='conciliacion') THEN
    ALTER TABLE conciliacion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_conciliacion ON conciliacion;
    CREATE POLICY tenant_isolation_conciliacion ON conciliacion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='registro_deteccion') THEN
    ALTER TABLE registro_deteccion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_registro_deteccion ON registro_deteccion;
    CREATE POLICY tenant_isolation_registro_deteccion ON registro_deteccion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='verificaciones_emision') THEN
    ALTER TABLE verificaciones_emision ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_verificaciones_emision ON verificaciones_emision;
    CREATE POLICY tenant_isolation_verificaciones_emision ON verificaciones_emision
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='certificados_emision') THEN
    ALTER TABLE certificados_emision ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_certificados_emision ON certificados_emision;
    CREATE POLICY tenant_isolation_certificados_emision ON certificados_emision
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='alertas_programacion') THEN
    ALTER TABLE alertas_programacion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_alertas_programacion ON alertas_programacion;
    CREATE POLICY tenant_isolation_alertas_programacion ON alertas_programacion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='links_temporales') THEN
    ALTER TABLE links_temporales ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_links_temporales ON links_temporales;
    CREATE POLICY tenant_isolation_links_temporales ON links_temporales
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Activos Digitales ────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='activos_digitales') THEN
    ALTER TABLE activos_digitales ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_activos_digitales ON activos_digitales;
    CREATE POLICY tenant_isolation_activos_digitales ON activos_digitales
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='creatividades_activo') THEN
    ALTER TABLE creatividades_activo ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_creatividades_activo ON creatividades_activo;
    CREATE POLICY tenant_isolation_creatividades_activo ON creatividades_activo
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='segmentacion_demografica') THEN
    ALTER TABLE segmentacion_demografica ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_segmentacion_demografica ON segmentacion_demografica;
    CREATE POLICY tenant_isolation_segmentacion_demografica ON segmentacion_demografica
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='segmentacion_geografica') THEN
    ALTER TABLE segmentacion_geografica ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_segmentacion_geografica ON segmentacion_geografica;
    CREATE POLICY tenant_isolation_segmentacion_geografica ON segmentacion_geografica
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='segmentacion_dispositivo') THEN
    ALTER TABLE segmentacion_dispositivo ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_segmentacion_dispositivo ON segmentacion_dispositivo;
    CREATE POLICY tenant_isolation_segmentacion_dispositivo ON segmentacion_dispositivo
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='segmentacion_conductual') THEN
    ALTER TABLE segmentacion_conductual ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_segmentacion_conductual ON segmentacion_conductual;
    CREATE POLICY tenant_isolation_segmentacion_conductual ON segmentacion_conductual
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='segmentacion_contextual') THEN
    ALTER TABLE segmentacion_contextual ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_segmentacion_contextual ON segmentacion_contextual;
    CREATE POLICY tenant_isolation_segmentacion_contextual ON segmentacion_contextual
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='segmentacion_geofencing') THEN
    ALTER TABLE segmentacion_geofencing ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_segmentacion_geofencing ON segmentacion_geofencing;
    CREATE POLICY tenant_isolation_segmentacion_geofencing ON segmentacion_geofencing
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tracking_activo') THEN
    ALTER TABLE tracking_activo ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_tracking_activo ON tracking_activo;
    CREATE POLICY tenant_isolation_tracking_activo ON tracking_activo
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='metricas_activo_historico') THEN
    ALTER TABLE metricas_activo_historico ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_metricas_activo_historico ON metricas_activo_historico;
    CREATE POLICY tenant_isolation_metricas_activo_historico ON metricas_activo_historico
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Archivos Adjuntos ────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='archivos_adjuntos') THEN
    ALTER TABLE archivos_adjuntos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_archivos_adjuntos ON archivos_adjuntos;
    CREATE POLICY tenant_isolation_archivos_adjuntos ON archivos_adjuntos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Agencias Medios ──────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='agencias_medios') THEN
    ALTER TABLE agencias_medios ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_agencias_medios ON agencias_medios;
    CREATE POLICY tenant_isolation_agencias_medios ON agencias_medios
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contactos_agencia') THEN
    ALTER TABLE contactos_agencia ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_contactos_agencia ON contactos_agencia;
    CREATE POLICY tenant_isolation_contactos_agencia ON contactos_agencia
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Materiales ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='copy_instructions') THEN
    ALTER TABLE copy_instructions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_copy_instructions ON copy_instructions;
    CREATE POLICY tenant_isolation_copy_instructions ON copy_instructions
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='creativos_digitales') THEN
    ALTER TABLE creativos_digitales ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_creativos_digitales ON creativos_digitales;
    CREATE POLICY tenant_isolation_creativos_digitales ON creativos_digitales
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='carpetas_dam') THEN
    ALTER TABLE carpetas_dam ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_carpetas_dam ON carpetas_dam;
    CREATE POLICY tenant_isolation_carpetas_dam ON carpetas_dam
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rotacion_cunas') THEN
    ALTER TABLE rotacion_cunas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_rotacion_cunas ON rotacion_cunas;
    CREATE POLICY tenant_isolation_rotacion_cunas ON rotacion_cunas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='creativos_campana') THEN
    ALTER TABLE creativos_campana ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_creativos_campana ON creativos_campana;
    CREATE POLICY tenant_isolation_creativos_campana ON creativos_campana
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cunas_gemelas') THEN
    ALTER TABLE cunas_gemelas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cunas_gemelas ON cunas_gemelas;
    CREATE POLICY tenant_isolation_cunas_gemelas ON cunas_gemelas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='historial_operaciones') THEN
    ALTER TABLE historial_operaciones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_historial_operaciones ON historial_operaciones;
    CREATE POLICY tenant_isolation_historial_operaciones ON historial_operaciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reglas_competencia') THEN
    ALTER TABLE reglas_competencia ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_reglas_competencia ON reglas_competencia;
    CREATE POLICY tenant_isolation_reglas_competencia ON reglas_competencia
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notas_spots') THEN
    ALTER TABLE notas_spots ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_notas_spots ON notas_spots;
    CREATE POLICY tenant_isolation_notas_spots ON notas_spots
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Cierre Mensual ───────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='periodos_cierre') THEN
    ALTER TABLE periodos_cierre ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_periodos_cierre ON periodos_cierre;
    CREATE POLICY tenant_isolation_periodos_cierre ON periodos_cierre
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='historial_cierre') THEN
    ALTER TABLE historial_cierre ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_historial_cierre ON historial_cierre;
    CREATE POLICY tenant_isolation_historial_cierre ON historial_cierre
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Cotizaciones ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cotizaciones') THEN
    ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_cotizaciones ON cotizaciones;
    CREATE POLICY tenant_isolation_cotizaciones ON cotizaciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='historial_cotizacion') THEN
    ALTER TABLE historial_cotizacion ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_historial_cotizacion ON historial_cotizacion;
    CREATE POLICY tenant_isolation_historial_cotizacion ON historial_cotizacion
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tarifario') THEN
    ALTER TABLE tarifario ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_tarifario ON tarifario;
    CREATE POLICY tenant_isolation_tarifario ON tarifario
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Ventas Premium (CRM Avanzado) ───────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deals') THEN
    ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_deals ON deals;
    CREATE POLICY tenant_isolation_deals ON deals
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deal_actividades') THEN
    ALTER TABLE deal_actividades ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_deal_actividades ON deal_actividades;
    CREATE POLICY tenant_isolation_deal_actividades ON deal_actividades
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deal_stakeholders') THEN
    ALTER TABLE deal_stakeholders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_deal_stakeholders ON deal_stakeholders;
    CREATE POLICY tenant_isolation_deal_stakeholders ON deal_stakeholders
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='mensaje_templates') THEN
    ALTER TABLE mensaje_templates ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_mensaje_templates ON mensaje_templates;
    CREATE POLICY tenant_isolation_mensaje_templates ON mensaje_templates
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='objeciones') THEN
    ALTER TABLE objeciones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_objeciones ON objeciones;
    CREATE POLICY tenant_isolation_objeciones ON objeciones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reuniones_prep') THEN
    ALTER TABLE reuniones_prep ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_reuniones_prep ON reuniones_prep;
    CREATE POLICY tenant_isolation_reuniones_prep ON reuniones_prep
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='activity_log') THEN
    ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_activity_log ON activity_log;
    CREATE POLICY tenant_isolation_activity_log ON activity_log
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Emisoras Extended (Programas Emisora, Bloques Comerciales) ───────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='programas_emisora') THEN
    ALTER TABLE programas_emisora ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_programas_emisora ON programas_emisora;
    CREATE POLICY tenant_isolation_programas_emisora ON programas_emisora
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='bloques_comerciales') THEN
    ALTER TABLE bloques_comerciales ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_bloques_comerciales ON bloques_comerciales;
    CREATE POLICY tenant_isolation_bloques_comerciales ON bloques_comerciales
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Vencimientos Extended (Inventario Cupos, Auspicios) ──────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='inventario_cupos') THEN
    ALTER TABLE inventario_cupos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_inventario_cupos ON inventario_cupos;
    CREATE POLICY tenant_isolation_inventario_cupos ON inventario_cupos
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='auspicios') THEN
    ALTER TABLE auspicios ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_auspicios ON auspicios;
    CREATE POLICY tenant_isolation_auspicios ON auspicios
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Metas Ventas / Historial Comisiones ─────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='metas_ventas') THEN
    ALTER TABLE metas_ventas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_metas_ventas ON metas_ventas;
    CREATE POLICY tenant_isolation_metas_ventas ON metas_ventas
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='historial_comisiones') THEN
    ALTER TABLE historial_comisiones ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_historial_comisiones ON historial_comisiones;
    CREATE POLICY tenant_isolation_historial_comisiones ON historial_comisiones
      USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
      WITH CHECK (tenant_id = current_tenant_id());
  END IF;
END $$;

-- ─── Refresh privileges for any new tables ────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO silexar_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO silexar_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO silexar_app;

-- ============================================================================
-- Total coverage: 62 tables with RLS isolation
-- 16 tables covered by 0003_enable_rls_multi_tenant.sql
-- 46 additional tables covered by this migration
-- Every table enforces: tenant_id = current_tenant_id()
--   OR current_setting('app.is_super_admin', true) = 'true'
-- ============================================================================
