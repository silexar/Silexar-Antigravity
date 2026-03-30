'use client';

import { useState, useEffect } from 'react';

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

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>💰 Dashboard Financiero</h1>
          <p style={{ color: '#94a3b8' }}>Facturación, cobranza y proyecciones</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🧾 Nueva Factura
          </button>
          <button style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid #8b5cf6', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
            📅 Cierre Mes
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricaCard icono="✅" titulo="Facturado Mes" valor={formatCurrency(resumen.facturadoMes)} color="#22c55e" tendencia="+8%" />
        <MetricaCard icono="⏳" titulo="Pendiente Cobro" valor={formatCurrency(resumen.pendienteCobro)} color="#f59e0b" tendencia="-5%" />
        <MetricaCard icono="⚠️" titulo="Morosidad +30d" valor={formatCurrency(resumen.morosidad30)} color="#ef4444" tendencia="-12%" />
        <MetricaCard icono="📈" titulo="Proyección Cierre" valor={formatCurrency(resumen.proyeccionCierre)} color="#8b5cf6" tendencia="+15%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Facturas Pendientes */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📄 Facturas Pendientes de Cobro</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#94a3b8', fontWeight: 'normal' }}>Campaña</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#94a3b8', fontWeight: 'normal' }}>Cliente</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', color: '#94a3b8', fontWeight: 'normal' }}>Monto</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', color: '#94a3b8', fontWeight: 'normal' }}>Días</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', color: '#94a3b8', fontWeight: 'normal' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {facturasPendientes.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 8px' }}>
                    <p style={{ fontWeight: 'bold' }}>{f.campanaNombre}</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>{f.id}</p>
                  </td>
                  <td style={{ padding: '16px 8px' }}>{f.cliente}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(f.monto)}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <span style={{ 
                      background: f.diasPendiente > 30 ? '#ef444420' : f.diasPendiente > 15 ? '#f59e0b20' : '#22c55e20',
                      color: f.diasPendiente > 30 ? '#ef4444' : f.diasPendiente > 15 ? '#f59e0b' : '#22c55e',
                      padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px'
                    }}>
                      {f.diasPendiente}d
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <button style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid #8b5cf6', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Proyección IA */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🤖 Predicción IA Cobranza</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#94a3b8', marginBottom: '8px' }}>Probabilidad cobro 7 días:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #22c55e, #10b981)', borderRadius: '10px' }} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#22c55e' }}>75%</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#94a3b8', marginBottom: '8px' }}>Probabilidad cobro 30 días:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #22c55e, #10b981)', borderRadius: '10px' }} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#22c55e' }}>92%</span>
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>💡 Recomendaciones IA:</p>
            <ul style={{ color: '#94a3b8', fontSize: '14px', paddingLeft: '16px', margin: 0 }}>
              <li style={{ marginBottom: '4px' }}>Enviar recordatorio a BANCO CHILE</li>
              <li style={{ marginBottom: '4px' }}>RIPLEY tiene buen historial, esperar</li>
              <li>FALABELLA requiere seguimiento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricaCard({ icono, titulo, valor, color, tendencia }: { icono: string; titulo: string; valor: string; color: string; tendencia: string }) {
  const positivo = tendencia.startsWith('+') && !titulo.includes('Morosidad');
  const esNegativo = titulo.includes('Morosidad') || titulo.includes('Pendiente');
  const colorTendencia = esNegativo ? (tendencia.startsWith('-') ? '#22c55e' : '#ef4444') : (positivo ? '#22c55e' : '#ef4444');
  
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '20px', border: `1px solid ${color}40` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icono}</span>
        <span style={{ color: '#94a3b8', fontSize: '14px' }}>{titulo}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color }}>{valor}</span>
        <span style={{ color: colorTendencia, fontSize: '14px', fontWeight: 'bold' }}>{tendencia}</span>
      </div>
    </div>
  );
}
