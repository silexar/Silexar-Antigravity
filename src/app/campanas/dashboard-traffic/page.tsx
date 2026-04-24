'use client';

import { useState, useEffect } from 'react';
import { Radio, AlertTriangle, Music, CheckCircle } from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, N } from '../_lib/neumorphic';

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

  const severidadColor = (s: ConflictoActivo['severidad']) => {
    switch (s) {
      case 'critico': return '#ef4444';
      case 'alto': return '#f97316';
      case 'medio': return '#f59e0b';
    }
  };

  const severidadBg = (s: ConflictoActivo['severidad']) => {
    switch (s) {
      case 'critico': return '#ef444415';
      case 'alto': return '#f9731615';
      case 'medio': return '#f59e0b15';
    }
  };

  return (
    <div style={{ padding: '24px', background: N.base, minHeight: '100vh', color: N.text }}>
      {/* Header */}
      <NeoPageHeader
        title="Dashboard Traffic Manager"
        subtitle="Vista especializada para programación y control"
        icon={Radio}
        backHref="/campanas"
      />

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '24px 0' }}>
        <MetricaCard icono="📋" titulo="Campañas Activas" valor={metricas.campanasActivas} color="#22c55e" tendencia="+3" />
        <MetricaCard icono="📡" titulo="Emisiones Hoy" valor={metricas.emisionesHoy} color="#6888ff" tendencia="+125" />
        <MetricaCard icono="🔥" titulo="Conflictos" valor={metricas.conflictosPendientes} color="#ef4444" tendencia="-2" negativo />
        <MetricaCard icono="🎵" titulo="Materiales Faltantes" valor={metricas.materialesFaltantes} color="#f59e0b" tendencia="-1" negativo />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Conflictos */}
        <NeoCard>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: N.text }}>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            Conflictos Activos ({conflictos.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conflictos.map(c => (
              <div key={c.id} style={{
                background: severidadBg(c.severidad),
                borderRadius: '16px', padding: '16px', border: `1px solid ${severidadColor(c.severidad)}40`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: N.text }}>{c.bloque}</span>
                  <span style={{
                    background: severidadColor(c.severidad),
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: '#fff'
                  }}>
                    {c.severidad.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: N.textSub, fontSize: '14px', marginBottom: '8px' }}>{c.descripcion}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {c.campanas.map(camp => (
                    <span key={camp} style={{
                      background: N.base,
                      padding: '4px 8px', borderRadius: '8px', fontSize: '12px',
                      boxShadow: `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}`,
                      color: N.text
                    }}>{camp}</span>
                  ))}
                </div>
                <NeoButton variant="primary" size="sm" className="mt-3 w-full">
                  Resolver Conflicto
                </NeoButton>
              </div>
            ))}
          </div>
        </NeoCard>

        {/* Materiales Faltantes */}
        <NeoCard>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: N.text }}>
            <Music size={20} style={{ color: '#f59e0b' }} />
            Materiales Faltantes ({materiales.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {materiales.map(m => (
              <div key={m.campanaId} style={{
                background: N.base,
                borderRadius: '16px', padding: '16px',
                boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: N.text }}>{m.campanaNombre}</span>
                  <span style={{ color: m.diasRestantes <= 1 ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                    {m.diasRestantes === 0 ? '⚠️ HOY' : m.diasRestantes === 1 ? '⏰ MAÑANA' : `${m.diasRestantes} días`}
                  </span>
                </div>
                <p style={{ color: N.textSub, fontSize: '14px' }}>{m.codigoSP} • {m.duracion}s</p>
                <NeoButton variant="secondary" size="sm" className="mt-3 w-full">
                  Solicitar Material
                </NeoButton>
              </div>
            ))}
          </div>
        </NeoCard>
      </div>

      {/* Confirmaciones Pendientes */}
      <NeoCard style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: N.text }}>
          <CheckCircle size={20} style={{ color: '#22c55e' }} />
          Confirmaciones Pendientes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {confirmaciones.map(c => (
            <div key={c.id} style={{
              background: N.base, borderRadius: '16px', padding: '16px',
              boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '4px', color: N.text }}>{c.campanaNombre}</p>
                <p style={{ color: N.textSub, fontSize: '14px' }}>{c.cliente} • {c.spotsTotal} spots</p>
              </div>
              <NeoButton variant="primary" size="sm">
                Confirmar ✓
              </NeoButton>
            </div>
          ))}
        </div>
      </NeoCard>
    </div>
  );
}

function MetricaCard({ icono, titulo, valor, color, tendencia, negativo = false }: { icono: string; titulo: string; valor: number; color: string; tendencia: string; negativo?: boolean }) {
  const tendenciaPositiva = tendencia.startsWith('+') ? !negativo : negativo;
  return (
    <NeoCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icono}</span>
        <span style={{ color: N.textSub, fontSize: '14px' }}>{titulo}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: 'bold', color }}>{valor.toLocaleString()}</span>
        <span style={{ color: tendenciaPositiva ? '#22c55e' : '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>
          {tendencia}
        </span>
      </div>
    </NeoCard>
  );
}
