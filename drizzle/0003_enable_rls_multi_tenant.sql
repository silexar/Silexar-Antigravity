-- ============================================================================
-- Silexar Pulse - Row Level Security (RLS) for Multi-Tenant Isolation
-- ============================================================================
-- This migration enables RLS on all tenant-scoped tables.
-- Every query from the application MUST set the session variable:
--   SET app.current_tenant_id = '<tenant-uuid>';
-- before executing any queries. This is done by the connection middleware.
--
-- SUPER_CEO / ADMIN users bypass RLS via the silexar_admin role.
-- ============================================================================

-- 1. Create application roles
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'silexar_app') THEN
    CREATE ROLE silexar_app NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'silexar_admin') THEN
    CREATE ROLE silexar_admin NOLOGIN BYPASSRLS;
  END IF;
END
$$;

-- Grant usage to app role
GRANT USAGE ON SCHEMA public TO silexar_app;
GRANT USAGE ON SCHEMA public TO silexar_admin;

-- 2. Enable RLS on all tenant-scoped tables
-- ─────────────────────────────────────────────────────────────

-- Helper function to get current tenant ID from session
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- List of all tenant-scoped tables
-- Each of these has a tenant_id column referencing tenants.id

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Anunciantes
ALTER TABLE anunciantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_anunciantes ON anunciantes
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Agencias Creativas
ALTER TABLE agencias_creativas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agencias_creativas ON agencias_creativas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Contratos
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_contratos ON contratos
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Contratos Items
ALTER TABLE contratos_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_contratos_items ON contratos_items
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Contratos Vencimientos
ALTER TABLE contratos_vencimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_contratos_vencimientos ON contratos_vencimientos
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Campanas
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_campanas ON campanas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Emisoras
ALTER TABLE emisoras ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_emisoras ON emisoras
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Equipos Ventas
ALTER TABLE equipos_ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_equipos_ventas ON equipos_ventas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Vendedores
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_vendedores ON vendedores
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Facturas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_facturas ON facturas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Vencimientos
ALTER TABLE vencimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_vencimientos ON vencimientos
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Leads (CRM)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_leads ON leads
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Oportunidades (CRM)
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_oportunidades ON oportunidades
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Propuestas Comerciales
ALTER TABLE propuestas_comerciales ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_propuestas_comerciales ON propuestas_comerciales
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- Programas
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_programas ON programas
  USING (tenant_id = current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
  WITH CHECK (tenant_id = current_tenant_id());

-- 3. Grant table permissions to app role
-- ─────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO silexar_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO silexar_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO silexar_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO silexar_admin;

-- 4. Default privileges for future tables
-- ─────────────────────────────────────────────────────────────

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO silexar_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO silexar_admin;

-- ============================================================================
-- USAGE IN APPLICATION:
--
-- Before every request:
--   await db.execute(sql`SET app.current_tenant_id = ${tenantId}`)
--
-- For super admin operations:
--   await db.execute(sql`SET app.is_super_admin = 'true'`)
--
-- After request (in finally block):
--   await db.execute(sql`RESET app.current_tenant_id`)
--   await db.execute(sql`RESET app.is_super_admin`)
-- ============================================================================
