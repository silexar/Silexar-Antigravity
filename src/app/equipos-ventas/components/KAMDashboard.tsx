/**
 * COMPONENT: KAM DASHBOARD - Key Account Management Command Center
 *
 * @description Dashboard principal del Key Account Manager con portfolio
 * overview, strategic accounts, action items IA, y expansion pipeline.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import {
  Crown, TrendingUp, Target, AlertTriangle, ChevronRight,
  DollarSign, Users, Heart, Zap, Shield, Star, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, Eye
} from 'lucide-react';

/* ─── MOCK DATA ────────────────────────────────────────────────────── */

const KAM_PROFILE = {
  nombre: 'Ana Garcia Rodriguez',
  tier: 'STRATEGIC',
  portfolioARR: 847000,
  accountCount: 8,
  avgHealthScore: 94,
  expansionOppsCount: 7,
  capacidad: { actual: 8, maximo: 10, porcentaje: 80 },
  quotaAttainment: 156,
  growthYoY: 23,
  retentionRate: 98,
  certificaciones: 5,
};

const STRATEGIC_ACCOUNTS = [
  {
    id: '1', nombre: 'Banco Chile', arr: 340000, healthScore: 97,
    trend: 'IMPROVING', riskLevel: 'LOW', nextAction: 'QBR Dec 15',
    expansionPotential: 180000, championStrength: 87, tier: 'STRATEGIC',
    logo: 'bank',
  },
  {
    id: '2', nombre: 'Falabella', arr: 280000, healthScore: 84,
    trend: 'STABLE', riskLevel: 'MEDIUM', nextAction: 'Renewal Q1',
    expansionPotential: 120000, championStrength: 62, tier: 'ENTERPRISE',
    logo: 'store',
  },
  {
    id: '3', nombre: 'LATAM Airlines', arr: 190000, healthScore: 91,
    trend: 'IMPROVING', riskLevel: 'LOW', nextAction: 'C-Suite Pres.',
    expansionPotential: 95000, championStrength: 92, tier: 'STRATEGIC',
    logo: 'plane',
  },
  {
    id: '4', nombre: 'Cencosud', arr: 145000, healthScore: 78,
    trend: 'DECLINING', riskLevel: 'HIGH', nextAction: 'Recovery call',
    expansionPotential: 60000, championStrength: 45, tier: 'ENTERPRISE',
    logo: 'shopping-cart',
  },
];

const ACTION_ITEMS = [
  { tipo: 'URGENTE', mensaje: 'Falabella renewal risk - competitor detected', prioridad: 'CRITICAL', cuenta: 'Falabella' },
  { tipo: 'QBR', mensaje: 'Banco Chile QBR - 3 weeks overdue', prioridad: 'HIGH', cuenta: 'Banco Chile' },
  { tipo: 'EXPANSION', mensaje: 'LATAM expansion window closing in 2 weeks', prioridad: 'HIGH', cuenta: 'LATAM Airlines' },
  { tipo: 'RELATIONSHIP', mensaje: 'New CTO at Cencosud - schedule intro', prioridad: 'MEDIUM', cuenta: 'Cencosud' },
  { tipo: 'COACHING', mensaje: 'Digital Selling cert due in 5 days', prioridad: 'MEDIUM', cuenta: null },
];

const EXPANSION_PIPELINE = {
  totalOportunidades: 7,
  valorTotal: 455000,
  valorWeighted: 287000,
  porTipo: { 'Cross-Sell': 2, 'Upsell': 3, 'New Division': 1, 'Renewal Uplift': 1 },
};

/* ─── HELPERS ─────────────────────────────────────────────────────── */

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'IMPROVING') return <ArrowUpRight size={14} className="text-emerald-400" />;
  if (trend === 'DECLINING') return <ArrowDownRight size={14} className="text-red-400" />;
  return <Minus size={14} className="text-slate-400" />;
};

const RiskBadge = ({ level }: { level: string }) => {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Low' },
    MEDIUM: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'Medium' },
    HIGH: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'High' },
    CRITICAL: { bg: 'bg-red-600/30', text: 'text-red-200', label: 'Critical' },
  };
  const c = cfg[level] || cfg.LOW;
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
};

const HealthGauge = ({ score }: { score: number }) => {
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="transform -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <span className="absolute text-sm font-black text-white">{score}</span>
    </div>
  );
};

/* ─── COMPONENT ───────────────────────────────────────────────────── */

