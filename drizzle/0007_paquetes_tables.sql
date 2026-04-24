-- Migration: Create Paquetes Tables
-- Version: 1.0.0
-- Date: 2026-04-22

-- Paquetes principales
CREATE TABLE IF NOT EXISTS paquetes (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,  -- PAQ-2025-XXXXX
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  tipo TEXT NOT NULL,  -- PRIME, REPARTIDO, NOCTURNO, SENALES, ESPECIAL, EXCLUSIVO
  estado TEXT NOT NULL DEFAULT 'ACTIVO',  -- ACTIVO, INACTIVO, MANTENIMIENTO, BORRADO
  
  -- Emisora y programa
  editora_id TEXT NOT NULL,
  editora_nombre TEXT NOT NULL,
  programa_id TEXT NOT NULL,
  programa_nombre TEXT NOT NULL,
  
  -- Horarios
  horario_inicio TIME NOT NULL,
  horario_fin TIME NOT NULL,
  dias_semana TEXT[] NOT NULL,  -- ['L','M','M','J','V','S','D']
  
  -- Duraciones disponibles
  duraciones INTEGER[] NOT NULL,  -- [15, 30, 45]
  
  -- Pricing
  precio_base BIGINT NOT NULL,  -- En CLP sin decimales
  precio_actual BIGINT NOT NULL,
  
  -- Exclusividad
  nivel_exclusividad TEXT NOT NULL,  -- EXCLUSIVO, COMPARTIDO, ABIERTO
  
  -- Fechas
  vigencia_desde DATE NOT NULL,
  vigencia_hasta DATE NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Índices para paquetes
CREATE INDEX IF NOT EXISTS idx_paquetes_codigo ON paquetes(codigo);
CREATE INDEX IF NOT EXISTS idx_paquetes_tipo ON paquetes(tipo);
CREATE INDEX IF NOT EXISTS idx_paquetes_estado ON paquetes(estado);
CREATE INDEX IF NOT EXISTS idx_paquetes_editora ON paquetes(editora_id);
CREATE INDEX IF NOT EXISTS idx_paquetes_programa ON paquetes(programa_id);
CREATE INDEX IF NOT EXISTS idx_paquetes_vigencia ON paquetes(vigencia_desde, vigencia_hasta);

-- Historial de precios
CREATE TABLE IF NOT EXISTS paquetes_historial_precio (
  id TEXT PRIMARY KEY,
  paquete_id TEXT NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  precio_base BIGINT NOT NULL,
  factor_demanda DECIMAL(5,4) DEFAULT 1.0,
  factor_estacional DECIMAL(5,4) DEFAULT 1.0,
  factor_performance DECIMAL(5,4) DEFAULT 1.0,
  precio_final BIGINT NOT NULL,
  fecha_vigencia DATE NOT NULL,
  creado_por TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_precio_paquete ON paquetes_historial_precio(paquete_id);
CREATE INDEX IF NOT EXISTS idx_historial_precio_vigencia ON paquetes_historial_precio(fecha_vigencia);

-- Disponibilidad e inventario
CREATE TABLE IF NOT EXISTS paquetes_disponibilidad (
  id TEXT PRIMARY KEY,
  paquete_id TEXT NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  cupos_totales INTEGER NOT NULL DEFAULT 0,
  cupos_ocupados INTEGER NOT NULL DEFAULT 0,
  disponible_pct DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  spots_programados INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(paquete_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_paquete ON paquetes_disponibilidad(paquete_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_fecha ON paquetes_disponibilidad(fecha);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_paquete_fecha ON paquetes_disponibilidad(paquete_id, fecha);

-- Restricciones por paquete
CREATE TABLE IF NOT EXISTS paquetes_restricciones (
  id TEXT PRIMARY KEY,
  paquete_id TEXT NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  tipo_restriccion TEXT NOT NULL,  -- INDUSTRIA, HORARIO, EXCLUSIVIDAD, COMPETENCIA
  descripcion TEXT NOT NULL,
  rubro_afectado TEXT,
  horario_inicio TIME,
  horario_fin TIME,
  activos BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restricciones_paquete ON paquetes_restricciones(paquete_id);

-- Factores estacionales predefinidos
CREATE TABLE IF NOT EXISTS paquetes_factores_estacionales (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  factor DECIMAL(5,4) NOT NULL,
  mes_inicio INTEGER NOT NULL,  -- 1-12
  mes_fin INTEGER NOT NULL,
  dia_inicio INTEGER,  -- 1-31 opcional
  dia_fin INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_factores_estacionales_mes ON paquetes_factores_estacionales(mes_inicio, mes_fin);