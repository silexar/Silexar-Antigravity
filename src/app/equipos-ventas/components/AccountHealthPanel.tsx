/**
 * COMPONENT: ACCOUNT HEALTH PANEL
 *
 * @description Panel de salud de cuentas con score gauge multidimensional,
 * historical trend, risk alerts, y comparativas entre cuentas.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import {
  Heart, TrendingUp, TrendingDown, Minus, AlertCircle,
  CheckCircle, ArrowRight, Activity
} from 'lucide-react';

/* ─── MOCK DATA ────────────────────────────────────────────────────── */

const ACCOUNTS_HEALTH = [
  {
    id: '1', nombre: 'Banco Chile', score: 97,
    dimensiones: [
      { nombre: 'Engagement', score: 98, tendencia: 'UP' },
      { nombre: 'Satisfaction', score: 95, tendencia: 'STABLE' },
      { nombre: 'Growth', score: 99, tendencia: 'UP' },
      { nombre: 'Advocacy', score: 96, tendencia: 'UP' },
    ],
    trend: 'IMPROVING', riskLevel: 'LOW', alertasActivas: 0,
    historico: [88, 90, 91, 93, 94, 95, 97],
  },
  {
    id: '2', nombre: 'Falabella', score: 84,
    dimensiones: [
      { nombre: 'Engagement', score: 80, tendencia: 'DOWN' },
      { nombre: 'Satisfaction', score: 88, tendencia: 'STABLE' },
      { nombre: 'Growth', score: 82, tendencia: 'DOWN' },
      { nombre: 'Advocacy', score: 86, tendencia: 'STABLE' },
    ],
    trend: 'DECLINING', riskLevel: 'MEDIUM', alertasActivas: 2,
    historico: [92, 91, 89, 88, 86, 85, 84],
  },
  {
    id: '3', nombre: 'LATAM Airlines', score: 91,
    dimensiones: [
      { nombre: 'Engagement', score: 93, tendencia: 'UP' },
      { nombre: 'Satisfaction', score: 89, tendencia: 'STABLE' },
      { nombre: 'Growth', score: 94, tendencia: 'UP' },
      { nombre: 'Advocacy', score: 88, tendencia: 'STABLE' },
    ],
    trend: 'IMPROVING', riskLevel: 'LOW', alertasActivas: 0,
    historico: [85, 86, 87, 88, 89, 90, 91],
  },
  {
    id: '4', nombre: 'Cencosud', score: 78,
    dimensiones: [
      { nombre: 'Engagement', score: 72, tendencia: 'DOWN' },
      { nombre: 'Satisfaction', score: 80, tendencia: 'DOWN' },
      { nombre: 'Growth', score: 76, tendencia: 'DOWN' },
      { nombre: 'Advocacy', score: 84, tendencia: 'STABLE' },
    ],
    trend: 'DECLINING', riskLevel: 'HIGH', alertasActivas: 3,
    historico: [90, 88, 86, 84, 82, 80, 78],
  },
];

/* ─── HELPERS ─────────────────────────────────────────────────────── */

const scoreColor = (s: number) => s >= 90 ? '#22c55e' : s >= 75 ? '#f59e0b' : s >= 60 ? '#f97316' : '#ef4444';

const TrendBadge = ({ trend }: { trend: string }) => {
  if (trend === 'UP' || trend === 'IMPROVING') return <TrendingUp size={12} className="text-emerald-400" />;
  if (trend === 'DOWN' || trend === 'DECLINING') return <TrendingDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-slate-500" />;
};

const MiniSparkline = ({ data }: { data: number[] }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const lastVal = data[data.length - 1];
  const prevVal = data[data.length - 2];
  const isUp = lastVal >= prevVal;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((lastVal - min) / range) * h}
        r="2.5"
        fill={isUp ? '#22c55e' : '#ef4444'}
      />
    </svg>
  );
};

const HealthRing = ({ score, size = 56 }: { score: number; size?: number }) => {
  const color = scoreColor(score);
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <span className="absolute text-xs font-black text-white">{score}</span>
    </div>
  );
};

/* ─── COMPONENT ───────────────────────────────────────────────────── */

export function AccountHealthPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const avgScore = Math.round(ACCOUNTS_HEALTH.reduce((s, a) => s + a.score, 0) / ACCOUNTS_HEALTH.length);
  const enRiesgo = ACCOUNTS_HEALTH.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length;

  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Heart size={16} className="text-pink-400" /> Account Health Intelligence
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">Portfolio Avg:</span>
          <span className="font-black text-white">{avgScore}%</span>
          {enRiesgo > 0 && (
            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
              <AlertCircle size={10} />{enRiesgo} at risk
            </span>
          )}
        </div>
      </div>

      {/* Account Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {ACCOUNTS_HEALTH.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedId(selectedId === acc.id ? null : acc.id)}
            className={`text-left p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
              selectedId === acc.id
                ? 'bg-pink-500/10 border-pink-500/30 shadow-lg shadow-pink-500/10'
                : acc.riskLevel === 'HIGH' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                : 'bg-slate-900/40 border-slate-700/30 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{acc.nombre}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <TrendBadge trend={acc.trend} />
                  <span className="text-[10px] text-slate-500">{acc.trend === 'IMPROVING' ? 'Improving' : acc.trend === 'DECLINING' ? 'Declining' : 'Stable'}</span>
                </div>
              </div>
              <HealthRing score={acc.score} />
            </div>

            {/* Mini Sparkline */}
            <div className="flex items-center justify-between">
              <MiniSparkline data={acc.historico} />
              {acc.alertasActivas > 0 && (
                <span className="bg-red-500/20 text-red-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {acc.alertasActivas} alerts
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Account Detail */}
      {selectedId && (() => {
        const acc = ACCOUNTS_HEALTH.find(a => a.id === selectedId);
        if (!acc) return null;
        return (
          <div className="bg-slate-900/50 rounded-xl border border-pink-500/20 p-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Activity size={14} className="text-pink-400" />
                {acc.nombre} &mdash; Health Dimensions
              </h4>
              <button onClick={() => setSelectedId(null)} className="text-[10px] text-slate-500 hover:text-white">Close</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {acc.dimensiones.map(dim => (
                <div key={dim.nombre} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 uppercase">{dim.nombre}</span>
                    <TrendBadge trend={dim.tendencia} />
                  </div>
                  <p className="text-lg font-black" style={{ color: scoreColor(dim.score) }}>{dim.score}%</p>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${dim.score}%`, backgroundColor: scoreColor(dim.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {acc.riskLevel !== 'LOW' && (
              <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                <div className="text-[10px]">
                  <span className="text-amber-300 font-bold">Action Required: </span>
                  <span className="text-slate-400">
                    {acc.riskLevel === 'HIGH'
                      ? 'Schedule recovery meeting and prepare retention strategy'
                      : 'Monitor declining dimensions and plan proactive engagement'}
                  </span>
                </div>
                <ArrowRight size={12} className="text-amber-400 flex-shrink-0" />
              </div>
            )}

            {acc.riskLevel === 'LOW' && (
              <div className="mt-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="text-[10px] text-emerald-300">Healthy account &mdash; focus on expansion opportunities</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
