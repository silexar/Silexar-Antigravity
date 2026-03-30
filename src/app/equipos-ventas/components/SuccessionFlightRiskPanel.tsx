/**
 * COMPONENT: SUCCESSION & FLIGHT RISK PANEL
 *
 * @description Panel combinado de sucesión de roles críticos
 * y predicción de flight risk con factores, acciones y prioridades.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import {
  ShieldAlert, UserCheck, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, DollarSign, Users, Clock,
  ArrowRight, Target, ChevronRight
} from 'lucide-react';

/* ─── MOCK DATA ────────────────────────────────────────────────────── */

const FLIGHT_RISKS = [
  {
    vendedorId: '1', nombre: 'Carolina Mendez', rol: 'Senior KAM',
    riskScore: 78, riskLevel: 'HIGH', tendencia: 'INCREASING',
    factoresTop: [
      { categoria: 'COMPENSACION', score: 85, detalle: 'Below market 15% for senior KAM' },
      { categoria: 'CRECIMIENTO', score: 72, detalle: 'Passed over for VP promotion' },
    ],
    impacto: 'CRITICAL', arrEnRiesgo: 520000, accountsEnRiesgo: 5,
    accionesPendientes: 2, accionesCompletadas: 1,
  },
  {
    vendedorId: '2', nombre: 'Felipe Araya', rol: 'Enterprise AE',
    riskScore: 62, riskLevel: 'MEDIUM', tendencia: 'STABLE',
    factoresTop: [
      { categoria: 'ENGAGEMENT', score: 68, detalle: 'Low participation in team events' },
      { categoria: 'MERCADO', score: 55, detalle: 'LinkedIn profile recently updated' },
    ],
    impacto: 'HIGH', arrEnRiesgo: 310000, accountsEnRiesgo: 3,
    accionesPendientes: 1, accionesCompletadas: 0,
  },
  {
    vendedorId: '3', nombre: 'Lucia Rojas', rol: 'AE',
    riskScore: 45, riskLevel: 'MEDIUM', tendencia: 'DECREASING',
    factoresTop: [
      { categoria: 'PERFORMANCE', score: 50, detalle: 'Missed quota 2 consecutive quarters' },
    ],
    impacto: 'MEDIUM', arrEnRiesgo: 180000, accountsEnRiesgo: 2,
    accionesPendientes: 0, accionesCompletadas: 2,
  },
];

const SUCCESSION_PLANS = [
  {
    rolCritico: 'VP Sales - Enterprise',
    titular: 'Carlos Mora',
    prioridad: 'CRITICA',
    razon: 'Retirement in 18 months',
    candidatos: [
      { nombre: 'Ana Garcia', readiness: 87, gaps: ['P&L management'], timeline: '6 months' },
      { nombre: 'Roberto Silva', readiness: 72, gaps: ['Executive leadership', 'Board reporting'], timeline: '12 months' },
    ],
  },
  {
    rolCritico: 'Director KAM',
    titular: 'Patricia Lagos',
    prioridad: 'ALTA',
    razon: 'Potential flight risk',
    candidatos: [
      { nombre: 'Carolina Mendez', readiness: 78, gaps: ['Team management'], timeline: '9 months' },
      { nombre: 'Diego Fuentes', readiness: 65, gaps: ['Strategic planning', 'C-suite engagement'], timeline: '18 months' },
    ],
  },
];

