/**
 * 📊 MOBILE: Mi Rendimiento
 * 
 * Dashboard personal del ejecutivo: meta, comisiones,
 * ranking, racha, actividad semanal.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import {
  TrendingUp, Target, DollarSign, Award,
  Flame, FileText, ArrowUpRight, ArrowDownRight,
  Calendar,
} from 'lucide-react';

const R = {
  metaMes: 250000000, ventasActuales: 185000000,
  contratosEsteMes: 12, contratosAnterior: 9,
  comisionEstimada: 5550000, comisionAnterior: 4200000,
  ranking: 2, totalEjecutivos: 15,
  rachaDias: 5, mejorRacha: 8,
  tasaCierre: 68, tasaCierreAnt: 62,
  ticketPromedio: 15416667,
  semana: [
    { dia: 'L', v: 25 }, { dia: 'M', v: 0 }, { dia: 'X', v: 45 },
    { dia: 'J', v: 15 }, { dia: 'V', v: 35 },
  ],
};

export function MobileMiRendimientoView() {
  const pct = Math.round((R.ventasActuales / R.metaMes) * 100);
  const maxS = Math.max(...R.semana.map(s => s.v), 1);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Mi Rendimiento</h3>
          <p className="text-xs text-slate-500">Marzo 2025</p>
        </div>
      </div>

      {/* META */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-[10px] font-bold uppercase">Meta Mensual</p>
            <p className="text-3xl font-black">{pct}%</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
              <circle cx="32" cy="32" r="26" stroke="white" strokeWidth="6" fill="none"
                strokeDasharray={`${pct * 1.634} 163.4`} strokeLinecap="round" />
            </svg>
            <Target className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-white/20 text-xs">
          <div><p className="text-indigo-200 text-[10px]">Actual</p><p className="font-bold">${(R.ventasActuales / 1e6).toFixed(0)}M</p></div>
          <div><p className="text-indigo-200 text-[10px]">Meta</p><p className="font-bold">${(R.metaMes / 1e6).toFixed(0)}M</p></div>
          <div><p className="text-indigo-200 text-[10px]">Falta</p><p className="font-bold">${((R.metaMes - R.ventasActuales) / 1e6).toFixed(0)}M</p></div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <MiniKPI icon={<FileText className="w-4 h-4 text-indigo-500" />} label="Contratos" valor={String(R.contratosEsteMes)}
          delta={R.contratosEsteMes - R.contratosAnterior} />
        <MiniKPI icon={<DollarSign className="w-4 h-4 text-emerald-500" />} label="Comisión" valor={`$${(R.comisionEstimada / 1e6).toFixed(1)}M`}
          delta={Number(((R.comisionEstimada - R.comisionAnterior) / 1e6).toFixed(1))} suffix="M" />
        <MiniKPI icon={<Award className="w-4 h-4 text-amber-500" />} label="Ranking" valor={`#${R.ranking}`}
          subtitle={`de ${R.totalEjecutivos}`} />
        <MiniKPI icon={<Flame className="w-4 h-4 text-red-500" />} label="Racha" valor={`${R.rachaDias}d`}
          subtitle={`Mejor: ${R.mejorRacha}d`} />
      </div>

      {/* SEMANA */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-3">
          <Calendar className="w-3 h-3 text-indigo-500" /> Esta semana
        </p>
        <div className="flex items-end gap-2 h-20">
          {R.semana.map(d => (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-indigo-400"
                style={{ height: `${d.v > 0 ? Math.max((d.v / maxS) * 100, 10) : 4}%` }} />
              <span className="text-[9px] font-bold text-slate-500">{d.dia}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] text-slate-400">Tasa Cierre</p>
          <div className="flex items-end gap-1 mt-0.5">
            <p className="text-xl font-black text-slate-800">{R.tasaCierre}%</p>
            <span className={`text-[9px] font-bold ${R.tasaCierre > R.tasaCierreAnt ? 'text-emerald-500' : 'text-red-500'}`}>
              {R.tasaCierre > R.tasaCierreAnt ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
              {Math.abs(R.tasaCierre - R.tasaCierreAnt)}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] text-slate-400">Ticket Promedio</p>
          <p className="text-xl font-black text-slate-800 mt-0.5">${(R.ticketPromedio / 1e6).toFixed(1)}M</p>
        </div>
      </div>
    </div>
  );
}

function MiniKPI({ icon, label, valor, delta, subtitle, suffix }: {
  icon: React.ReactNode; label: string; valor: string;
  delta?: number; subtitle?: string; suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] text-slate-400">{label}</span></div>
      <p className="text-xl font-black text-slate-800">{valor}</p>
      {delta !== undefined && (
        <span className={`text-[9px] font-bold ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {delta >= 0 ? '+' : ''}{delta}{suffix || ''}
        </span>
      )}
      {subtitle && <p className="text-[9px] text-slate-400">{subtitle}</p>}
    </div>
  );
}
