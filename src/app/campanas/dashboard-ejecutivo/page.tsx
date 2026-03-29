'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD EJECUTIVO COMERCIAL - Vista de ventas
// ═══════════════════════════════════════════════════════════════

interface CampanaCartera {
  id: string;
  nombre: string;
  cliente: string;
  estado: 'activa' | 'por_vencer' | 'pendiente_renovar';
  cumplimiento: number;
  valor: number;
  fechaFin: Date;
}

interface MetaVentas {
  meta: number;
  actual: number;
  porcentaje: number;
}

export default function DashboardEjecutivo() {
  const [campanas, setCampanas] = useState<CampanaCartera[]>([]);
  const [meta] = useState<MetaVentas>({ meta: 150000000, actual: 125000000, porcentaje: 83 });
  const [metricas] = useState({
    ventasMes: 125000000,
    cumplimientoCartera: 94,
    campanasRenovar: 3,
    comisionEstimada: 3750000
  });

  useEffect(() => {
    setCampanas([
      { id: 'CMP-25-001', nombre: 'Campaña Navidad', cliente: 'BANCO CHILE', estado: 'activa', cumplimiento: 98, valor: 45000000, fechaFin: new Date(Date.now() + 30 * 86400000) },
      { id: 'CMP-25-002', nombre: 'Black Friday', cliente: 'RIPLEY', estado: 'por_vencer', cumplimiento: 91, valor: 32000000, fechaFin: new Date(Date.now() + 5 * 86400000) },
      { id: 'CMP-25-003', nombre: 'Cyber Monday', cliente: 'FALABELLA', estado: 'pendiente_renovar', cumplimiento: 95, valor: 28000000, fechaFin: new Date(Date.now() + 2 * 86400000) },
      { id: 'CMP-25-004', nombre: 'Lanzamiento', cliente: 'TOYOTA', estado: 'activa', cumplimiento: 100, valor: 20000000, fechaFin: new Date(Date.now() + 45 * 86400000) },
    ]);
  }, []);

  const formatCurrency = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>💼 Dashboard Ejecutivo Comercial</h1>
          <p style={{ color: '#94a3b8' }}>Tu cartera y metas de ventas</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            💰 Cotizador IA
          </button>
          <button style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
            👥 Mis Clientes
          </button>
        </div>
      </div>

      {/* Meta de Ventas */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>🎯 Meta del Mes</h2>
          <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '24px' }}>{meta.porcentaje}%</span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${meta.porcentaje}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            borderRadius: '10px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#94a3b8' }}>
          <span>Actual: {formatCurrency(meta.actual)}</span>
          <span>Meta: {formatCurrency(meta.meta)}</span>
          <span>Falta: {formatCurrency(meta.meta - meta.actual)}</span>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricaCard icono="💰" titulo="Ventas Mes" valor={formatCurrency(metricas.ventasMes)} color="#10b981" tendencia="+12%" />
        <MetricaCard icono="📊" titulo="Cumplimiento" valor={`${metricas.cumplimientoCartera}%`} color="#3b82f6" tendencia="+2%" />
        <MetricaCard icono="🔄" titulo="Por Renovar" valor={metricas.campanasRenovar.toString()} color="#f59e0b" tendencia="" />
        <MetricaCard icono="🏆" titulo="Comisión Est." valor={formatCurrency(metricas.comisionEstimada)} color="#8b5cf6" tendencia="+8%" />
      </div>

      {/* Mi Cartera */}
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📋 Mi Cartera de Campañas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {campanas.map(c => (
            <div key={c.id} style={{ 
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '12px', 
              padding: '16px', 
              border: `1px solid ${c.estado === 'pendiente_renovar' ? '#f59e0b' : c.estado === 'por_vencer' ? '#ef4444' : '#22c55e'}40`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{c.nombre}</span>
                  <span style={{ 
                    background: c.estado === 'pendiente_renovar' ? '#f59e0b20' : c.estado === 'por_vencer' ? '#ef444420' : '#22c55e20',
                    color: c.estado === 'pendiente_renovar' ? '#f59e0b' : c.estado === 'por_vencer' ? '#ef4444' : '#22c55e',
                    padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold'
                  }}>
                    {c.estado === 'pendiente_renovar' ? '🔄 RENOVAR' : c.estado === 'por_vencer' ? '⏰ POR VENCER' : '✅ ACTIVA'}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{c.cliente}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: c.cumplimiento >= 95 ? '#22c55e' : c.cumplimiento >= 80 ? '#f59e0b' : '#ef4444' }}>{c.cumplimiento}%</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Cumplimiento</p>
              </div>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(c.valor)}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Valor</p>
              </div>
              <button style={{ 
                background: c.estado === 'pendiente_renovar' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(59, 130, 246, 0.2)',
                color: c.estado === 'pendiente_renovar' ? 'white' : '#60a5fa',
                border: c.estado === 'pendiente_renovar' ? 'none' : '1px solid #3b82f6',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}>
                {c.estado === 'pendiente_renovar' ? '🔄 Renovar' : 'Ver Detalle'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricaCard({ icono, titulo, valor, color, tendencia }: { icono: string; titulo: string; valor: string; color: string; tendencia: string }) {
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: `1px solid ${color}40` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icono}</span>
        <span style={{ color: '#94a3b8', fontSize: '14px' }}>{titulo}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color }}>{valor}</span>
        {tendencia && <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 'bold' }}>{tendencia}</span>}
      </div>
    </div>
  );
}
