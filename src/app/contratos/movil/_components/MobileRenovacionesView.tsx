/**
 * 🔄 MOBILE: Renovaciones View
 * 
 * Gestión de contratos próximos a renovar.
 * Paridad con desktop: contratos/renovaciones/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  RefreshCw, Clock,
  Phone, Star
} from 'lucide-react';
import { formatCurrency } from '../../_shared/useContratos';

interface ContratoRenovacion {
  id: string;
  cliente: string;
  contrato: string;
  valorActual: number;
  fechaVencimiento: string;
  diasRestantes: number;
  probabilidadRenovacion: number;
  estado: 'vigente' | 'por_vencer' | 'vencido' | 'renovado' | 'perdido';
  ejecutivo: string;
  acciones: string[];
}

const RENOVACIONES_MOCK: ContratoRenovacion[] = [
  { id: 'ren-1', cliente: 'Falabella', contrato: 'CTR-2025-0045', valorActual: 45000000, fechaVencimiento: '2025-03-02', diasRestantes: 3, probabilidadRenovacion: 85, estado: 'por_vencer', ejecutivo: 'Carlos M.', acciones: ['llamar', 'enviar_propuesta'] },
  { id: 'ren-2', cliente: 'Banco Chile', contrato: 'CTR-2025-0067', valorActual: 32000000, fechaVencimiento: '2025-03-05', diasRestantes: 6, probabilidadRenovacion: 72, estado: 'por_vencer', ejecutivo: 'Ana L.', acciones: ['llamar'] },
  { id: 'ren-3', cliente: 'TechCorp', contrato: 'CTR-2025-0089', valorActual: 28000000, fechaVencimiento: '2025-03-10', diasRestantes: 11, probabilidadRenovacion: 92, estado: 'vigente', ejecutivo: 'Pedro R.', acciones: ['enviar_propuesta'] },
  { id: 'ren-4', cliente: 'Ripley', contrato: 'CTR-2025-0034', valorActual: 18000000, fechaVencimiento: '2025-02-20', diasRestantes: -7, probabilidadRenovacion: 45, estado: 'vencido', ejecutivo: 'Carlos M.', acciones: ['llamar', 'descuento'] },
  { id: 'ren-5', cliente: 'LATAM', contrato: 'CTR-2025-0078', valorActual: 55000000, fechaVencimiento: '2025-03-15', diasRestantes: 16, probabilidadRenovacion: 95, estado: 'renovado', ejecutivo: 'Ana L.', acciones: [] },
  { id: 'ren-6', cliente: 'Cencosud', contrato: 'CTR-2025-0056', valorActual: 22000000, fechaVencimiento: '2025-02-25', diasRestantes: -2, probabilidadRenovacion: 30, estado: 'vencido', ejecutivo: 'Pedro R.', acciones: ['llamar', 'descuento'] },
];

type FiltroRen = 'todos' | 'por_vencer' | 'vencido' | 'renovado';

export function MobileRenovacionesView() {
  const [filtro, setFiltro] = useState<FiltroRen>('todos');

  const filtered = RENOVACIONES_MOCK.filter(r => filtro === 'todos' || r.estado === filtro);
  const totalValor = RENOVACIONES_MOCK.reduce((s, r) => s + r.valorActual, 0);
  const enRiesgo = RENOVACIONES_MOCK.filter(r => r.estado === 'vencido' || r.diasRestantes <= 7);
  const tasaRenovacion = Math.round(RENOVACIONES_MOCK.filter(r => r.estado === 'renovado').length / RENOVACIONES_MOCK.length * 100);

  const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
    vigente: { label: 'Vigente', color: 'text-blue-700', bg: 'bg-blue-100' },
    por_vencer: { label: 'Por vencer', color: 'text-amber-700', bg: 'bg-amber-100' },
    vencido: { label: 'Vencido', color: 'text-red-700', bg: 'bg-red-100' },
    renovado: { label: 'Renovado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    perdido: { label: 'Perdido', color: 'text-slate-700', bg: 'bg-slate-100' },
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-5 h-5 text-amber-200" />
          <p className="text-xs font-bold text-amber-200 uppercase tracking-widest">Renovaciones</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-black">{RENOVACIONES_MOCK.length}</p>
            <p className="text-[10px] text-amber-200">Total</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-black">{enRiesgo.length}</p>
            <p className="text-[10px] text-amber-200">En riesgo</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-black">{tasaRenovacion}%</p>
            <p className="text-[10px] text-amber-200">Tasa renov.</p>
          </div>
        </div>
        <p className="text-xs text-amber-100 mt-3">Valor en renovación: {formatCurrency(totalValor)}</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['todos', 'por_vencer', 'vencido', 'renovado'] as FiltroRen[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              filtro === f ? 'bg-amber-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
            }`}>
            {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map(ren => (
          <div key={ren.id} className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-slate-800 text-sm">{ren.cliente}</p>
                <p className="text-[10px] text-slate-400">{ren.contrato} · {ren.ejecutivo}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoConfig[ren.estado]?.bg} ${estadoConfig[ren.estado]?.color}`}>
                {estadoConfig[ren.estado]?.label}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-black text-slate-800">{formatCurrency(ren.valorActual)}</p>
              <span className={`text-xs font-bold flex items-center gap-1 ${ren.diasRestantes <= 0 ? 'text-red-600' : ren.diasRestantes <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                <Clock className="w-3 h-3" />
                {ren.diasRestantes <= 0 ? `Venció hace ${Math.abs(ren.diasRestantes)}d` : `${ren.diasRestantes}d restantes`}
              </span>
            </div>
            {/* PROBABILIDAD */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400">Probabilidad renovación</span>
                <span className={`font-bold ${ren.probabilidadRenovacion >= 70 ? 'text-emerald-600' : ren.probabilidadRenovacion >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{ren.probabilidadRenovacion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${ren.probabilidadRenovacion >= 70 ? 'bg-emerald-500' : ren.probabilidadRenovacion >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${ren.probabilidadRenovacion}%` }} />
              </div>
            </div>
            {/* ACTIONS */}
            {ren.acciones.length > 0 && (
              <div className="flex gap-2">
                {ren.acciones.includes('llamar') && (
                  <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                    <Phone className="w-3.5 h-3.5" /> Llamar
                  </button>
                )}
                {ren.acciones.includes('enviar_propuesta') && (
                  <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                    <RefreshCw className="w-3.5 h-3.5" /> Renovar
                  </button>
                )}
                {ren.acciones.includes('descuento') && (
                  <button className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                    <Star className="w-3.5 h-3.5" /> Descuento
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
