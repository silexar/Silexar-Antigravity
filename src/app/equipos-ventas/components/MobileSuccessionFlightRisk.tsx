/**
 * 📱 MOBILE: Succession & Flight Risk Compacto
 *
 * Flight risk scores, succession candidates — mobile-optimized.
 *
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import React, { useState } from 'react';
import {
  ShieldAlert, UserCheck, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, DollarSign, Users, Clock, Target
} from 'lucide-react';

const FLIGHT_RISKS = [
  {
    id: '1', nombre: 'Carolina Mendez', rol: 'Senior KAM', riskScore: 78, riskLevel: 'HIGH',
    trend: 'up', impacto: 'CRITICAL', arrEnRiesgo: 520, accounts: 5,
    factores: ['Compensación -15% vs mercado', 'Pasada de largo para VP'],
    pendientes: 2, completadas: 1,
  },
  {
    id: '2', nombre: 'Felipe Araya', rol: 'Enterprise AE', riskScore: 62, riskLevel: 'MEDIUM',
    trend: 'stable', impacto: 'HIGH', arrEnRiesgo: 310, accounts: 3,
    factores: ['Bajo engagement en equipo', 'LinkedIn actualizado'],
    pendientes: 1, completadas: 0,
  },
  {
    id: '3', nombre: 'Lucia Rojas', rol: 'AE', riskScore: 45, riskLevel: 'MEDIUM',
    trend: 'down', impacto: 'MEDIUM', arrEnRiesgo: 180, accounts: 2,
    factores: ['Missed quota 2 quarters'],
    pendientes: 0, completadas: 2,
  },
];

const SUCCESSION = [
  {
    rol: 'VP Sales - Enterprise', titular: 'Carlos Mora', prioridad: 'CRITICA', razon: 'Jubilación 18 meses',
    candidatos: [
      { nombre: 'Ana Garcia', readiness: 87, gaps: ['P&L management'], time: '6 meses' },
      { nombre: 'Roberto Silva', readiness: 72, gaps: ['Executive leadership'], time: '12 meses' },
    ],
  },
  {
    rol: 'Director KAM', titular: 'Patricia Lagos', prioridad: 'ALTA', razon: 'Potential flight risk',
    candidatos: [
      { nombre: 'Carolina Mendez', readiness: 78, gaps: ['Team management'], time: '9 meses' },
      { nombre: 'Diego Fuentes', readiness: 65, gaps: ['Strategic planning'], time: '18 meses' },
    ],
  },
];

const fmt = (v: number) => `$${v}K`;
const TrendIcon = ({ t }: { t: string }) => t === 'up' ? <TrendingUp className="w-3 h-3 text-red-500" /> : t === 'down' ? <TrendingDown className="w-3 h-3 text-emerald-500" /> : <Minus className="w-3 h-3 text-slate-400" />;
const prioColor = (p: string) => p === 'CRITICA' ? 'bg-red-100 text-red-600' : p === 'ALTA' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600';

export function MobileSuccessionFlightRisk() {
  const [tab, setTab] = useState<'flight' | 'succession'>('flight');

  const totalARR = FLIGHT_RISKS.reduce((s, r) => s + r.arrEnRiesgo, 0);

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('flight')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'flight'
              ? 'bg-red-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Flight Risk
        </button>
        <button
          onClick={() => setTab('succession')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'succession'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Succession
        </button>
      </div>

      {/* FLIGHT RISK */}
      {tab === 'flight' && (
        <>
          {/* Summary */}
          <div className="bg-red-50 rounded-2xl p-3 border border-red-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-red-500 uppercase font-bold">ARR at Risk</p>
              <p className="text-2xl font-black text-red-600">{fmt(totalARR)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-red-500 uppercase font-bold">High Risk</p>
              <p className="text-2xl font-black text-red-600">{FLIGHT_RISKS.filter(r => r.riskLevel === 'HIGH').length}</p>
            </div>
          </div>

          {/* Risk Cards */}
          <div className="space-y-2">
            {FLIGHT_RISKS.map(risk => (
              <div key={risk.id} className={`bg-white rounded-2xl border p-3 ${
                risk.riskLevel === 'HIGH' ? 'border-red-200' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    risk.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {risk.riskScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{risk.nombre}</p>
                    <p className="text-[10px] text-slate-400">{risk.rol}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <TrendIcon t={risk.trend} />
                      <span className={`text-[9px] font-bold ${risk.riskLevel === 'HIGH' ? 'text-red-600' : 'text-amber-600'}`}>{risk.riskLevel}</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Impact: {risk.impacto}</p>
                  </div>
                </div>

                {/* Factors */}
                {risk.factores.map((f, i) => (
                  <p key={i} className="text-[10px] text-slate-500 pl-1 py-0.5">• {f}</p>
                ))}

                {/* Impact */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[10px]">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 flex items-center gap-0.5"><DollarSign className="w-3 h-3" /> {fmt(risk.arrEnRiesgo)}</span>
                    <span className="text-slate-400 flex items-center gap-0.5"><Users className="w-3 h-3" /> {risk.accounts} accts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {risk.pendientes > 0 && <span className="text-amber-500">{risk.pendientes} pending</span>}
                    {risk.completadas > 0 && <span className="text-emerald-500"><CheckCircle className="w-3 h-3 inline" /> {risk.completadas}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SUCCESSION */}
      {tab === 'succession' && (
        <div className="space-y-3">
          {SUCCESSION.map((plan, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-bold text-slate-800">{plan.rol}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${prioColor(plan.prioridad)}`}>{plan.prioridad}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Titular: {plan.titular} • {plan.razon}</p>
                </div>
                <Target className="w-4 h-4 text-violet-500 flex-shrink-0" />
              </div>

              <div className="space-y-1.5">
                {plan.candidatos.map((c, j) => (
                  <div key={j} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      c.readiness >= 80 ? 'bg-emerald-100 text-emerald-600' :
                      c.readiness >= 60 ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {c.readiness}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-700">{c.nombre}</p>
                      <p className="text-[9px] text-slate-400 truncate">Gaps: {c.gaps.join(', ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] text-slate-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {c.time}</p>
                      {c.readiness >= 80 ? (
                        <span className="text-[8px] text-emerald-500 font-bold">Ready ✓</span>
                      ) : (
                        <span className="text-[8px] text-amber-500 font-bold">Dev →</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!plan.candidatos.some(c => c.readiness >= 80) && (
                <div className="mt-2 bg-amber-50 rounded-lg p-2 flex items-center gap-1.5 text-[10px]">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="text-amber-700">No candidate at 80%+ — accelerate dev</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
