/**
 * 🧾 Facturación de Campaña — Neumórfico TIER 0
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, DollarSign, Calendar, Download, CheckCircle, Clock,
  AlertTriangle, CreditCard, Mail, Building, Sparkles, RefreshCw, Eye, Receipt
} from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, N } from '../_lib/neumorphic';

const facturacionCampana = {
  campanaId: 'CMP-25-001',
  campanaNombre: 'Promoción Navidad Premium 2025',
  anunciante: 'BANCO DE CHILE',
  rut: '97.004.000-5',
  configuracion: {
    estiloFacturacion: 'posterior',
    facturacionPor: 'mensual',
    diasPago: 30,
    codigoFiscal: 19,
    direccion: 'anunciante',
    numeroDeudor: 1234,
    esCooperativa: false
  },
  facturas: [
    {
      id: 'FAC-001', numero: 'F-2025-00145', estado: 'emitida',
      fechaEmision: '2025-12-01', fechaVencimientos: '2025-12-31',
      periodo: '01-15 Dic 2025', montoNeto: 1200000, iva: 228000, total: 1428000, siiStatus: 'aceptado'
    },
    {
      id: 'FAC-002', numero: 'F-2025-00189', estado: 'pendiente',
      fechaEmision: '2025-12-16', fechaVencimientos: '2026-01-15',
      periodo: '16-31 Dic 2025', montoNeto: 1100000, iva: 209000, total: 1309000, siiStatus: 'pendiente'
    }
  ],
  resumen: {
    totalFacturado: 2737000, pendientePago: 1309000,
    diasPromedioCobranza: 28, morosidad: 0
  },
  prediccionIA: {
    fechaPagoEstimada: '2025-12-28', probabilidadPagoATiempo: 95,
    riesgoMorosidad: 'bajo', recomendacion: 'Cliente puntual, mantener condiciones actuales'
  }
};

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CL')}`;

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    emitida: { color: '#3b82f6', icon: CheckCircle },
    pendiente: { color: '#f59e0b', icon: Clock },
    pagada: { color: '#22c55e', icon: CheckCircle },
    vencida: { color: '#ef4444', icon: AlertTriangle },
    anulada: { color: '#9aa3b8', icon: AlertTriangle }
  };
  const { color, icon: Icon } = config[estado] || config.pendiente;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
      style={{ background: `${color}15`, color }}>
      <Icon className="w-3 h-3" /> {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

const SIIBadge = ({ status }: { status: string }) => {
  if (status === 'aceptado') return <span className="text-emerald-600 text-xs font-bold">✅ SII OK</span>;
  if (status === 'rechazado') return <span className="text-red-600 text-xs font-bold">❌ SII Rechazado</span>;
  return <span className="text-amber-600 text-xs font-bold">⏳ Pendiente SII</span>;
};

export default function FacturacionCampanaPage() {
  const router = useRouter();
  const [estiloFacturacion, setEstiloFacturacion] = useState(facturacionCampana.configuracion.estiloFacturacion);
  const [facturacionPor, setFacturacionPor] = useState(facturacionCampana.configuracion.facturacionPor);
  const [creandoFactura, setCreandoFactura] = useState(false);

  const crearFactura = async () => {
    setCreandoFactura(true);
    await new Promise(r => setTimeout(r, 2000));
    setCreandoFactura(false);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-[1400px] mx-auto space-y-5">
        <NeoPageHeader
          title="Facturación de Campaña"
          subtitle={`${facturacionCampana.campanaNombre} • ${facturacionCampana.anunciante}`}
          icon={Receipt}
          backHref="/campanas"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NeoCard padding="small">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                <DollarSign className="w-5 h-5" style={{ color: N.accent }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Total Facturado</p>
                <p className="text-lg font-black" style={{ color: N.text }}>{formatCurrency(facturacionCampana.resumen.totalFacturado)}</p>
              </div>
            </div>
          </NeoCard>
          <NeoCard padding="small">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Pendiente Pago</p>
                <p className="text-lg font-black" style={{ color: N.text }}>{formatCurrency(facturacionCampana.resumen.pendientePago)}</p>
              </div>
            </div>
          </NeoCard>
          <NeoCard padding="small">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                <Calendar className="w-5 h-5" style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Días Promedio Cobro</p>
                <p className="text-lg font-black" style={{ color: N.text }}>{facturacionCampana.resumen.diasPromedioCobranza}</p>
              </div>
            </div>
          </NeoCard>
          <NeoCard padding="small">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                <Sparkles className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Predicción IA</p>
                <p className="text-sm font-black" style={{ color: '#a855f7' }}>{facturacionCampana.prediccionIA.probabilidadPagoATiempo}% a tiempo</p>
              </div>
            </div>
          </NeoCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Configuración */}
          <NeoCard>
            <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
              <CreditCard className="w-4 h-4" style={{ color: N.accent }} />
              Opciones de Facturación
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Estilo de Facturación</label>
                <select value={estiloFacturacion} onChange={e => setEstiloFacturacion(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:outline-none"
                  style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}>
                  <option value="posterior">Factura a Posteriori</option>
                  <option value="inmediata">Factura Inmediata</option>
                  <option value="intercambio">Intercambio (Canje)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Facturación Por</label>
                <select value={facturacionPor} onChange={e => setFacturacionPor(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:outline-none"
                  style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}>
                  <option value="mensual">Una línea por mes</option>
                  <option value="global">Global por campaña</option>
                  <option value="por_linea">Por línea específica</option>
                </select>
              </div>
              <div className="p-3 rounded-xl space-y-2" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: N.textSub }}>Días de Pago</span>
                  <span className="font-bold" style={{ color: N.text }}>{facturacionCampana.configuracion.diasPago} días</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: N.textSub }}>IVA</span>
                  <span className="font-bold" style={{ color: N.text }}>{facturacionCampana.configuracion.codigoFiscal}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: N.textSub }}>N° Deudor</span>
                  <span className="font-bold" style={{ color: N.text }}>{facturacionCampana.configuracion.numeroDeudor}</span>
                </div>
              </div>
            </div>
          </NeoCard>

          {/* Datos cliente */}
          <NeoCard>
            <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
              <Building className="w-4 h-4" style={{ color: N.accent }} />
              Datos del Cliente
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Razón Social</p>
                <p className="font-bold text-sm" style={{ color: N.text }}>{facturacionCampana.anunciante}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>RUT</p>
                <p className="font-bold text-sm" style={{ color: N.text }}>{facturacionCampana.rut}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Dirección Facturación</p>
                <p className="font-bold text-sm capitalize" style={{ color: N.text }}>{facturacionCampana.configuracion.direccion}</p>
              </div>
            </div>
          </NeoCard>

          {/* Predicción IA */}
          <NeoCard>
            <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
              <Sparkles className="w-4 h-4" style={{ color: '#a855f7' }} />
              Análisis IA Cobranza
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: N.textSub }}>Fecha Pago Estimada</span>
                <span className="font-bold" style={{ color: '#a855f7' }}>{facturacionCampana.prediccionIA.fechaPagoEstimada}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: N.textSub }}>Prob. Pago a Tiempo</span>
                <span className="font-bold" style={{ color: '#22c55e' }}>{facturacionCampana.prediccionIA.probabilidadPagoATiempo}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: N.textSub }}>Riesgo Morosidad</span>
                <span className={`font-bold ${facturacionCampana.prediccionIA.riesgoMorosidad === 'bajo' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {facturacionCampana.prediccionIA.riesgoMorosidad.toUpperCase()}
                </span>
              </div>
              <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                <p className="text-xs" style={{ color: N.text }}>{facturacionCampana.prediccionIA.recomendacion}</p>
              </div>
            </div>
          </NeoCard>
        </div>

        {/* Lista de facturas */}
        <NeoCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
              <FileText className="w-4 h-4" style={{ color: N.accent }} />
              Facturas Generadas
            </h3>
            <NeoButton variant="primary" onClick={crearFactura} disabled={creandoFactura}>
              {creandoFactura ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Crear Factura
            </NeoButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${N.dark}40` }}>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>N° Factura</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Estado</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Período</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Emisión</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Vencimientos</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Neto</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Total</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>SII</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturacionCampana.facturas.map(f => (
                  <tr key={f.id} style={{ borderBottom: `1px solid ${N.dark}30` }}>
                    <td className="px-3 py-3 font-mono font-bold" style={{ color: N.accent }}>{f.numero}</td>
                    <td className="px-3 py-3"><EstadoBadge estado={f.estado} /></td>
                    <td className="px-3 py-3" style={{ color: N.text }}>{f.periodo}</td>
                    <td className="px-3 py-3" style={{ color: N.text }}>{f.fechaEmision}</td>
                    <td className="px-3 py-3" style={{ color: N.text }}>{f.fechaVencimientos}</td>
                    <td className="px-3 py-3" style={{ color: N.text }}>{formatCurrency(f.montoNeto)}</td>
                    <td className="px-3 py-3 font-bold" style={{ color: N.text }}>{formatCurrency(f.total)}</td>
                    <td className="px-3 py-3"><SIIBadge status={f.siiStatus} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <NeoButton variant="ghost" size="icon" title="Ver"><Eye className="w-4 h-4" /></NeoButton>
                        <NeoButton variant="ghost" size="icon" title="Descargar"><Download className="w-4 h-4" /></NeoButton>
                        <NeoButton variant="ghost" size="icon" title="Enviar"><Mail className="w-4 h-4" /></NeoButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