export function KAMDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const p = KAM_PROFILE;

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/10 to-transparent rounded-2xl border border-amber-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Crown size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Key Account Management</h2>
              <p className="text-sm text-slate-400">{p.nombre} &middot; Senior KAM &middot; Strategic Tier</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-center">
            {[
              { label: 'Portfolio ARR', value: fmt(p.portfolioARR), icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Accounts', value: p.accountCount.toString(), icon: Users, color: 'text-blue-400' },
              { label: 'Health Avg', value: `${p.avgHealthScore}%`, icon: Heart, color: 'text-pink-400' },
              { label: 'Quota', value: `${p.quotaAttainment}%`, icon: Target, color: 'text-amber-400' },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-2">
                <m.icon size={16} className={m.color} />
                <div className="text-left">
                  <p className="text-lg font-black text-white">{m.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STRATEGIC ACCOUNTS GRID ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Star size={14} className="text-amber-400" /> Strategic Accounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STRATEGIC_ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(selectedAccount === acc.id ? null : acc.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                selectedAccount === acc.id
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white text-sm">{acc.nombre}</p>
                  <p className="text-xs text-slate-500">{fmt(acc.arr)} ARR</p>
                </div>
                <HealthGauge score={acc.healthScore} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendIcon trend={acc.trend} />
                    {acc.trend === 'IMPROVING' ? 'Growing' : acc.trend === 'DECLINING' ? 'Declining' : 'Stable'}
                  </span>
                  <RiskBadge level={acc.riskLevel} />
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Shield size={10} /> Champion: {acc.championStrength}%
                </div>

                <div className="bg-slate-900/50 rounded-lg p-2 text-[10px]">
                  <span className="text-slate-500">Next:</span>{' '}
                  <span className="text-amber-300 font-semibold">{acc.nextAction}</span>
                </div>

                {acc.expansionPotential > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Zap size={10} /> Expansion: {fmt(acc.expansionPotential)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── ACTION ITEMS + EXPANSION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Action Items */}
        <div className="lg:col-span-3 bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" /> IA Action Items
            <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ACTION_ITEMS.length}
            </span>
          </h3>
          <div className="space-y-2">
            {ACTION_ITEMS.map((item, i) => {
              const prioColor: Record<string, string> = {
                CRITICAL: 'border-l-red-500 bg-red-500/5',
                HIGH: 'border-l-amber-500 bg-amber-500/5',
                MEDIUM: 'border-l-blue-500 bg-blue-500/5',
                LOW: 'border-l-slate-500',
              };
              return (
                <div key={i} className={`border-l-2 rounded-r-lg p-3 flex items-center justify-between ${prioColor[item.prioridad] || ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{item.mensaje}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.cuenta && <span className="text-[10px] text-slate-500">{item.cuenta}</span>}
                      <span className={`text-[9px] font-bold uppercase ${
                        item.prioridad === 'CRITICAL' ? 'text-red-400' :
                        item.prioridad === 'HIGH' ? 'text-amber-400' : 'text-blue-400'
                      }`}>{item.prioridad}</span>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expansion Pipeline */}
        <div className="lg:col-span-2 bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={14} className="text-emerald-400" /> Expansion Pipeline
          </h3>
          <div className="text-center mb-4">
            <p className="text-3xl font-black text-white">{fmt(EXPANSION_PIPELINE.valorTotal)}</p>
            <p className="text-xs text-slate-500">Total Pipeline &middot; {fmt(EXPANSION_PIPELINE.valorWeighted)} weighted</p>
          </div>
          <div className="space-y-3">
            {Object.entries(EXPANSION_PIPELINE.porTipo).map(([tipo, count]) => (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{tipo}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${(count / EXPANSION_PIPELINE.totalOportunidades) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Opportunities</span>
              <span className="text-white font-bold">{EXPANSION_PIPELINE.totalOportunidades}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Win Rate Est.</span>
              <span className="text-emerald-400 font-bold">63%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CAPACITY & PERFORMANCE STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Capacity', value: `${p.capacidad.actual}/${p.capacidad.maximo}`, sub: `${p.capacidad.porcentaje}% utilized`, icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
          { label: 'Growth YoY', value: `+${p.growthYoY}%`, sub: 'vs industry +18%', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: 'Retention', value: `${p.retentionRate}%`, sub: 'best in class', icon: Shield, color: 'from-violet-500 to-purple-600' },
          { label: 'Certifications', value: p.certificaciones.toString(), sub: 'all current', icon: Star, color: 'from-amber-500 to-orange-600' },
        ].map(m => (
          <div key={m.label} className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                <m.icon size={16} className="text-white" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-xl font-black text-white">{m.value}</p>
            <p className="text-[10px] text-slate-500">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── SELECTED ACCOUNT DETAIL ── */}
      {selectedAccount && (() => {
        const acc = STRATEGIC_ACCOUNTS.find(a => a.id === selectedAccount);
        if (!acc) return null;
        return (
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-xl border border-amber-500/20 p-5 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye size={14} className="text-amber-400" /> {acc.nombre} — Detail View
              </h3>
              <button onClick={() => setSelectedAccount(null)} className="text-xs text-slate-500 hover:text-white">Close</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-black text-white">{fmt(acc.arr)}</p>
                <p className="text-[10px] text-slate-500">Current ARR</p>
              </div>
              <div>
                <p className="text-lg font-black text-emerald-400">{fmt(acc.expansionPotential)}</p>
                <p className="text-[10px] text-slate-500">Expansion Potential</p>
              </div>
              <div>
                <p className="text-lg font-black text-white">{acc.championStrength}%</p>
                <p className="text-[10px] text-slate-500">Champion Strength</p>
              </div>
              <div>
                <HealthGauge score={acc.healthScore} />
                <p className="text-[10px] text-slate-500 mt-1">Health Score</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
