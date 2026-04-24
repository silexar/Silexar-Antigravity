'use client';

import { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoBadge, NeoTable, NeoTableHead, NeoTableHeader, NeoTableRow, NeoTableCell, N } from '../_lib/neumorphic';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD FINANCIERO - Vista para Controller
// ═══════════════════════════════════════════════════════════════

interface FacturaPendiente {
  id: string;
  campanaId: string;
  campanaNombre: string;
  cliente: string;
  monto: number;
  fechaEmision: Date;
  diasPendiente: number;
}

interface ResumenFacturacion {
  facturadoMes: number;
  pendienteCobro: number;
  morosidad30: number;
  proyeccionCierre: number;
}

export default function DashboardFinanciero() {
  const [facturasPendientes, setFacturasPendientes] = useState<FacturaPendiente[]>([]);
  const [resumen] = useState<ResumenFacturacion>({
    facturadoMes: 98000000,
    pendienteCobro: 27000000,
    morosidad30: 8500000,
    proyeccionCierre: 125000000
  });

  useEffect(() => {
    setFacturasPendientes([
      { id: 'FAC-001', campanaId: 'CMP-25-001', campanaNombre: 'BANCO CHILE Navidad', cliente: 'BANCO DE CHILE', monto: 45000000, fechaEmision: new Date(Date.now() - 30 * 86400000), diasPendiente: 30 },
      { id: 'FAC-002', campanaId: 'CMP-25-002', campanaNombre: 'RIPLEY Black Friday', cliente: 'RIPLEY CHILE', monto: 12000000, fechaEmision: new Date(Date.now() - 15 * 86400000), diasPendiente: 15 },
      { id: 'FAC-003', campanaId: 'CMP-25-003', campanaNombre: 'FALABELLA Cyber', cliente: 'FALABELLA', monto: 8500000, fechaEmision: new Date(Date.now() - 7 * 86400000), diasPendiente: 7 },
    ]);
  }, []);

  const formatCurrency = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  const diasColor = (dias: number) => {
    if (dias > 30) return 'red' as const;
    if (dias > 15) return 'yellow' as const;
    return 'green' as const;
  };

  return (
    <div style={{ padding: '24px', background: N.base, minHeight: '100vh', color: N.text }}>
      <div className="mb-6">
        <NeoPageHeader
          title="Dashboard Financiero"
          subtitle="Facturación, cobranza y proyecciones"
          icon={Landmark}
          backHref="/campanas"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-3 mb-6">
        <NeoButton variant="primary">🧾 Nueva Factura</NeoButton>
        <NeoButton variant="secondary">📅 Cierre Mes</NeoButton>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricaCard icono="✅" titulo="Facturado Mes" valor={formatCurrency(resumen.facturadoMes)} color="#22c55e" tendencia="+8%" />
        <MetricaCard icono="⏳" titulo="Pendiente Cobro" valor={formatCurrency(resumen.pendienteCobro)} color="#f59e0b" tendencia="-5%" />
        <MetricaCard icono="⚠️" titulo="Morosidad +30d" valor={formatCurrency(resumen.morosidad30)} color="#ef4444" tendencia="-12%" />
        <MetricaCard icono="📈" titulo="Proyección Cierre" valor={formatCurrency(resumen.proyeccionCierre)} color="#a855f7" tendencia="+15%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Facturas Pendientes */}
        <NeoCard>
          <h2 className="text-lg font-black mb-4" style={{ color: N.text }}>📄 Facturas Pendientes de Cobro</h2>
          <NeoTable>
            <NeoTableHead>
              <NeoTableHeader>Campaña</NeoTableHeader>
              <NeoTableHeader>Cliente</NeoTableHeader>
              <NeoTableHeader className="text-right">Monto</NeoTableHeader>
              <NeoTableHeader className="text-center">Días</NeoTableHeader>
              <NeoTableHeader className="text-center">Acción</NeoTableHeader>
            </NeoTableHead>
            <tbody>
              {facturasPendientes.map(f => (
                <NeoTableRow key={f.id}>
                  <NeoTableCell>
                    <p className="font-bold" style={{ color: N.text }}>{f.campanaNombre}</p>
                    <p className="text-[10px] font-bold uppercase" style={{ color: N.textSub }}>{f.id}</p>
                  </NeoTableCell>
                  <NeoTableCell style={{ color: N.text }}>{f.cliente}</NeoTableCell>
                  <NeoTableCell className="text-right font-bold" style={{ color: N.text }}>{formatCurrency(f.monto)}</NeoTableCell>
                  <NeoTableCell className="text-center">
                    <NeoBadge color={diasColor(f.diasPendiente)}>{f.diasPendiente}d</NeoBadge>
                  </NeoTableCell>
                  <NeoTableCell className="text-center">
                    <NeoButton variant="secondary" size="sm">Gestionar</NeoButton>
                  </NeoTableCell>
                </NeoTableRow>
              ))}
            </tbody>
          </NeoTable>
        </NeoCard>

        {/* Proyección IA */}
        <NeoCard style={{ border: `1px solid ${N.accent}30` }}>
          <h2 className="text-lg font-black mb-4" style={{ color: N.text }}>🤖 Predicción IA Cobranza</h2>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase mb-2" style={{ color: N.textSub }}>Probabilidad cobro 7 días:</p>
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`, borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#22c55e', borderRadius: '10px' }} />
              </div>
              <span className="text-sm font-black" style={{ color: '#22c55e' }}>75%</span>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase mb-2" style={{ color: N.textSub }}>Probabilidad cobro 30 días:</p>
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`, borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: '#22c55e', borderRadius: '10px' }} />
              </div>
              <span className="text-sm font-black" style={{ color: '#22c55e' }}>92%</span>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}`, border: `1px solid ${N.accent}30` }}>
            <p className="font-bold mb-2" style={{ color: N.text }}>💡 Recomendaciones IA:</p>
            <ul className="text-xs font-bold space-y-1 pl-4" style={{ color: N.textSub, listStyleType: 'disc' }}>
              <li>Enviar recordatorio a BANCO CHILE</li>
              <li>RIPLEY tiene buen historial, esperar</li>
              <li>FALABELLA requiere seguimiento</li>
            </ul>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}

function MetricaCard({ icono, titulo, valor, color, tendencia }: { icono: string; titulo: string; valor: string; color: string; tendencia: string }) {
  const positivo = tendencia.startsWith('+') && !titulo.includes('Morosidad');
  const esNegativo = titulo.includes('Morosidad') || titulo.includes('Pendiente');
  const colorTendencia = esNegativo ? (tendencia.startsWith('-') ? '#22c55e' : '#ef4444') : (positivo ? '#22c55e' : '#ef4444');

  return (
    <NeoCard style={{ border: `1px solid ${color}40` }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icono}</span>
        <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>{titulo}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black" style={{ color }}>{valor}</span>
        <span className="text-sm font-bold" style={{ color: colorTendencia }}>{tendencia}</span>
      </div>
    </NeoCard>
  );
}
