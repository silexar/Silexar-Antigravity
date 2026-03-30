/**
 * 🧾 MOBILE: Facturación View
 * 
 * Emisión y consulta de facturas. Paridad con desktop: contratos/facturacion/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  FileText, Plus, Search, CheckCircle2, Clock,
  AlertTriangle, Download, Send, Eye
} from 'lucide-react';
import { formatCurrency } from '../../_shared/useContratos';

interface Factura {
  id: string;
  numero: string;
  cliente: string;
  contrato: string;
  monto: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'emitida' | 'enviada' | 'pagada' | 'vencida' | 'anulada';
}

const FACTURAS_MOCK: Factura[] = [
  { id: 'f-1', numero: 'F-2025-0234', cliente: 'Falabella', contrato: 'CTR-0045', monto: 12500000, fechaEmision: '2025-02-01', fechaVencimiento: '2025-03-01', estado: 'enviada' },
  { id: 'f-2', numero: 'F-2025-0228', cliente: 'Banco Chile', contrato: 'CTR-0067', monto: 8900000, fechaEmision: '2025-01-28', fechaVencimiento: '2025-02-28', estado: 'pagada' },
  { id: 'f-3', numero: 'F-2025-0210', cliente: 'TechCorp', contrato: 'CTR-0089', monto: 6700000, fechaEmision: '2025-01-20', fechaVencimiento: '2025-02-20', estado: 'vencida' },
  { id: 'f-4', numero: 'F-2025-0195', cliente: 'Ripley', contrato: 'CTR-0034', monto: 15800000, fechaEmision: '2025-01-15', fechaVencimiento: '2025-02-15', estado: 'pagada' },
  { id: 'f-5', numero: 'F-2025-0240', cliente: 'LATAM', contrato: 'CTR-0078', monto: 22000000, fechaEmision: '2025-02-05', fechaVencimiento: '2025-03-05', estado: 'emitida' },
];

type FiltroFactura = 'todas' | 'emitida' | 'enviada' | 'pagada' | 'vencida';

export function MobileFacturacionView() {
  const [filtro, setFiltro] = useState<FiltroFactura>('todas');
  const [busqueda, setBusqueda] = useState('');

  const filtered = FACTURAS_MOCK
    .filter(f => filtro === 'todas' || f.estado === filtro)
    .filter(f => !busqueda || f.cliente.toLowerCase().includes(busqueda.toLowerCase()) || f.numero.includes(busqueda));

  const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    emitida: { label: 'Emitida', color: 'text-blue-700', bg: 'bg-blue-100', icon: <FileText className="w-4 h-4" /> },
    enviada: { label: 'Enviada', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: <Send className="w-4 h-4" /> },
    pagada: { label: 'Pagada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <CheckCircle2 className="w-4 h-4" /> },
    vencida: { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-100', icon: <AlertTriangle className="w-4 h-4" /> },
    anulada: { label: 'Anulada', color: 'text-slate-700', bg: 'bg-slate-100', icon: <Clock className="w-4 h-4" /> },
  };

  const totalEmitido = FACTURAS_MOCK.reduce((s, f) => s + f.monto, 0);
  const totalPagado = FACTURAS_MOCK.filter(f => f.estado === 'pagada').reduce((s, f) => s + f.monto, 0);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-xl">
        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Facturación</p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-2xl font-black">{formatCurrency(totalEmitido)}</p>
            <p className="text-xs text-indigo-200">Total emitido</p>
          </div>
          <div>
            <p className="text-2xl font-black">{formatCurrency(totalPagado)}</p>
            <p className="text-xs text-indigo-200">Cobrado</p>
          </div>
        </div>
      </div>

      {/* NEW BUTTON */}
      <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-200">
        <Plus className="w-5 h-5" /> Nueva Factura
      </button>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar factura o cliente..."
          aria-label="Buscar factura o cliente"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['todas', 'emitida', 'enviada', 'pagada', 'vencida'] as FiltroFactura[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              filtro === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
            }`}>
            {f === 'todas' ? 'Todas' : estadoConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map(factura => (
          <div key={factura.id} className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${estadoConfig[factura.estado]?.bg} ${estadoConfig[factura.estado]?.color}`}>
                  {estadoConfig[factura.estado]?.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{factura.numero}</p>
                  <p className="text-[10px] text-slate-400">{factura.cliente} · {factura.contrato}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoConfig[factura.estado]?.bg} ${estadoConfig[factura.estado]?.color}`}>
                {estadoConfig[factura.estado]?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-black text-slate-800">{formatCurrency(factura.monto)}</p>
              <div className="flex gap-2">
                <button aria-label="Ver" className="p-2 rounded-lg bg-slate-50 active:scale-90"><Eye className="w-4 h-4 text-slate-500" /></button>
                <button aria-label="Descargar" className="p-2 rounded-lg bg-slate-50 active:scale-90"><Download className="w-4 h-4 text-slate-500" /></button>
                {factura.estado === 'emitida' && (
                  <button aria-label="Enviar" className="p-2 rounded-lg bg-indigo-50 active:scale-90"><Send className="w-4 h-4 text-indigo-500" /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
