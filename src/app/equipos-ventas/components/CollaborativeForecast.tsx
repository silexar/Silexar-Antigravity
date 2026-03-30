/**
 * COMPONENT: COLLABORATIVE FORECAST — Sistema de Predicción Inteligente
 * 
 * @description Forecast colaborativo avanzado con tabla multi-rep (commit/best/worst),
 * Cortex-Forecast insights, pipeline health, y actions required.
 */

'use client';

import React, { useState } from 'react';
import {
  Target, TrendingUp, AlertTriangle, Brain, BarChart3,
  ChevronRight, Sparkles, Send,
  Zap, PieChart, Activity
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const FORECAST_META = { teamName: 'Enterprise West', manager: 'Carlos López', quarter: 'Q1 2025' };

interface RepForecast {
  name: string;
  commit: number;
  bestCase: number;
  worstCase: number;
  quota: number;
}

const REP_FORECASTS: RepForecast[] = [
  { name: 'Ana García', commit: 420000, bestCase: 580000, worstCase: 320000, quota: 600000 },
  { name: 'Roberto Silva', commit: 380000, bestCase: 510000, worstCase: 280000, quota: 600000 },
  { name: 'María López', commit: 310000, bestCase: 420000, worstCase: 240000, quota: 600000 },
  { name: 'Carlos Chen', commit: 180000, bestCase: 240000, worstCase: 120000, quota: 600000 },
];

const teamTotal = {
  commit: REP_FORECASTS.reduce((s, r) => s + r.commit, 0),
  bestCase: REP_FORECASTS.reduce((s, r) => s + r.bestCase, 0),
  worstCase: REP_FORECASTS.reduce((s, r) => s + r.worstCase, 0),
  quota: REP_FORECASTS.reduce((s, r) => s + r.quota, 0),
};

const CORTEX_INSIGHTS = [
  { type: 'success', icon: TrendingUp, text: 'High confidence: Team will exceed $1.4M (87% probability)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { type: 'warning', icon: AlertTriangle, text: 'Risk: Carlos Chen needs pipeline build (only $240K pipe)', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { type: 'opportunity', icon: Zap, text: 'Opportunity: 3 large deals could push team to $1.8M', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { type: 'action', icon: Target, text: 'Recommendation: Focus on Q1 pipeline generation NOW', color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

const PIPELINE_HEALTH = [
  { label: 'Total Pipeline', value: '$2.8M', detail: '2.3x coverage', color: 'bg-blue-500' },
  { label: 'Qualified Pipeline', value: '$1.9M', detail: '1.6x coverage', color: 'bg-emerald-500' },
  { label: 'Commit Category', value: '$1.29M', detail: 'confirmed deals', color: 'bg-purple-500' },
  { label: 'Risk Assessment', value: '🟡 Medium', detail: 'coverage adequate', color: 'bg-amber-500' },
];

const ACTIONS_REQUIRED = [
  { text: 'Carlos Chen: Build pipeline to 3x coverage ($1.8M needed)', urgency: 'high' },
  { text: 'Team: Qualify 15 additional opportunities this month', urgency: 'medium' },
  { text: 'Focus: Enterprise deals >$100K for Q1 acceleration', urgency: 'low' },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const fmt = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${(v / 1000).toFixed(0)}K`;
const pct = (actual: number, quota: number) => `${Math.round((actual / quota) * 100)}%`;

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CollaborativeForecast = () => {
  const [, setSubmitted] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart size={18} className="text-blue-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Collaborative Forecasting</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{FORECAST_META.quarter}</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">{FORECAST_META.teamName} Team</h2>
            <p className="text-blue-200 text-sm">Manager: {FORECAST_META.manager}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">Team Quota</p>
            <p className="text-2xl font-bold">{fmt(teamTotal.quota)}</p>
          </div>
        </div>
      </div>

      {/* ──── FORECAST TABLE ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-500" /> Forecast Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rep</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Commit</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Best Case</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Worst Case</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Quota</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Attainment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {REP_FORECASTS.map((rep) => {
                const att = Math.round((rep.commit / rep.quota) * 100);
                return (
                  <tr key={rep.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800 text-sm">{rep.name}</td>
                    <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-emerald-600">{fmt(rep.commit)}</td>
                    <td className="px-5 py-4 text-sm text-right font-mono text-blue-600">{fmt(rep.bestCase)}</td>
                    <td className="px-5 py-4 text-sm text-right font-mono text-red-500">{fmt(rep.worstCase)}</td>
                    <td className="px-5 py-4 text-sm text-right font-mono text-slate-500">{fmt(rep.quota)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${att >= 60 ? 'bg-emerald-100 text-emerald-700' : att >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {att}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* TOTALS ROW */}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="px-5 py-4 text-sm">TEAM TOTAL</td>
                <td className="px-5 py-4 text-sm text-right font-mono">{fmt(teamTotal.commit)}</td>
                <td className="px-5 py-4 text-sm text-right font-mono">{fmt(teamTotal.bestCase)}</td>
                <td className="px-5 py-4 text-sm text-right font-mono">{fmt(teamTotal.worstCase)}</td>
                <td className="px-5 py-4 text-sm text-right font-mono">{fmt(teamTotal.quota)}</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                    {pct(teamTotal.commit, teamTotal.quota)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ──── CORTEX-FORECAST INSIGHTS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Brain size={18} className="text-violet-500" />
          Cortex-Forecast Insights
          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold border border-violet-200 flex items-center gap-1">
            <Sparkles size={10} /> AI
          </span>
        </h3>
        <div className="space-y-2">
          {CORTEX_INSIGHTS.map((insight, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${insight.color} cursor-pointer hover:shadow-sm transition-all group`}>
              <insight.icon size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{insight.text}</p>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* ──── PIPELINE HEALTH ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" /> Pipeline Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PIPELINE_HEALTH.map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-semibold">{item.label}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTIONS REQUIRED ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={18} className="text-orange-500" /> Actions Required
        </h3>
        <div className="space-y-2">
          {ACTIONS_REQUIRED.map((action, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${
              action.urgency === 'high' ? 'border-red-200 bg-red-50' :
              action.urgency === 'medium' ? 'border-amber-200 bg-amber-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                action.urgency === 'high' ? 'bg-red-500' : action.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              <p className="text-sm font-medium text-slate-700">{action.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Update Forecast', icon: BarChart3, primary: true },
          { label: 'Pipeline Actions', icon: Target, primary: false },
          { label: 'Submit to Leadership', icon: Send, primary: false, action: () => setSubmitted(true) },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            btn.primary
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:shadow-sm'
          }`}>
            <btn.icon size={16} /> {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