/* ─── HELPERS ─────────────────────────────────────────────────────── */

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1_000)}K`;

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'INCREASING') return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'DECREASING') return <TrendingDown size={12} className="text-emerald-400" />;
  return <Minus size={12} className="text-slate-500" />;
};

const riskColor = (level: string) => {
  const map: Record<string, string> = {
    CRITICAL: 'text-red-400', HIGH: 'text-red-400', MEDIUM: 'text-amber-400', LOW: 'text-emerald-400'
  };
  return map[level] || 'text-slate-400';
};

const riskBg = (level: string) => {
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-500/10 border-red-500/20', HIGH: 'bg-red-500/5 border-red-500/15',
    MEDIUM: 'bg-amber-500/5 border-amber-500/15', LOW: 'bg-slate-800/50 border-slate-700/30'
  };
  return map[level] || '';
};

const prioridadColor = (p: string) => {
  const map: Record<string, string> = {
    CRITICA: 'bg-red-500/20 text-red-300', ALTA: 'bg-amber-500/20 text-amber-300',
    MEDIA: 'bg-blue-500/20 text-blue-300', BAJA: 'bg-slate-600/20 text-slate-400'
  };
  return map[p] || '';
};

/* ─── COMPONENT ───────────────────────────────────────────────────── */

export function SuccessionFlightRiskPanel() {
  const [activeTab, setActiveTab] = useState<'flight' | 'succession'>('flight');

  const totalARRRiesgo = FLIGHT_RISKS.reduce((s, r) => s + r.arrEnRiesgo, 0);
  const highRisk = FLIGHT_RISKS.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('flight')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'flight'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldAlert size={14} /> Flight Risk
            {highRisk > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{highRisk}</span>}
          </button>
          <button
            onClick={() => setActiveTab('succession')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'succession'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserCheck size={14} /> Succession Planning
          </button>
        </div>
        {activeTab === 'flight' && (
          <span className="text-[10px] text-slate-500">
            ARR at Risk: <span className="font-bold text-red-400">{fmt(totalARRRiesgo)}</span>
          </span>
        )}
      </div>

      {/* ── FLIGHT RISK TAB ── */}
      {activeTab === 'flight' && (
        <div className="space-y-3">
          {FLIGHT_RISKS.map(risk => (
            <div key={risk.vendedorId} className={`rounded-xl border p-4 transition-all ${riskBg(risk.riskLevel)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    risk.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {risk.riskScore}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{risk.nombre}</p>
                    <p className="text-[10px] text-slate-500">{risk.rol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                      <TrendIcon trend={risk.tendencia} />
                      <span className={riskColor(risk.riskLevel)}>{risk.riskLevel}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Impact: {risk.impacto}</p>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-1.5 mb-3">
                {risk.factoresTop.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500 w-24 flex-shrink-0">{f.categoria}</span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.score >= 70 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                    <span className="text-slate-400 flex-1 min-w-0 truncate">{f.detalle}</span>
                  </div>
                ))}
              </div>

              {/* Impact + Actions */}
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-700/30">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-red-400">
                    <DollarSign size={10} /> {fmt(risk.arrEnRiesgo)} ARR at risk
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Users size={10} /> {risk.accountsEnRiesgo} accounts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {risk.accionesPendientes > 0 && (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Clock size={10} /> {risk.accionesPendientes} pending
                    </span>
                  )}
                  {risk.accionesCompletadas > 0 && (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle size={10} /> {risk.accionesCompletadas} done
                    </span>
                  )}
                  <button className="p-1 rounded bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SUCCESSION TAB ── */}
      {activeTab === 'succession' && (
        <div className="space-y-4">
          {SUCCESSION_PLANS.map((plan, i) => (
            <div key={i} className="bg-slate-900/40 rounded-xl border border-slate-700/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{plan.rolCritico}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${prioridadColor(plan.prioridad)}`}>
                      {plan.prioridad}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Current: <span className="text-white">{plan.titular}</span> &middot; {plan.razon}
                  </p>
                </div>
                <Target size={18} className="text-violet-400" />
              </div>

              {/* Candidates */}
              <div className="space-y-2">
                {plan.candidatos.map((c, j) => (
                  <div key={j} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${
                        c.readiness >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        c.readiness >= 60 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {c.readiness}%
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{c.nombre}</p>
                        <p className="text-[10px] text-slate-500">
                          Gaps: {c.gaps.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                        <Clock size={10} /> {c.timeline}
                      </p>
                      {c.readiness >= 80 ? (
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 justify-end">
                          <CheckCircle size={10} /> Ready
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 justify-end">
                          <ArrowRight size={10} /> Developing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert if no ready candidate */}
              {!plan.candidatos.some(c => c.readiness >= 80) && (
                <div className="mt-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 flex items-center gap-2">
                  <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                  <span className="text-[10px] text-amber-300">
                    No candidate at 80%+ readiness &mdash; accelerate development programs
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
