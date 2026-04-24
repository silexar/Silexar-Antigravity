-- Migration: Add Performance Tracking Tables
-- Version: 1.1.0
-- Date: 2026-04-22
-- Description: Adds performance metrics and analytics tables

-- Performance metrics aggregate table
CREATE TABLE IF NOT EXISTS paquetes_performance (
  id TEXT PRIMARY KEY,
  paquete_id TEXT NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  
  -- Revenue metrics
  revenue_ytd BIGINT DEFAULT 0,
  revenue_mtd BIGINT DEFAULT 0,
  revenue_historico BIGINT DEFAULT 0,
  
  -- Utilization metrics
  utilizacion_promedio DECIMAL(5,2) DEFAULT 0,
  
  -- Conversion metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- ROI metrics
  roi_promedio DECIMAL(5,2) DEFAULT 0,
  
  -- Trends
  tendencia_utilizacion DECIMAL(5,2) DEFAULT 0,
  tendencia_revenue DECIMAL(5,2) DEFAULT 0,
  
  -- Rankings
  ranking_tipo INTEGER DEFAULT 0,
  ranking_global INTEGER DEFAULT 0,
  
  -- Cliente info
  mejor_cliente TEXT,
  total_clientes_activos INTEGER DEFAULT 0,
  
  -- Predictions
  prediccion_proximo_mes BIGINT DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_paquete ON paquetes_performance(paquete_id);

-- Aggregate daily metrics for trending
CREATE TABLE IF NOT EXISTS paquetes_metrics_diarias (
  id TEXT PRIMARY KEY,
  paquete_id TEXT NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  
  -- Daily metrics
  cupos_totales INTEGER DEFAULT 0,
  cupos_ocupados INTEGER DEFAULT 0,
  spots_programados INTEGER DEFAULT 0,
  revenue_del_dia BIGINT DEFAULT 0,
  
  -- Computed
  ocupacion_pct DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(paquete_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_metrics_diarias_paquete ON paquetes_metrics_diarias(paquete_id);
CREATE INDEX IF NOT EXISTS idx_metrics_diarias_fecha ON paquetes_metrics_diarias(fecha);
CREATE INDEX IF NOT EXISTS idx_metrics_diarias_paquete_fecha ON paquetes_metrics_diarias(paquete_id, fecha);