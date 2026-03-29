/**
 * COMPONENT: TEAM PULSE PANEL — Real-Time Team Activity Monitor
 * 
 * @description Permite al Manager ver quién está activo, deals estancados,
 * reps sin actividad, y alertas de equipo en tiempo real.
 */

'use client';

import React from 'react';
import {
  Activity, AlertTriangle, CheckCircle,
  Phone, Mail,
  Eye
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

interface RepStatus {
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  todayCalls: number;
  todayEmails: number;
  dealsStuck: number;
  attainment: number;
  mood: 'green' | 'yellow' | 'red';
}

const REPS: RepStatus[] = [
  { name: 'Ana García', status: 'active', lastActivity: 'Call with TechCorp — 5 min ago', todayCalls: 6, todayEmails: 14, dealsStuck: 0, attainment: 141, mood: 'green' },
  { name: 'Roberto Silva', status: 'active', lastActivity: 'Logged email to Retail Giant — 22 min ago', todayCalls: 3, todayEmails: 8, dealsStuck: 1, attainment: 121, mood: 'green' },
  { name: 'María López', status: 'idle', lastActivity: 'Last activity 3 hours ago', todayCalls: 1, todayEmails: 2, dealsStuck: 2, attainment: 72, mood: 'yellow' },
  { name: 'Carlos Chen', status: 'active', lastActivity: 'Meeting with FinServ — 1 hr ago', todayCalls: 4, todayEmails: 6, dealsStuck: 0, attainment: 45, mood: 'red' },
  { name: 'Sofia Rodríguez', status: 'offline', lastActivity: 'Not logged in today', todayCalls: 0, todayEmails: 0, dealsStuck: 3, attainment: 88, mood: 'yellow' },
];

const TEAM_ALERTS = [
  { type: 'warning', text: 'Sofia Rodríguez — Not logged in today. 3 deals with no activity 5+ days.' },
  { type: 'risk', text: 'Carlos Chen — 45% attainment, needs pipeline build urgently.' },
  { type: 'stuck', text: '6 deals across team with 0 activity in 7+ days.' },
  { type: 'positive', text: 'Ana García — On track for President\'s Club (141% attainment).' },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const TeamPulsePanel = () => {
  const activeCount = REPS.filter(r => r.status === 'active').length;
  const totalStuck = REPS.reduce((s, r) => s + r.dealsStuck, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-purple-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Team Pulse</span>
              <span className="ml-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-purple-200">Live</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">Estado del Equipo en Tiempo Real</h2>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center border border-white/10">
              <p className="text-2xl font-bold">{activeCount}/{REPS.length}</p>
              <p className="text-[10px] text-purple-200 uppercase font-semibold">Active Now</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center border border-white/10">
              <p className="text-2xl font-bold text-amber-300">{totalStuck}</p>
              <p className="text-[10px] text-purple-200 uppercase font-semibold">Deals Stuck</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── REP STATUS CARDS ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPS.map((rep) => (
          <div key={rep.name} className={`bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all cursor-pointer ${
            rep.mood === 'red' ? 'border-red-200' : rep.mood === 'yellow' ? 'border-amber-200' : 'border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  rep.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                  rep.status === 'idle' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
                <p className="font-bold text-slate-800 text-sm">{rep.name}</p>
              </div>
              <span className={`text-sm font-bold ${
                rep.attainment >= 100 ? 'text-emerald-600' : rep.attainment >= 70 ? 'text-amber-600' : 'text-red-600'
              }`}>{rep.attainment}%</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{rep.lastActivity}</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <Phone size={12} className="text-blue-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800 mt-0.5">{rep.todayCalls}</p>
                <p className="text-[9px] text-slate-400">calls</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <Mail size={12} className="text-purple-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800 mt-0.5">{rep.todayEmails}</p>
                <p className="text-[9px] text-slate-400">emails</p>
              </div>
              <div className={`rounded-lg p-2 text-center ${rep.dealsStuck > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                <AlertTriangle size={12} className={rep.dealsStuck > 0 ? 'text-red-500 mx-auto' : 'text-slate-300 mx-auto'} />
                <p className={`text-xs font-bold mt-0.5 ${rep.dealsStuck > 0 ? 'text-red-600' : 'text-slate-800'}`}>{rep.dealsStuck}</p>
                <p className="text-[9px] text-slate-400">stuck</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ──── TEAM ALERTS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Eye size={18} className="text-violet-500" /> Alertas del Equipo
        </h3>
        <div className="space-y-2">
          {TEAM_ALERTS.map((alert, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${
              alert.type === 'risk' ? 'bg-red-50 border-red-200' :
              alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              alert.type === 'stuck' ? 'bg-orange-50 border-orange-200' :
              'bg-emerald-50 border-emerald-200'
            }`}>
              {alert.type === 'positive'
                ? <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                : <AlertTriangle size={14} className={`mt-0.5 flex-shrink-0 ${
                    alert.type === 'risk' ? 'text-red-500' : 'text-amber-500'
                  }`} />
              }
              <p className="text-sm text-slate-700">{alert.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
