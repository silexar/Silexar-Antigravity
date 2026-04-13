/**
 * COMPONENT: PIPELINE WATERFALL — VP Revenue Flow Visualization
 * 
 * @description Visualización del flujo de pipeline: cómo deals fluyen
 * de stage a stage con valores, conversion rates, y velocity.
 */

'use client';

import React from 'react';
import {
  TrendingUp, Clock,
  ChevronRight, BarChart3, Zap
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const STAGES = [
  { name: 'Prospects', deals: 145, value: 12400000, conversion: 62, avgDays: 5, color: 'bg-slate-400' },
  { name: 'Qualified', deals: 90, value: 8700000, conversion: 55, avgDays: 12, color: 'bg-blue-500' },
  { name: 'Proposal', deals: 50, value: 5200000, conversion: 68, avgDays: 8, color: 'bg-indigo-500' },
  { name: 'Negotiation', deals: 34, value: 3800000, conversion: 76, avgDays: 15, color: 'bg-purple-500' },
  { name: 'Closed Won', deals: 26, value: 4200000, conversion: 100, avgDays: 0, color: 'bg-emerald-500' },
];

const VELOCITY_METRICS = [
  { label: 'Avg Deal Size', value: '$85K', change: '+8%' },
  { label: 'Avg Cycle', value: '42d', change: '-3d' },
  { label: 'Pipeline Velocity', value: '$147K/d', change: '+15%' },
  { label: 'Stage Conversion', value: '65%', change: '+4pp' },
];

const fmt = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

/* ─── COMPONENT ───────────────────────────────────────────── */

export const PipelineWaterfall = () => {
  const maxValue = Math.max(...STAGES.map(s => s.value));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.2),transparent_60%)]" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-300">Pipeline Waterfall</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">Revenue Flow Analysis</h2>
            <p className="text-purple-300 text-sm">145 deals → $4.2M closed</p>
          </div>
        </div>
      </div>

      {/* ──── WATERFALL CHART ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Zap size={18} className="text-indigo-500" /> Stage-to-Stage Flow
        </h3>
        <div className="flex items-end gap-2">
          {STAGES.map((stage, idx) => {
            const height = Math.max(20, (stage.value / maxValue) * 200);
            return (
              <React.Fragment key={stage.name}>
                <div className="flex-1 flex flex-col items-center">
                  {/* Value */}
                  <p className="text-xs font-bold text-slate-800 mb-1">{fmt(stage.value)}</p>
                  <p className="text-[10px] text-slate-400 mb-2">{stage.deals} deals</p>
                  {/* Bar */}
                  <div className={`w-full rounded-t-xl ${stage.color} transition-all duration-700 relative group cursor-pointer hover:opacity-90`} style={{ height: `${height}px` }}>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-16 inset-x-0 hidden group-hover:flex flex-col items-center">
                      <div className="bg-[#F0EDE8] text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap">
                        {stage.avgDays > 0 ? `${stage.avgDays}d avg` : 'Closed'} • {stage.conversion}% conv
                      </div>
                    </div>
                  </div>
                  {/* Label */}
                  <p className="text-[10px] font-semibold text-slate-600 mt-2 text-center">{stage.name}</p>
                </div>
                {/* Arrow between stages */}
                {idx < STAGES.length - 1 && (
                  <div className="flex flex-col items-center pb-8 px-1">
                    <span className="text-[9px] font-bold text-emerald-600 mb-1">{STAGES[idx + 1].conversion}%</span>
                    <ChevronRight size={12} className="text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ──── VELOCITY METRICS ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VELOCITY_METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">{m.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{m.value}</p>
            <p className="text-xs text-emerald-500 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> {m.change}
            </p>
          </div>
        ))}
      </div>

      {/* ──── STAGE BREAKDOWN TABLE ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" /> Stage Detail
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Stage</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Deals</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Value</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Conversion</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Avg Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {STAGES.map((s) => (
              <tr key={s.name} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                </td>
                <td className="px-5 py-3 text-sm text-center text-slate-600">{s.deals}</td>
                <td className="px-5 py-3 text-sm text-right font-mono font-semibold text-emerald-600">{fmt(s.value)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.conversion >= 70 ? 'bg-emerald-100 text-emerald-700' : s.conversion >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{s.conversion}%</span>
                </td>
                <td className="px-5 py-3 text-sm text-center text-slate-500">{s.avgDays > 0 ? `${s.avgDays}d` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
