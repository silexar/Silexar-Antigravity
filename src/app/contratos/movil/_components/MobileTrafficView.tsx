/**
 * 🚦 MOBILE: Traffic View
 * 
 * Tráfico comercial de contratos.
 * Paridad con desktop: contratos/traffic/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Activity, TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../_shared/useContratos';

interface TrafficMetric {
  label: string;
  valor: number;
  cambio: number;
  formato: 'numero' | 'moneda' | 'porcentaje';
}

interface FlujoEtapa {
  de: string;
  a: string;
  cantidad: number;
  valor: number;
  tasa: number;
}

const METRICAS: TrafficMetric[] = [
  { label: 'Leads entrantes', valor: 145, cambio: 12, formato: 'numero' },
  { label: 'Contratos generados', valor: 67, cambio: 8, formato: 'numero' },
  { label: 'Valor pipeline', valor: 1250000000, cambio: 15, formato: 'moneda' },
  { label: 'Tasa conversión', valor: 46, cambio: -3, formato: 'porcentaje' },
  { label: 'Ticket promedio', valor: 18650000, cambio: 5, formato: 'moneda' },
  { label: 'Ciclo promedio', valor: 14, cambio: -2, formato: 'numero' },
];

const FLUJOS: FlujoEtapa[] = [
  { de: 'Lead', a: 'Propuesta', cantidad: 145, valor: 1800000000, tasa: 65 },
  { de: 'Propuesta', a: 'Negociación', cantidad: 94, valor: 1250000000, tasa: 72 },
  { de: 'Negociación', a: 'Cierre', cantidad: 67, valor: 890000000, tasa: 78 },
  { de: 'Cierre', a: 'Firmado', cantidad: 52, valor: 720000000, tasa: 85 },
];

const EJECUTIVOS = [
  { nombre: 'Carlos M.', leads: 35, cierres: 15, valor: 280000000, tasa: 43 },
  { nombre: 'Ana L.', leads: 42, cierres: 18, valor: 350000000, tasa: 43 },
  { nombre: 'Pedro R.', leads: 28, cierres: 12, valor: 190000000, tasa: 43 },
  { nombre: 'María S.', leads: 40, cierres: 22, valor: 420000000, tasa: 55 },
];

export function MobileTrafficView() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'trimestre'>('mes');

  const formatVal = (m: TrafficMetric) => {
    if (m.formato === 'moneda') return formatCurrency(m.valor);
    if (m.formato === 'porcentaje') return `${m.valor}%`;
    return m.valor.toString();
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-cyan-200" />
          <p className="text-xs font-bold text-cyan-200 uppercase tracking-widest">Tráfico Comercial</p>
        </div>
        <p className="text-2xl font-black">145 leads → 52 cierres</p>
        <p className="text-xs text-cyan-200 mt-1">Tasa general: 36% · Febrero 2025</p>
      </div>

      {/* PERIOD */}
      <div className="flex gap-2">
        {(['semana', 'mes', 'trimestre'] as const).map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              periodo === p ? 'bg-cyan-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
            }`}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* KPIs GRID */}
      <div className="grid grid-cols-2 gap-3">
        {METRICAS.map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-100 p-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase">{m.label}</p>
            <p className="text-lg font-black text-slate-800 mt-1">{formatVal(m)}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {m.cambio >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={`text-[10px] font-bold ${m.cambio >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.cambio > 0 ? '+' : ''}{m.cambio}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* FUNNEL */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Flujo de Conversión</p>
        <div className="space-y-2">
          {FLUJOS.map(flujo => (
            <div key={flujo.de} className="bg-white rounded-xl border border-slate-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700">{flujo.de}</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className="text-xs font-bold text-slate-700">{flujo.a}</span>
                <span className="ml-auto text-xs font-black text-cyan-600">{flujo.tasa}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${flujo.tasa}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-slate-400">{flujo.cantidad} contratos</span>
                <span className="text-[9px] text-slate-400">{formatCurrency(flujo.valor)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EJECUTIVOS */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Rendimiento Ejecutivos</p>
        <div className="space-y-2">
          {EJECUTIVOS.sort((a, b) => b.valor - a.valor).map((ej, i) => (
            <div key={ej.nombre} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}>#{i + 1}</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-800">{ej.nombre}</p>
                <p className="text-[10px] text-slate-400">{ej.leads} leads → {ej.cierres} cierres</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{formatCurrency(ej.valor)}</p>
                <p className="text-[9px] text-emerald-600 font-bold">{ej.tasa}% conv.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
