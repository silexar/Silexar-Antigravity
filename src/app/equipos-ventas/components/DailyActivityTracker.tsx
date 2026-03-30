/**
 * COMPONENT: DAILY ACTIVITY TRACKER — Sales Rep Activity Monitor
 * 
 * @description Tracker de actividad diaria en tiempo real. Muestra
 * calls, emails, meetings realizados hoy vs target con quick-log actions.
 */

'use client';

import React, { useState } from 'react';
import {
  Phone, Mail, Calendar, Video, FileText, Plus,
  Clock, Zap, CheckCircle
} from 'lucide-react';

/* ─── MOCK METRICS ────────────────────────────────────────────── */

interface ActivityMetric {
  type: string;
  icon: React.ElementType;
  done: number;
  target: number;
  color: string;
  bgColor: string;
}

const INITIAL_METRICS: ActivityMetric[] = [
  { type: 'Calls', icon: Phone, done: 4, target: 8, color: 'text-blue-600', bgColor: 'bg-blue-500' },
  { type: 'Emails', icon: Mail, done: 12, target: 15, color: 'text-purple-600', bgColor: 'bg-purple-500' },
  { type: 'Meetings', icon: Calendar, done: 2, target: 3, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
  { type: 'Demos', icon: Video, done: 1, target: 1, color: 'text-amber-600', bgColor: 'bg-amber-500' },
  { type: 'Proposals', icon: FileText, done: 1, target: 2, color: 'text-rose-600', bgColor: 'bg-rose-500' },
];

const RECENT_LOG = [
  { type: 'Call', client: 'TechCorp SA', time: '9:45 AM', duration: '12 min', outcome: 'Connected' },
  { type: 'Email', client: 'Retail Giant', time: '9:20 AM', duration: null, outcome: 'Sent proposal' },
  { type: 'Meeting', client: 'FinServ Solutions', time: '8:30 AM', duration: '45 min', outcome: 'Demo completed' },
  { type: 'Call', client: 'HealthTech Labs', time: '8:15 AM', duration: '5 min', outcome: 'Voicemail' },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const DailyActivityTracker = () => {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [showQuickLog, setShowQuickLog] = useState(false);

  const quickLog = (type: string) => {
    setMetrics(prev => prev.map(m => m.type === type ? { ...m, done: m.done + 1 } : m));
    setShowQuickLog(false);
  };

  const totalDone = metrics.reduce((s, m) => s + m.done, 0);
  const totalTarget = metrics.reduce((s, m) => s + m.target, 0);
  const overallPct = Math.round((totalDone / totalTarget) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* ──── HEADER ──── */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" /> Actividad de Hoy
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Clock size={10} /> Actualizado en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xl font-bold text-slate-800">{overallPct}%</p>
            <p className="text-[10px] text-slate-400">del target diario</p>
          </div>
          <button 
            onClick={() => setShowQuickLog(!showQuickLog)}
            className="bg-orange-500 text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus size={14} /> Log
          </button>
        </div>
      </div>

      {/* ──── QUICK LOG ──── */}
      {showQuickLog && (
        <div className="p-3 bg-orange-50 border-b border-orange-100 flex gap-2 flex-wrap animate-in slide-in-from-top duration-200">
          {metrics.map((m) => (
            <button key={m.type} onClick={() => quickLog(m.type)} className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-orange-200 text-xs font-semibold text-slate-700 hover:bg-orange-100 transition-colors">
              <m.icon size={12} /> +1 {m.type}
            </button>
          ))}
        </div>
      )}

      {/* ──── METRICS ──── */}
      <div className="p-5 grid grid-cols-5 gap-3">
        {metrics.map((m) => {
          const pct = Math.min(Math.round((m.done / m.target) * 100), 100);
          const completed = m.done >= m.target;
          return (
            <div key={m.type} className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center ${completed ? 'bg-emerald-100' : 'bg-slate-50'} mb-2`}>
                {completed ? <CheckCircle size={18} className="text-emerald-500" /> : <m.icon size={18} className={m.color} />}
              </div>
              <p className="text-xs font-semibold text-slate-600">{m.type}</p>
              <p className={`text-lg font-bold ${completed ? 'text-emerald-600' : m.color}`}>
                {m.done}<span className="text-xs text-slate-400">/{m.target}</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full transition-all ${completed ? 'bg-emerald-500' : m.bgColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ──── RECENT LOG ──── */}
      <div className="border-t border-slate-50">
        <div className="px-5 py-3 flex justify-between items-center">
          <p className="text-xs font-semibold text-slate-400 uppercase">Log reciente</p>
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_LOG.map((entry, idx) => (
            <div key={idx} className="px-5 py-2.5 flex items-center gap-3 text-xs">
              <span className="text-slate-300 w-14 font-mono">{entry.time}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                entry.type === 'Call' ? 'bg-blue-100 text-blue-600' :
                entry.type === 'Email' ? 'bg-purple-100 text-purple-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>{entry.type}</span>
              <span className="font-semibold text-slate-700">{entry.client}</span>
              {entry.duration && <span className="text-slate-400">{entry.duration}</span>}
              <span className="text-slate-400 ml-auto">{entry.outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
