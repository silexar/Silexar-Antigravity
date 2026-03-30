/**
 * COMPONENT: TERRITORIAL INTELLIGENCE — AI Territory Optimization
 * 
 * @description Dashboard de inteligencia territorial con ML optimization,
 * real-time rebalancing, predictive analysis, y account scoring.
 */

'use client';

import React from 'react';
import {
  ArrowRightLeft, Target, Brain,
  Sparkles, Globe, ChevronRight
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const TERRITORIES = [
  { name: 'Enterprise West', code: 'ENT-W', reps: 6, accounts: 45, pipeline: 2800000, quotaAtt: 142, potentialScore: 92, status: 'optimal', color: 'bg-emerald-500' },
  { name: 'Enterprise East', code: 'ENT-E', reps: 5, accounts: 52, pipeline: 2100000, quotaAtt: 108, potentialScore: 78, status: 'balanced', color: 'bg-blue-500' },
  { name: 'Mid-Market North', code: 'MM-N', reps: 8, accounts: 120, pipeline: 1600000, quotaAtt: 98, potentialScore: 65, status: 'overloaded', color: 'bg-amber-500' },
  { name: 'Mid-Market South', code: 'MM-S', reps: 4, accounts: 35, pipeline: 890000, quotaAtt: 76, potentialScore: 88, status: 'underserved', color: 'bg-red-500' },
];

const REBALANCE_SUGGESTIONS = [
  { action: 'Move 2 reps from MM-North to MM-South', impact: '+22% projected uplift', confidence: 91 },
  { action: 'Redistribute 15 accounts from ENT-East to ENT-West', impact: '+8% pipeline coverage', confidence: 84 },
  { action: 'Create new BDR territory for emerging tech sector', impact: '+$400K new pipeline', confidence: 72 },
];

const TOP_ACCOUNTS = [
  { name: 'TechCorp Global', territory: 'ENT-W', score: 95, value: 250000, status: 'active' },
  { name: 'Retail Giant Inc', territory: 'ENT-E', score: 88, value: 180000, status: 'at-risk' },
  { name: 'FinServ Solutions', territory: 'MM-N', score: 82, value: 120000, status: 'active' },
  { name: 'HealthTech Labs', territory: 'MM-S', score: 79, value: 95000, status: 'new' },
];

const fmt = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

/* ─── COMPONENT ───────────────────────────────────────────── */

export const TerritorialIntelligence = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={18} className="text-teal-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-200">Inteligencia Territorial</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={10} /> ML Optimization</span>
          </div>
          <h2 className="text-2xl font-bold mt-1">Optimización Continua de Territories</h2>
          <p className="text-teal-200 text-sm">4 territories • Real-time rebalancing • 302 accounts scored</p>
        </div>
      </div>

      {/* ──── TERRITORY CARDS ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TERRITORIES.map((t) => (
          <div key={t.code} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${t.color}`} />
                <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                <span className="text-xs text-slate-400 font-mono">{t.code}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                t.status === 'optimal' ? 'bg-emerald-100 text-emerald-700' :
                t.status === 'balanced' ? 'bg-blue-100 text-blue-700' :
                t.status === 'overloaded' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>{t.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><p className="text-[10px] text-slate-400 uppercase">Reps</p><p className="text-sm font-bold text-slate-800">{t.reps}</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase">Accounts</p><p className="text-sm font-bold text-slate-800">{t.accounts}</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase">Pipeline</p><p className="text-sm font-bold text-slate-800">{fmt(t.pipeline)}</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase">Quota Att.</p><p className={`text-sm font-bold ${t.quotaAtt >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{t.quotaAtt}%</p></div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">AI Score:</span>
                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${t.potentialScore >= 80 ? 'bg-emerald-500' : t.potentialScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${t.potentialScore}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-600">{t.potentialScore}</span>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
            </div>
          </div>
        ))}
      </div>

      {/* ──── REBALANCE SUGGESTIONS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-cyan-500" /> Rebalance Suggestions
          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Brain size={10} /> AI</span>
        </h3>
        <div className="space-y-3">
          {REBALANCE_SUGGESTIONS.map((s, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-cyan-50/50 border border-cyan-100 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">{s.confidence}%</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{s.action}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">{s.impact}</p>
              </div>
              <button className="text-xs font-bold bg-cyan-500 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-600">Apply</button>
            </div>
          ))}
        </div>
      </div>

      {/* ──── TOP ACCOUNTS ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target size={18} className="text-orange-500" /> Top Scored Accounts
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Account</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Territory</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">AI Score</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Value</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {TOP_ACCOUNTS.map((a) => (
              <tr key={a.name} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">{a.name}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{a.territory}</td>
                <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-slate-800">{a.score}</span></td>
                <td className="px-5 py-3 text-sm text-right font-mono font-semibold text-emerald-600">{fmt(a.value)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    a.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    a.status === 'at-risk' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
