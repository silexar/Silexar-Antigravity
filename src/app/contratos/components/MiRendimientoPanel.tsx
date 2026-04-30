/**
 * ?? DESKTOP: Panel Mi Rendimiento
 * 
 * Dashboard ejecutivo personalizado con: meta mensual vs real,
 * contratos cerrados, comisiones, ranking, racha de ventas.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import {
  TrendingUp, Target, DollarSign, Award,
  Flame, FileText, ArrowUpRight, ArrowDownRight,
  Calendar,
} from 'lucide-react';

const RENDIMIENTO = {
  metaMes: 250000000,
  ventasActuales: 185000000,
  contratosEsteMes: 12,
  contratosAnterior: 9,
  comisionEstimada: 5550000,
  comisionAnterior: 4200000,
  ranking: 2,
  totalEjecutivos: 15,
  rachaDias: 5,
  mejorRacha: 8,
  tasaCierre: 68,
  tasaCierreAnterior: 62,
  ticketPromedio: 15416667,
  contratosSemana: [
    { dia: 'Lun', valor: 25000000 },
    { dia: 'Mar', valor: 0 },
    { dia: 'Mi�', valor: 45000000 },
    { dia: 'Jue', valor: 15000000 },
    { dia: 'Vie', valor: 35000000 },
  ],
};

export function MiRendimientoPanel() {
  const porcentajeMeta = Math.round((RENDIMIENTO.ventasActuales / RENDIMIENTO.metaMes) * 100);
  const deltaContratos = RENDIMIENTO.contratosEsteMes - RENDIMIENTO.contratosAnterior;
  const deltaComision = RENDIMIENTO.comisionEstimada - RENDIMIENTO.comisionAnterior;
  const maxSemana = Math.max(...RENDIMIENTO.contratosSemana.map(c => c.valor), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#6888ff] shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#69738c]">Mi Rendimiento</h2>
          <p className="text-sm text-[#9aa3b8]">Per�odo: Marzo 2025</p>
        </div>
      </div>

      {/* META MENSUAL */}
      <div className="bg-[#6888ff] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Meta Mensual</p>
            <p className="text-3xl font-black mt-1">{porcentajeMeta}%</p>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <circle cx="40" cy="40" r="34" stroke="white" strokeWidth="8" fill="none"
                strokeDasharray={`${porcentajeMeta * 2.136} 213.6`} strokeLinecap="round" />
            </svg>
            <Target className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs text-white/70">Actual</p>
            <p className="font-bold">${(RENDIMIENTO.ventasActuales / 1000000).toFixed(0)}M</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Meta</p>
            <p className="font-bold">${(RENDIMIENTO.metaMes / 1000000).toFixed(0)}M</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Restante</p>
            <p className="font-bold">${((RENDIMIENTO.metaMes - RENDIMIENTO.ventasActuales) / 1000000).toFixed(0)}M</p>
          </div>
        </div>
      </div>

      {/* KPIs GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<FileText className="w-5 h-5 text-[#6888ff]" />} label="Contratos" valor={String(RENDIMIENTO.contratosEsteMes)}
          delta={deltaContratos} deltaLabel="vs mes anterior" />
        <KPICard icon={<DollarSign className="w-5 h-5 text-[#6888ff]" />} label="Comisi�n" valor={`$${(RENDIMIENTO.comisionEstimada / 1000000).toFixed(1)}M`}
          delta={deltaComision / 1000000} deltaLabel="vs mes anterior" prefix="$" suffix="M" />
        <KPICard icon={<Award className="w-5 h-5 text-[#6888ff]" />} label="Ranking" valor={`#${RENDIMIENTO.ranking}`}
          subtitle={`de ${RENDIMIENTO.totalEjecutivos} ejecutivos`} />
        <KPICard icon={<Flame className="w-5 h-5 text-[#9aa3b8]" />} label="Racha" valor={`${RENDIMIENTO.rachaDias} d�as`}
          subtitle={`Mejor: ${RENDIMIENTO.mejorRacha} d�as`} />
      </div>

      {/* ACTIVIDAD SEMANAL */}
      <div className="neo-card rounded-2xl p-5">
        <h3 className="font-bold text-sm text-[#69738c] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#6888ff]" /> Actividad esta semana
        </h3>
        <div className="flex items-end gap-3 h-28">
          {RENDIMIENTO.contratosSemana.map(d => (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-[#6888ff] transition-all"
                style={{ height: `${d.valor > 0 ? Math.max((d.valor / maxSemana) * 100, 8) : 4}%` }} />
              <span className="text-[10px] font-bold text-[#9aa3b8]">{d.dia}</span>
              {d.valor > 0 && <span className="text-[9px] text-[#9aa3b8]">${(d.valor / 1000000).toFixed(0)}M</span>}
            </div>
          ))}
        </div>
      </div>

      {/* M�TRICAS ADICIONALES */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] p-4 shadow-sm">
          <p className="text-xs text-[#9aa3b8]">Tasa de Cierre</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-black text-[#69738c]">{RENDIMIENTO.tasaCierre}%</p>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${RENDIMIENTO.tasaCierre > RENDIMIENTO.tasaCierreAnterior ? 'text-[#6888ff]' : 'text-[#9aa3b8]'}`}>
              {RENDIMIENTO.tasaCierre > RENDIMIENTO.tasaCierreAnterior ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(RENDIMIENTO.tasaCierre - RENDIMIENTO.tasaCierreAnterior)}%
            </span>
          </div>
        </div>
        <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] p-4 shadow-sm">
          <p className="text-xs text-[#9aa3b8]">Ticket Promedio</p>
          <p className="text-2xl font-black text-[#69738c] mt-1">${(RENDIMIENTO.ticketPromedio / 1000000).toFixed(1)}M</p>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, valor, delta, deltaLabel, subtitle, prefix, suffix }: {
  icon: React.ReactNode; label: string; valor: string;
  delta?: number; deltaLabel?: string; subtitle?: string;
  prefix?: string; suffix?: string;
}) {
  return (
    <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-[#9aa3b8]">{label}</span></div>
      <p className="text-2xl font-black text-[#69738c]">{valor}</p>
      {delta !== undefined && (
        <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${delta >= 0 ? 'text-[#6888ff]' : 'text-[#9aa3b8]'}`}>
          {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {delta >= 0 ? '+' : ''}{prefix || ''}{typeof delta === 'number' ? (Number.isInteger(delta) ? delta : delta.toFixed(1)) : delta}{suffix || ''} {deltaLabel}
        </span>
      )}
      {subtitle && <p className="text-[10px] text-[#9aa3b8] mt-1">{subtitle}</p>}
    </div>
  );
}
