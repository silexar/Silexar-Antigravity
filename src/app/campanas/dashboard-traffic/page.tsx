'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD TRAFFIC MANAGER - Vista especializada
// ═══════════════════════════════════════════════════════════════

interface ConflictoActivo {
  id: string;
  tipo: string;
  severidad: 'critico' | 'alto' | 'medio';
  bloque: string;
  hora: string;
  campanas: string[];
  descripcion: string;
}

interface MaterialFaltante {
  campanaId: string;
  campanaNombre: string;
  codigoSP: string;
  duracion: number;
  fechaLimite: Date;
  diasRestantes: number;
}

interface ConfirmacionPendiente {
  id: string;
  campanaId: string;
  campanaNombre: string;
  cliente: string;
  fechaProgramacion: Date;
  spotsTotal: number;
}

export default function DashboardTraffic() {
  const [conflictos, setConflictos] = useState<ConflictoActivo[]>([]);
  const [materiales, setMateriales] = useState<MaterialFaltante[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<ConfirmacionPendiente[]>([]);
  const [metricas, setMetricas] = useState({
    campanasActivas: 47,
    emisionesHoy: 1250,
    conflictosPendientes: 3,
    materialesFaltantes: 5
  });

  useEffect(() => {
    // Cargar datos
    setConflictos([
      { id: 'C1', tipo: 'competencia', severidad: 'critico', bloque: 'PRIME 08:00', hora: '08:15', campanas: ['BANCO CHILE', 'BANCO ESTADO'], descripcion: 'Competencia directa en misma tanda' },
      { id: 'C2', tipo: 'saturacion', severidad: 'alto', bloque: 'AUSPICIO 12:30', hora: '12:30', campanas: ['RIPLEY', 'FALABELLA', 'PARIS'], descripcion: 'Tanda excede 4 minutos' },
      { id: 'C3', tipo: 'posicion', severidad: 'medio', bloque: 'PRIME 19:00', hora: '19:00', campanas: ['TOYOTA', 'HYUNDAI'], descripcion: 'Posición fija 1 duplicada' },
    ]);

    setMateriales([
      { campanaId: 'CMP-25-001', campanaNombre: 'BANCO CHILE Navidad', codigoSP: 'SP-2501', duracion: 30, fechaLimite: new Date(Date.now() + 86400000), diasRestantes: 1 },
      { campanaId: 'CMP-25-003', campanaNombre: 'RIPLEY Black Friday', codigoSP: 'SP-2503', duracion: 15, fechaLimite: new Date(Date.now() + 172800000), diasRestantes: 2 },
      { campanaId: 'CMP-25-007', campanaNombre: 'FALABELLA Cyber', codigoSP: 'SP-2507', duracion: 30, fechaLimite: new Date(Date.now() + 259200000), diasRestantes: 3 },
    ]);

    setConfirmaciones([
      { id: 'CONF-1', campanaId: 'CMP-25-010', campanaNombre: 'COCA COLA Zero', cliente: 'COCA COLA CHILE', fechaProgramacion: new Date(), spotsTotal: 45 },
      { id: 'CONF-2', campanaId: 'CMP-25-012', campanaNombre: 'JUMBO Ahorro', cliente: 'CENCOSUD', fechaProgramacion: new Date(Date.now() + 86400000), spotsTotal: 32 },
    ]);
  }, []);

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>📅 Dashboard Traffic Manager</h1>
          <p style={{ color: '#94a3b8' }}>Vista especializada para programación y control</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Nueva Campaña
          </button>
          <button style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
            📅 Ver Programación
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricaCard icono="📋" titulo="Campañas Activas" valor={metricas.campanasActivas} color="#10b981" tendencia="+3" />
        <MetricaCard icono="📡" titulo="Emisiones Hoy" valor={metricas.emisionesHoy} color="#3b82f6" tendencia="+125" />
        <MetricaCard icono="🔥" titulo="Conflictos" valor={metricas.conflictosPendientes} color="#ef4444" tendencia="-2" negativo />
        <MetricaCard icono="🎵" titulo="Materiales Faltantes" valor={metricas.materialesFaltantes} color="#f59e0b" tendencia="-1" negativo />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Conflictos */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔥 Conflictos Activos ({conflictos.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conflictos.map(c => (
              <div key={c.id} style={{ 
                background: c.severidad === 'critico' ? 'rgba(239, 68, 68, 0.15)' : c.severidad === 'alto' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                borderRadius: '12px', padding: '16px', border: `1px solid ${c.severidad === 'critico' ? '#ef4444' : c.severidad === 'alto' ? '#f97316' : '#fbbf24'}40`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{c.bloque}</span>
                  <span style={{ 
                    background: c.severidad === 'critico' ? '#dc2626' : c.severidad === 'alto' ? '#ea580c' : '#d97706',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {c.severidad.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>{c.descripcion}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {c.campanas.map(camp => (
                    <span key={camp} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{camp}</span>
                  ))}
                </div>
                <button style={{ marginTop: '12px', background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                  Resolver Conflicto
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Materiales Faltantes */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎵 Materiales Faltantes ({materiales.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {materiales.map(m => (
              <div key={m.campanaId} style={{ 
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px', padding: '16px', border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{m.campanaNombre}</span>
                  <span style={{ color: m.diasRestantes <= 1 ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                    {m.diasRestantes === 0 ? '⚠️ HOY' : m.diasRestantes === 1 ? '⏰ MAÑANA' : `${m.diasRestantes} días`}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{m.codigoSP} • {m.duracion}s</p>
                <button style={{ marginTop: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                  Solicitar Material
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmaciones Pendientes */}
      <div style={{ marginTop: '24px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>✅ Confirmaciones Pendientes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {confirmaciones.map(c => (
            <div key={c.id} style={{ background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{c.campanaNombre}</p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{c.cliente} • {c.spotsTotal} spots</p>
              </div>
              <button style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Confirmar ✓
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricaCard({ icono, titulo, valor, color, tendencia, negativo = false }: { icono: string; titulo: string; valor: number; color: string; tendencia: string; negativo?: boolean }) {
  const tendenciaPositiva = tendencia.startsWith('+') ? !negativo : negativo;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: `1px solid ${color}40` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icono}</span>
        <span style={{ color: '#94a3b8', fontSize: '14px' }}>{titulo}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: 'bold', color }}>{valor.toLocaleString()}</span>
        <span style={{ color: tendenciaPositiva ? '#22c55e' : '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>
          {tendencia}
        </span>
      </div>
    </div>
  );
}
