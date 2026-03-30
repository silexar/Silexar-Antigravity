/**
 * 📱 MOBILE: Account Health Compacto
 *
 * Health scores por cuenta, dimensiones, trends — mobile-optimized.
 *
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import React, { useState } from 'react';
import {
  Heart, TrendingUp, TrendingDown, Minus,
  AlertCircle, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const ACCOUNTS = [
  {
    id: '1', nombre: 'Banco Chile', score: 97, trend: 'up', risk: 'LOW', alertas: 0,
    dims: [
      { n: 'Engagement', s: 98, t: 'UP' }, { n: 'Satisfaction', s: 95, t: 'STABLE' },
      { n: 'Growth', s: 99, t: 'UP' }, { n: 'Advocacy', s: 96, t: 'UP' },
    ],
  },
  {
    id: '2', nombre: 'Falabella', score: 84, trend: 'down', risk: 'MEDIUM', alertas: 2,
    dims: [
      { n: 'Engagement', s: 80, t: 'DOWN' }, { n: 'Satisfaction', s: 88, t: 'STABLE' },
      { n: 'Growth', s: 82, t: 'DOWN' }, { n: 'Advocacy', s: 86, t: 'STABLE' },
    ],
  },
  {
    id: '3', nombre: 'LATAM Airlines', score: 91, trend: 'up', risk: 'LOW', alertas: 0,
    dims: [
      { n: 'Engagement', s: 93, t: 'UP' }, { n: 'Satisfaction', s: 89, t: 'STABLE' },
      { n: 'Growth', s: 94, t: 'UP' }, { n: 'Advocacy', s: 88, t: 'STABLE' },
    ],
  },
  {
    id: '4', nombre: 'Cencosud', score: 78, trend: 'down', risk: 'HIGH', alertas: 3,
    dims: [
      { n: 'Engagement', s: 72, t: 'DOWN' }, { n: 'Satisfaction', s: 80, t: 'DOWN' },
      { n: 'Growth', s: 76, t: 'DOWN' }, { n: 'Advocacy', s: 84, t: 'STABLE' },
    ],
  },
];

const scoreColor = (s: number) => s >= 90 ? 'text-emerald-600' : s >= 75 ? 'text-amber-600' : 'text-red-600';
const scoreBg = (s: number) => s >= 90 ? 'bg-emerald-500' : s >= 75 ? 'bg-amber-500' : 'bg-red-500';

const TrendIcon = ({ t }: { t: string }) => {
  if (t === 'up' || t === 'UP') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  if (t === 'down' || t === 'DOWN') return <TrendingDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-slate-400" />;
};

export function MobileAccountHealth() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const avgScore = Math.round(ACCOUNTS.reduce((s, a) => s + a.score, 0) / ACCOUNTS.length);
  const atRisk = ACCOUNTS.filter(a => a.risk === 'HIGH' || a.risk === 'CRITICAL').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="font-bold text-lg text-slate-800">Account Health</h3>
        </div>
        {atRisk > 0 && (
          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {atRisk} at risk
          </span>
        )}
      </div>

      {/* Portfolio Average */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100 text-center">
        <p className="text-[10px] text-pink-500 uppercase font-bold">Portfolio Health Avg</p>
        <p className={`text-4xl font-black mt-1 ${scoreColor(avgScore)}`}>{avgScore}%</p>
      </div>

      {/* Account Cards */}
      <div className="space-y-2">
        {ACCOUNTS.map(acc => (
          <div key={acc.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === acc.id ? null : acc.id)}
              className="w-full p-3 flex items-center gap-3 text-left active:bg-slate-50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${scoreBg(acc.score)} flex items-center justify-center text-white font-black text-sm`}>
                {acc.score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{acc.nombre}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TrendIcon t={acc.trend} />
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    acc.risk === 'LOW' ? 'bg-emerald-50 text-emerald-600' :
                    acc.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>{acc.risk}</span>
                  {acc.alertas > 0 && (
                    <span className="text-[9px] text-red-500 font-bold">{acc.alertas} alerts</span>
                  )}
                </div>
              </div>
              {expanded === acc.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expanded === acc.id && (
              <div className="px-3 pb-3 border-t border-slate-50 pt-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-200">
                {acc.dims.map(dim => (
                  <div key={dim.n} className="bg-slate-50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-slate-400 uppercase">{dim.n}</span>
                      <TrendIcon t={dim.t} />
                    </div>
                    <p className={`text-sm font-bold ${scoreColor(dim.s)}`}>{dim.s}%</p>
                    <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                      <div className={`h-1 rounded-full ${scoreBg(dim.s)}`} style={{ width: `${dim.s}%` }} />
                    </div>
                  </div>
                ))}

                {acc.risk !== 'LOW' ? (
                  <div className="col-span-2 bg-amber-50 rounded-lg p-2 flex items-center gap-1.5 text-[10px]">
                    <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-700 font-medium">
                      {acc.risk === 'HIGH' ? 'Agendar recovery meeting' : 'Monitorear dimensiones en baja'}
                    </span>
                  </div>
                ) : (
                  <div className="col-span-2 bg-emerald-50 rounded-lg p-2 flex items-center gap-1.5 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-emerald-700 font-medium">Cuenta saludable — buscar expansión</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
