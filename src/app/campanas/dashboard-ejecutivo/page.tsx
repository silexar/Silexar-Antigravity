'use client';

import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoBadge, N } from '../_lib/neumorphic';

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

  const estadoColor = (estado: CampanaCartera['estado']) => {
    switch (estado) {
      case 'pendiente_renovar': return 'yellow' as const;
      case 'por_vencer': return 'red' as const;
      case 'activa': return 'green' as const;
    }
  };

  const estadoLabel = (estado: CampanaCartera['estado']) => {
    switch (estado) {
      case 'pendiente_renovar': return '🔄 RENOVAR';
      case 'por_vencer': return '⏰ POR VENCER';
      case 'activa': return '✅ ACTIVA';
    }
  };

  const cumplimientoColor = (c: number) => {
    if (c >= 95) return '#22c55e';
    if (c >= 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ padding: '24px', background: N.base, minHeight: '100vh', color: N.text }}>
      <div className="mb-6">
        <NeoPageHeader
          title="Dashboard Ejecutivo Comercial"
          subtitle="Tu cartera y metas de ventas"
          icon={Briefcase}
          backHref="/campanas"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-3 mb-6">
        <NeoButton variant="primary">💰 Cotizador IA</NeoButton>
        <NeoButton variant="secondary">👥 Mis Clientes</NeoButton>
      </div>

      {/* Meta de Ventas */}
      <NeoCard className="mb-6" style={{ border: `1px solid ${N.accent}30` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black" style={{ color: N.text }}>🎯 Meta del Mes</h2>
          <span className="text-2xl font-black" style={{ color: N.accent }}>{meta.porcentaje}%</span>
        </div>
        <div style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}`, borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
          <div style={{
            width: `${meta.porcentaje}%`,
            height: '100%',
            background: N.accent,
            borderRadius: '10px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div className="flex justify-between mt-3 text-xs font-bold" style={{ color: N.textSub }}>
          <span>Actual: {formatCurrency(meta.actual)}</span>
          <span>Meta: {formatCurrency(meta.meta)}</span>
          <span>Falta: {formatCurrency(meta.meta - meta.actual)}</span>
        </div>
      </NeoCard>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricaCard icono="💰" titulo="Ventas Mes" valor={formatCurrency(metricas.ventasMes)} color="#22c55e" tendencia="+12%" />
        <MetricaCard icono="📊" titulo="Cumplimiento" valor={`${metricas.cumplimientoCartera}%`} color={N.accent} tendencia="+2%" />
        <MetricaCard icono="🔄" titulo="Por Renovar" valor={metricas.campanasRenovar.toString()} color="#f59e0b" tendencia="" />
        <MetricaCard icono="🏆" titulo="Comisión Est." valor={formatCurrency(metricas.comisionEstimada)} color="#a855f7" tendencia="+8%" />
      </div>

      {/* Mi Cartera */}
      <NeoCard>
        <h2 className="text-lg font-black mb-4" style={{ color: N.text }}>📋 Mi Cartera de Campañas</h2>
        <div className="flex flex-col gap-3">
          {campanas.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl p-4"
              style={{
                background: N.base,
                boxShadow: `6px 6px 12px ${N.dark}, -6px -6px 12px ${N.light}`,
                border: `1px solid ${c.estado === 'pendiente_renovar' ? '#f59e0b' : c.estado === 'por_vencer' ? '#ef4444' : '#22c55e'}40`
              }}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold" style={{ color: N.text }}>{c.nombre}</span>
                  <NeoBadge color={estadoColor(c.estado)}>{estadoLabel(c.estado)}</NeoBadge>
                </div>
                <p className="text-xs font-bold" style={{ color: N.textSub }}>{c.cliente}</p>
              </div>
              <div className="text-center px-5">
                <p className="text-2xl font-black" style={{ color: cumplimientoColor(c.cumplimiento) }}>{c.cumplimiento}%</p>
                <p className="text-[10px] font-bold uppercase" style={{ color: N.textSub }}>Cumplimiento</p>
              </div>
              <div className="text-center px-5">
                <p className="text-xl font-black" style={{ color: N.text }}>{formatCurrency(c.valor)}</p>
                <p className="text-[10px] font-bold uppercase" style={{ color: N.textSub }}>Valor</p>
              </div>
              <NeoButton variant={c.estado === 'pendiente_renovar' ? 'primary' : 'secondary'} size="sm">
                {c.estado === 'pendiente_renovar' ? '🔄 Renovar' : 'Ver Detalle'}
              </NeoButton>
            </div>
          ))}
        </div>
      </NeoCard>
    </div>
  );
}

function MetricaCard({ icono, titulo, valor, color, tendencia }: { icono: string; titulo: string; valor: string; color: string; tendencia: string }) {
  return (
    <NeoCard style={{ border: `1px solid ${color}40` }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icono}</span>
        <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>{titulo}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black" style={{ color }}>{valor}</span>
        {tendencia && <span className="text-sm font-bold" style={{ color: '#22c55e' }}>{tendencia}</span>}
      </div>
    </NeoCard>
  );
}
