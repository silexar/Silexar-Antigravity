/**
 * 📱 MOBILE: KAM Dashboard Compacto
 *
 * Vista móvil del KAM Dashboard con portfolio, accounts, actions.
 *
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import React, { useState } from 'react';
import {
  Crown, TrendingUp, TrendingDown, Minus, Target, Heart,
  Zap, ChevronDown, ChevronUp, DollarSign, Star,
  AlertTriangle, ArrowRight
} from 'lucide-react';

const MOCK_KAM = {
  portfolioARR: 847000, accounts: 8, avgHealth: 94, quota: 156, expansion: 7,
};

const MOCK_ACCOUNTS = [
  { id: '1', nombre: 'Banco Chile', arr: 340, health: 97, trend: 'up', risk: 'LOW', next: 'QBR Dec 15', expansion: 180 },
  { id: '2', nombre: 'Falabella', arr: 280, health: 84, trend: 'stable', risk: 'MEDIUM', next: 'Renewal Q1', expansion: 120 },
  { id: '3', nombre: 'LATAM Airlines', arr: 190, health: 91, trend: 'up', risk: 'LOW', next: 'C-Suite Pres.', expansion: 95 },
  { id: '4', nombre: 'Cencosud', arr: 145, health: 78, trend: 'down', risk: 'HIGH', next: 'Recovery call', expansion: 60 },
];

const MOCK_ACTIONS = [
  { msg: 'Falabella renewal risk — competitor', prio: 'CRITICAL' },
  { msg: 'Banco Chile QBR — 3 semanas vencido', prio: 'HIGH' },
  { msg: 'LATAM expansion window — 2 semanas', prio: 'HIGH' },
  { msg: 'Nuevo CTO en Cencosud — agendar intro', prio: 'MEDIUM' },
];

const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}M` : `$${v}K`;
const TrendIcon = ({ t }: { t: string }) => t === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : t === 'down' ? <TrendingDown className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-slate-400" />;

export function MobileKAMDashboard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Crown className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-lg text-slate-800">KAM Dashboard</h3>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Portfolio ARR', value: fmt(MOCK_KAM.portfolioARR / 1000), icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Health Avg', value: `${MOCK_KAM.avgHealth}%`, icon: Heart, color: 'text-pink-600' },
          { label: 'Quota', value: `${MOCK_KAM.quota}%`, icon: Target, color: 'text-amber-600' },
          { label: 'Expansion Ops', value: `${MOCK_KAM.expansion}`, icon: Zap, color: 'text-blue-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <m.icon className={`w-3 h-3 ${m.color}`} />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{m.label}</p>
            </div>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Strategic Accounts */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500" /> Strategic Accounts
        </h4>
        <div className="space-y-2">
          {MOCK_ACCOUNTS.map(acc => (
            <div key={acc.id}>
              <button
                onClick={() => setExpanded(expanded === acc.id ? null : acc.id)}
                className="w-full text-left active:bg-slate-50 transition-colors rounded-xl"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                      acc.health >= 90 ? 'bg-emerald-500' : acc.health >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {acc.health}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{acc.nombre}</p>
                      <p className="text-[10px] text-slate-400">${acc.arr}K ARR</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon t={acc.trend} />
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      acc.risk === 'LOW' ? 'bg-emerald-50 text-emerald-600' :
                      acc.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>{acc.risk}</span>
                    {expanded === acc.id ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </div>
              </button>
              {expanded === acc.id && (
                <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                  <div className="bg-blue-50 rounded-lg px-3 py-2 text-[10px]">
                    <span className="text-slate-500">Next:</span>{' '}
                    <span className="text-blue-700 font-semibold">{acc.next}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 px-1">
                    <Zap className="w-3 h-3" /> Expansion: ${acc.expansion}K
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* IA Action Items */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> IA Actions
          <span className="ml-auto bg-amber-100 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{MOCK_ACTIONS.length}</span>
        </h4>
        <div className="space-y-1.5">
          {MOCK_ACTIONS.map((a, i) => (
            <div key={i} className={`p-2.5 rounded-xl border text-[10px] flex items-center gap-2 ${
              a.prio === 'CRITICAL' ? 'bg-red-50 border-red-100' :
              a.prio === 'HIGH' ? 'bg-amber-50 border-amber-100' :
              'bg-blue-50 border-blue-100'
            }`}>
              <span className="flex-1 font-medium text-slate-700">{a.msg}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Expansion Pipeline Mini */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-4 text-white">
        <p className="text-[10px] uppercase font-bold text-emerald-200">Expansion Pipeline</p>
        <p className="text-2xl font-bold mt-1">$455K</p>
        <p className="text-xs text-emerald-200">$287K weighted • 7 oportunidades</p>
        <div className="mt-2 bg-white/20 rounded-full h-1.5">
          <div className="bg-white h-1.5 rounded-full" style={{ width: '63%' }} />
        </div>
        <p className="text-[10px] text-emerald-200 mt-1">63% win rate estimado</p>
      </div>
    </div>
  );
}
