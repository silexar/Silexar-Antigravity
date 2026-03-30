/**
 * COMPONENT: COMPETITIVE INTELLIGENCE — Win/Loss & Battle Cards
 * 
 * @description Intelligence de competencia automatizada con win/loss analysis,
 * battle cards, positioning recommendations, y market intelligence.
 */

'use client';

import React from 'react';
import {
  Swords, TrendingUp, TrendingDown, Target, Eye,
  FileText, Sparkles, Brain, BarChart3,
  ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const WIN_LOSS_SUMMARY = {
  totalDeals: 48,
  wonDeals: 32,
  lostDeals: 16,
  winRate: 67,
  avgDealSize: 85000,
  avgSalesCycle: 42, // days
};

const COMPETITORS = [
  { name: 'CompetitorX', deals: 12, winRate: 42, losses: 7, topReason: 'Price', threat: 'high', trend: 'rising' },
  { name: 'AlternateY', deals: 8, winRate: 75, losses: 2, topReason: 'Feature gap', threat: 'medium', trend: 'stable' },
  { name: 'LegacyZ', deals: 5, winRate: 80, losses: 1, topReason: 'Integration', threat: 'low', trend: 'declining' },
];

const BATTLE_CARDS = [
  { competitor: 'CompetitorX', strengths: ['Lower price point', 'Strong mobile app'], weaknesses: ['Limited enterprise features', 'Poor support'], keyTalk: '"Our enterprise ROI exceeds price difference within 6 months"', lastUpdated: '2 days ago' },
  { competitor: 'AlternateY', strengths: ['Advanced analytics', 'Good UI'], weaknesses: ['No territory management', 'Limited API'], keyTalk: '"Our territory intelligence suite has no equivalent in their stack"', lastUpdated: '1 week ago' },
  { competitor: 'LegacyZ', strengths: ['Market presence', 'Large instalaciones base'], weaknesses: ['Outdated technology', 'Slow innovation'], keyTalk: '"Migrating from LegacyZ saves 30% in operational costs within year 1"', lastUpdated: '5 days ago' },
];

const RECOMMENDATIONS = [
  { opp: 'TechCorp — $250K', competitor: 'CompetitorX', rec: 'Lead with ROI calculator and enterprise security (their gap)', confidence: 88 },
  { opp: 'FinServ — $120K', competitor: 'AlternateY', rec: 'Emphasize territory management and coaching AI', confidence: 82 },
  { opp: 'HealthTech — $95K', competitor: 'LegacyZ', rec: 'Show migration path with cost savings analysis', confidence: 91 },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CompetitiveIntelligence = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Swords size={18} className="text-rose-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-200">Competitive Intelligence</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={10} /> Auto-generated</span>
          </div>
          <h2 className="text-2xl font-bold mt-1">Intelligence de Competencia</h2>
          <p className="text-rose-200 text-sm">Win/Loss analysis • Battle cards • Real-time positioning</p>
        </div>
      </div>

      {/* ──── WIN/LOSS SUMMARY ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-500" /> Win/Loss Analysis
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'Total Deals', value: WIN_LOSS_SUMMARY.totalDeals.toString(), color: 'text-slate-800' },
            { label: 'Won', value: WIN_LOSS_SUMMARY.wonDeals.toString(), color: 'text-emerald-600' },
            { label: 'Lost', value: WIN_LOSS_SUMMARY.lostDeals.toString(), color: 'text-red-600' },
            { label: 'Win Rate', value: `${WIN_LOSS_SUMMARY.winRate}%`, color: 'text-blue-600' },
            { label: 'Avg Deal Size', value: `$${(WIN_LOSS_SUMMARY.avgDealSize / 1000).toFixed(0)}K`, color: 'text-purple-600' },
            { label: 'Sales Cycle', value: `${WIN_LOSS_SUMMARY.avgSalesCycle}d`, color: 'text-amber-600' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ──── COMPETITOR TABLE ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Eye size={18} className="text-rose-500" /> Competitor Tracker
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Competitor</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Encounters</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Our Win Rate</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Top Loss Reason</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Threat</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {COMPETITORS.map((c) => (
              <tr key={c.name} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-bold text-slate-800">{c.name}</td>
                <td className="px-5 py-3 text-sm text-center text-slate-600">{c.deals}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-sm font-bold ${c.winRate >= 70 ? 'text-emerald-600' : c.winRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.winRate}%</span>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">{c.topReason}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    c.threat === 'high' ? 'bg-red-100 text-red-700' : c.threat === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>{c.threat}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  {c.trend === 'rising' ? <TrendingUp size={16} className="text-red-500 mx-auto" /> :
                   c.trend === 'declining' ? <TrendingDown size={16} className="text-emerald-500 mx-auto" /> :
                   <span className="text-xs text-slate-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ──── BATTLE CARDS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" /> Battle Cards Automáticas
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Brain size={10} /> AI</span>
        </h3>
        <div className="space-y-4">
          {BATTLE_CARDS.map((card) => (
            <div key={card.competitor} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800">vs. {card.competitor}</h4>
                <span className="text-[10px] text-slate-400">Updated: {card.lastUpdated}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-red-500 uppercase font-bold mb-1">Their Strengths</p>
                  {card.strengths.map((s) => <p key={s} className="text-xs text-slate-600 flex items-center gap-1"><AlertTriangle size={10} className="text-red-400" />{s}</p>)}
                </div>
                <div>
                  <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Their Weaknesses</p>
                  {card.weaknesses.map((w) => <p key={w} className="text-xs text-slate-600 flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />{w}</p>)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-[10px] text-blue-500 uppercase font-bold mb-0.5">Key Talk Track</p>
                <p className="text-xs text-blue-800 font-medium italic">{card.keyTalk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── POSITIONING RECOMMENDATIONS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={18} className="text-purple-500" /> Recomendaciones por Oportunidad
        </h3>
        <div className="space-y-3">
          {RECOMMENDATIONS.map((r) => (
            <div key={r.opp} className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">{r.confidence}%</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{r.opp} <span className="text-xs text-slate-400 font-normal">vs. {r.competitor}</span></p>
                <p className="text-xs text-purple-700 mt-0.5">{r.rec}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
