-- Migration: 005_configuracion_module.sql
-- Módulo de Configuración - Silexar Pulse
-- Created: 2026-04-27

-- =====================================================
-- TABLA: configuraciones
-- =====================================================
-- Almacena las configuraciones del sistema por tenant

CREATE TABLE IF NOT EXISTS configuraciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    clave VARCHAR(255) NOT NULL,
    valor JSONB NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,
    editable BOOLEAN DEFAULT true NOT NULL,
    visible BOOLEAN DEFAULT true NOT NULL,
    nivel_seguridad VARCHAR(50) DEFAULT 'publico' NOT NULL,
    grupo VARCHAR(100),
    orden INTEGER DEFAULT 0 NOT NULL,
    creada_por UUID REFERENCES users(id),
    actualizada_por UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_configuraciones_tipo CHECK (tipo IN ('string', 'number', 'boolean', 'json', 'password', 'email', 'url')),
    CONSTRAINT chk_configuraciones_nivel CHECK (nivel_seguridad IN ('publico', 'interno', 'confidencial', 'critico'))
);

-- Índices para configuraciones
CREATE INDEX idx_configuraciones_tenant_id ON configuraciones(tenant_id);
CREATE INDEX idx_configuraciones_categoria ON configuraciones(categoria);
CREATE INDEX idx_configuraciones_clave ON configuraciones(clave);
CREATE INDEX idx_configuraciones_tenant_categoria ON configuraciones(tenant_id, categoria);
CREATE INDEX idx_configuraciones_grupo ON configuraciones(grupo);
CREATE INDEX idx_configuraciones_visible ON configuraciones(tenant_id, visible) WHERE visible = true;
CREATE INDEX idx_configuraciones_editable ON configuraciones(tenant_id, editable) WHERE editable = true;

-- Comentarios
COMMENT ON TABLE configuraciones IS 'Tabla principal para almacenar configuraciones del sistema por tenant';
COMMENT ON COLUMN configuraciones.clave IS 'Clave única de la configuración (ej: NOMBRE_EMPRESA)';
COMMENT ON COLUMN configuraciones.valor IS 'Valor de la configuración en formato JSON';
COMMENT ON COLUMN configuraciones.tipo IS 'Tipo de dato: string, number, boolean, json, password, email, url';
COMMENT ON COLUMN configuraciones.categoria IS 'Categoría de la configuración (ej: general, notificaciones, seguridad)';
COMMENT ON COLUMN configuraciones.nivel_seguridad IS 'Nivel de seguridad: publico, interno, confidencial, critico';
COMMENT ON COLUMN configuraciones.editable IS 'Si la configuración puede ser editada por usuarios';
COMMENT ON COLUMN configuraciones.visible IS 'Si la configuración es visible en la interfaz';

-- =====================================================
-- TABLA: configuraciones_auditoria
-- =====================================================
-- Almacena el historial de cambios en configuraciones

CREATE TABLE IF NOT EXISTS configuraciones_auditoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    configuracion_id UUID REFERENCES configuraciones(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES users(id),
    accion VARCHAR(50) NOT NULL,
    valor_anterior JSONB,
    valor_nuevo JSONB,
    clave_config VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_config_auditoria_accion CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'READ'))
);

-- Índices para auditoría
CREATE INDEX idx_config_auditoria_tenant ON configuraciones_auditoria(tenant_id);
CREATE INDEX idx_config_auditoria_usuario ON configuraciones_auditoria(usuario_id);
CREATE INDEX idx_config_auditoria_fecha ON configuraciones_auditoria(created_at);
CREATE INDEX idx_config_auditoria_configuracion ON configuraciones_auditoria(configuracion_id);
CREATE INDEX idx_config_auditoria_accion ON configuraciones_auditoria(accion);
CREATE INDEX idx_config_auditoria_rango_fechas ON configuraciones_auditoria(tenant_id, created_at);

-- Comentarios
COMMENT ON TABLE configuraciones_auditoria IS 'Tabla de auditoría para cambios en configuraciones';
COMMENT ON COLUMN configuraciones_auditoria.accion IS 'Tipo de acción: CREATE, UPDATE, DELETE, READ';
COMMENT ON COLUMN configuraciones_auditoria.valor_anterior IS 'Valor antes del cambio (para auditoria)';
COMMENT ON COLUMN configuraciones_auditoria.valor_nuevo IS 'Valor después del cambio (para auditoria)';

-- =====================================================
-- TABLA: configuraciones_grupos
-- =====================================================
-- Agrupa configuraciones relacionadas

CREATE TABLE IF NOT EXISTS configuraciones_grupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    orden INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para grupos
CREATE INDEX idx_config_grupos_tenant ON configuraciones_grupos(tenant_id);
CREATE INDEX idx_config_grupos_categoria ON configuraciones_grupos(categoria);

-- Comentarios
COMMENT ON TABLE configuraciones_grupos IS 'Grupos lógicos para organizar configuraciones';

-- =====================================================
-- TABLA: configuraciones_favoritas
-- =====================================================
-- Configuraciones marcadas como favoritas por usuario

CREATE TABLE IF NOT EXISTS configuraciones_favoritas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    configuracion_id UUID NOT NULL REFERENCES configuraciones(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraint unique: un usuario no puede marcar dos veces la misma configuración
    CONSTRAINT uk_config_fav_usuario_config UNIQUE (usuario_id, configuracion_id)
);

-- Índices
CREATE INDEX idx_config_fav_usuario ON configuraciones_favoritas(usuario_id);
CREATE INDEX idx_config_fav_config ON configuraciones_favoritas(configuracion_id);

-- Comentarios
COMMENT ON TABLE configuraciones_favoritas IS 'Configuraciones marcadas como favoritas por usuario';
COMMENT ON COLUMN configuraciones_favoritas.configuracion_id IS 'Referencia a la configuración favorita';
COMMENT ON COLUMN configuraciones_favoritas.usuario_id IS 'Usuario que marcó como favorita';

-- =====================================================
-- DATOS INICIALES (Seed)
-- =====================================================

-- Configuraciones iniciales por defecto para nuevos tenants
-- NOTA: Estas se insertan por tenant en el momento de creación del tenant

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_favoritas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configuraciones
CREATE POLICY rls_configuraciones_tenant ON configuraciones
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY rls_configuraciones_select ON configuraciones
    FOR SELECT USING (
        visible = true 
        AND tenant_id = current_setting('app.current_tenant_id')::uuid
    );

CREATE POLICY rls_configuraciones_update ON configuraciones
    FOR UPDATE USING (
        editable = true 
        AND tenant_id = current_setting('app.current_tenant_id')::uuid
    );

-- Políticas RLS para auditoría
CREATE POLICY rls_config_auditoria_tenant ON configuraciones_auditoria
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Políticas RLS para grupos
CREATE POLICY rls_config_grupos_tenant ON configuraciones_grupos
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Políticas RLS para favoritos
CREATE POLICY rls_config_fav_tenant ON configuraciones_favoritas
    USING (
        configuracion_id IN (
            SELECT id FROM configuraciones 
            WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
        )
    );

CREATE POLICY rls_config_fav_usuario ON configuraciones_favoritas
    FOR ALL USING (usuario_id = current_setting('app.current_user_id')::uuid);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_configuraciones_updated_at
    BEFORE UPDATE ON configuraciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_config_grupos_updated_at
    BEFORE UPDATE ON configuraciones_grupos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

-- Verification
-- SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'config%';
